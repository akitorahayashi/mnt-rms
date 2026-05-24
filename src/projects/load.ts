import { constants } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { motionCatalog } from '../captions/motion';
import { styleCatalog } from '../captions/style';
import type {
  AudioTrackDefinition,
  CaptionCue,
  MediaClipDefinition,
  Spec,
  VideoCanvas,
} from '../video/definition';

export interface LoadedSpec {
  definition: Spec;
  directoryPath: string;
  filePath: string;
}

export async function loadSpec(
  requestedProjectPath: string,
): Promise<LoadedSpec> {
  const absoluteRequestedPath = path.resolve(requestedProjectPath);
  const projectFilePath = await resolveProjectFilePath(absoluteRequestedPath);
  const importedModule = await importProjectModule(projectFilePath);
  const definition = validateSpec(importedModule.default);

  return {
    definition,
    directoryPath: path.dirname(projectFilePath),
    filePath: projectFilePath,
  };
}

async function resolveProjectFilePath(
  absoluteRequestedPath: string,
): Promise<string> {
  const entry = await stat(absoluteRequestedPath).catch(() => null);

  if (entry === null) {
    throw new Error(`Project path does not exist: ${absoluteRequestedPath}`);
  }

  if (entry.isDirectory()) {
    const projectFilePath = path.join(absoluteRequestedPath, 'project.ts');
    await access(projectFilePath, constants.R_OK).catch(() => {
      throw new Error(`Missing readable project.ts: ${projectFilePath}`);
    });
    return projectFilePath;
  }

  if (!entry.isFile()) {
    throw new Error(
      `Project path must be a directory or project.ts file: ${absoluteRequestedPath}`,
    );
  }

  if (path.basename(absoluteRequestedPath) !== 'project.ts') {
    throw new Error(
      `Project file must be named project.ts: ${absoluteRequestedPath}`,
    );
  }

  await access(absoluteRequestedPath, constants.R_OK).catch(() => {
    throw new Error(`Project file is not readable: ${absoluteRequestedPath}`);
  });

  return absoluteRequestedPath;
}

async function importProjectModule(
  projectFilePath: string,
): Promise<Record<string, unknown>> {
  const cacheBust = Date.now();
  const projectModuleUrl = `${pathToFileURL(projectFilePath).href}?v=${cacheBust}`;
  const importedModule = (await import(projectModuleUrl)) as Record<
    string,
    unknown
  >;

  return importedModule;
}

function validateSpec(value: unknown): Spec {
  const project = requireRecord(value, 'project.default');
  const canvas = validateCanvas(project.canvas);
  const clips = validateClips(project.clips);
  const captions = validateCaptions(project.captions);
  const audio = validateAudio(project.audio);

  return {
    audio,
    backgroundColor: requireNonEmptyString(
      project.backgroundColor,
      'project.backgroundColor',
    ),
    canvas,
    captions,
    clips,
    id: requireNonEmptyString(project.id, 'project.id'),
    outputFileName: requireNonEmptyString(
      project.outputFileName,
      'project.outputFileName',
    ),
  };
}

function validateCanvas(value: unknown): VideoCanvas {
  const canvas = requireRecord(value, 'project.canvas');

  return {
    durationInFrames: requirePositiveNumber(
      canvas.durationInFrames,
      'project.canvas.durationInFrames',
    ),
    fps: requirePositiveNumber(canvas.fps, 'project.canvas.fps'),
    height: requirePositiveNumber(canvas.height, 'project.canvas.height'),
    width: requirePositiveNumber(canvas.width, 'project.canvas.width'),
  };
}

function validateClips(value: unknown): MediaClipDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error('project.clips must be an array');
  }

  if (value.length < 1) {
    throw new Error('project.clips must contain at least one clip');
  }

  return value.map((clipValue, index) => validateClip(clipValue, index));
}

function validateClip(value: unknown, index: number): MediaClipDefinition {
  const clip = requireRecord(value, `project.clips[${index}]`);
  const fit = clip.fit;

  if (fit !== 'contain' && fit !== 'cover') {
    throw new Error(`project.clips[${index}].fit must be "contain" or "cover"`);
  }

  return {
    fit,
    id: requireNonEmptyString(clip.id, `project.clips[${index}].id`),
    mediaPath: requireNonEmptyString(
      clip.mediaPath,
      `project.clips[${index}].mediaPath`,
    ),
    trimAfterInFrames: requireOptionalNonNegativeNumber(
      clip.trimAfterInFrames,
      `project.clips[${index}].trimAfterInFrames`,
    ),
    trimBeforeInFrames: requireOptionalNonNegativeNumber(
      clip.trimBeforeInFrames,
      `project.clips[${index}].trimBeforeInFrames`,
    ),
    volume: requireOptionalNonNegativeNumber(
      clip.volume,
      `project.clips[${index}].volume`,
    ),
  };
}

function validateCaptions(value: unknown): CaptionCue[] {
  if (!Array.isArray(value)) {
    throw new Error('project.captions must be an array');
  }

  const knownStyleNames = new Set(Object.keys(styleCatalog));
  const knownMotionNames = new Set(Object.keys(motionCatalog));

  return value.map((captionValue, index) =>
    validateCaption(captionValue, index, knownStyleNames, knownMotionNames),
  );
}

function validateCaption(
  value: unknown,
  index: number,
  knownStyleNames: Set<string>,
  knownMotionNames: Set<string>,
): CaptionCue {
  const cue = requireRecord(value, `project.captions[${index}]`);
  const styleName = requireNonEmptyString(
    cue.styleName,
    `project.captions[${index}].styleName`,
  );

  if (!knownStyleNames.has(styleName)) {
    throw new Error(
      `Unknown caption styleName "${styleName}". Available styles: ${[...knownStyleNames].join(', ')}`,
    );
  }

  const motionName = requireOptionalString(
    cue.motionName,
    `project.captions[${index}].motionName`,
  );

  if (motionName !== undefined && !knownMotionNames.has(motionName)) {
    throw new Error(
      `Unknown caption motionName "${motionName}". Available motions: ${[...knownMotionNames].join(', ')}`,
    );
  }

  return {
    durationInFrames: requirePositiveNumber(
      cue.durationInFrames,
      `project.captions[${index}].durationInFrames`,
    ),
    from: requireNonNegativeNumber(cue.from, `project.captions[${index}].from`),
    id: requireNonEmptyString(cue.id, `project.captions[${index}].id`),
    motionName: motionName as CaptionCue['motionName'],
    styleName: styleName as CaptionCue['styleName'],
    text: requireNonEmptyString(cue.text, `project.captions[${index}].text`),
  };
}

function validateAudio(value: unknown): AudioTrackDefinition {
  const audio = requireRecord(value, 'project.audio');

  return {
    mediaPath: requireNonEmptyString(
      audio.mediaPath,
      'project.audio.mediaPath',
    ),
    trimAfter: requirePositiveNumber(
      audio.trimAfter,
      'project.audio.trimAfter',
    ),
    trimBefore: requireNonNegativeNumber(
      audio.trimBefore,
      'project.audio.trimBefore',
    ),
    volume: requireNonNegativeNumber(audio.volume, 'project.audio.volume'),
  };
}

function requireRecord(
  value: unknown,
  fieldName: string,
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`);
  }

  return value as Record<string, unknown>;
}

function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return value;
}

function requireOptionalString(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} must be a non-empty string when provided`);
  }

  return value;
}

function requirePositiveNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return value;
}

function requireNonNegativeNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }

  return value;
}

function requireOptionalNonNegativeNumber(
  value: unknown,
  fieldName: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireNonNegativeNumber(value, fieldName);
}
