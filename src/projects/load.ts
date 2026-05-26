import { constants } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { motionCatalog } from '../captions/motion';
import { styleCatalog } from '../captions/style';
import {
  type AudioLaneName,
  type AudioLanes,
  flattenAudioLanes,
  type Project,
} from '../timeline/project';

export interface LoadedProject {
  definition: Project;
  directoryPath: string;
  filePath: string;
}

export async function loadProject(
  requestedProjectPath: string,
): Promise<LoadedProject> {
  const absoluteRequestedPath = path.resolve(requestedProjectPath);
  const projectFilePath = await resolveProjectFilePath(absoluteRequestedPath);
  const importedModule = await importProjectModule(projectFilePath);
  const projectRootPath = path.dirname(projectFilePath);
  const definition = validateProject(importedModule.default, projectRootPath);

  return {
    definition,
    directoryPath: projectRootPath,
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

function validateProject(value: unknown, projectRootPath: string): Project {
  const project = requireRecord(value, 'project.default');
  const knownStyleNames = new Set(Object.keys(styleCatalog));
  const knownMotionNames = new Set(Object.keys(motionCatalog));
  const canvas = validateCanvas(project.canvas);
  const clips = validateClips(project.clips, projectRootPath);
  const subtitleDefaults = validateSubtitleDefaults(
    project.subtitleDefaults,
    knownStyleNames,
    knownMotionNames,
  );
  const subtitles = validateSubtitles(
    project.subtitles,
    knownStyleNames,
    knownMotionNames,
  );
  const overlays = validateOverlays(
    project.overlays,
    projectRootPath,
    knownStyleNames,
    knownMotionNames,
  );
  const audio = validateAudio(project.audio, projectRootPath);

  return {
    audio,
    backgroundColor: requireNonEmptyString(
      project.backgroundColor,
      'project.backgroundColor',
    ),
    canvas,
    clips,
    id: requirePathSegment(project.id, 'project.id'),
    overlays,
    outputFileName: requirePathSegment(
      project.outputFileName,
      'project.outputFileName',
    ),
    subtitleDefaults,
    subtitles,
  };
}

function validateCanvas(value: unknown): Project['canvas'] {
  const canvas = requireRecord(value, 'project.canvas');

  return {
    durationSeconds: requirePositiveNumber(
      canvas.durationSeconds,
      'project.canvas.durationSeconds',
    ),
    fps: requirePositiveNumber(canvas.fps, 'project.canvas.fps'),
    height: requirePositiveNumber(canvas.height, 'project.canvas.height'),
    width: requirePositiveNumber(canvas.width, 'project.canvas.width'),
  };
}

function validateClips(
  value: unknown,
  projectRootPath: string,
): Project['clips'] {
  if (!Array.isArray(value)) {
    throw new Error('project.clips must be an array');
  }

  if (value.length < 1) {
    throw new Error('project.clips must contain at least one clip');
  }

  return value.map((clipValue, index) =>
    validateClip(clipValue, index, projectRootPath),
  );
}

function validateClip(
  value: unknown,
  index: number,
  projectRootPath: string,
): Project['clips'][number] {
  const clip = requireRecord(value, `project.clips[${index}]`);
  const fit = clip.fit;

  if (fit !== 'contain' && fit !== 'cover') {
    throw new Error(`project.clips[${index}].fit must be "contain" or "cover"`);
  }

  return {
    fit,
    id: requireNonEmptyString(clip.id, `project.clips[${index}].id`),
    mediaPath: requireProjectRelativePath(
      clip.mediaPath,
      `project.clips[${index}].mediaPath`,
      projectRootPath,
    ),
    startSeconds: requireNonNegativeNumber(
      clip.startSeconds,
      `project.clips[${index}].startSeconds`,
    ),
    transition: requireOptionalTransition(
      clip.transition,
      `project.clips[${index}].transition`,
    ),
    trimAfterSeconds: requireOptionalNonNegativeNumber(
      clip.trimAfterSeconds,
      `project.clips[${index}].trimAfterSeconds`,
    ),
    trimBeforeSeconds: requireOptionalNonNegativeNumber(
      clip.trimBeforeSeconds,
      `project.clips[${index}].trimBeforeSeconds`,
    ),
    volume: requireNonNegativeNumber(
      clip.volume,
      `project.clips[${index}].volume`,
    ),
  };
}

function validateSubtitleDefaults(
  value: unknown,
  knownStyleNames: Set<string>,
  knownMotionNames: Set<string>,
): Project['subtitleDefaults'] {
  const defaults = requireRecord(value, 'project.subtitleDefaults');
  const styleName = requireKnownStyleName(
    defaults.styleName,
    'project.subtitleDefaults.styleName',
    knownStyleNames,
  );
  const motionName = requireKnownMotionName(
    defaults.motionName,
    'project.subtitleDefaults.motionName',
    knownMotionNames,
  );

  return {
    motionName,
    styleName,
    x: requireFiniteNumber(defaults.x, 'project.subtitleDefaults.x'),
    y: requireFiniteNumber(defaults.y, 'project.subtitleDefaults.y'),
  };
}

function validateSubtitles(
  value: unknown,
  knownStyleNames: Set<string>,
  knownMotionNames: Set<string>,
): Project['subtitles'] {
  if (!Array.isArray(value)) {
    throw new Error('project.subtitles must be an array');
  }

  return value.map((captionValue, index) =>
    validateSubtitle(captionValue, index, knownStyleNames, knownMotionNames),
  );
}

function validateSubtitle(
  value: unknown,
  index: number,
  knownStyleNames: Set<string>,
  knownMotionNames: Set<string>,
): Project['subtitles'][number] {
  const subtitle = requireRecord(value, `project.subtitles[${index}]`);

  return {
    durationSeconds: requirePositiveNumber(
      subtitle.durationSeconds,
      `project.subtitles[${index}].durationSeconds`,
    ),
    startSeconds: requireNonNegativeNumber(
      subtitle.startSeconds,
      `project.subtitles[${index}].startSeconds`,
    ),
    id: requireNonEmptyString(subtitle.id, `project.subtitles[${index}].id`),
    motionName: requireOptionalKnownMotionName(
      subtitle.motionName,
      `project.subtitles[${index}].motionName`,
      knownMotionNames,
    ),
    styleName: requireOptionalKnownStyleName(
      subtitle.styleName,
      `project.subtitles[${index}].styleName`,
      knownStyleNames,
    ),
    text: requireNonEmptyString(
      subtitle.text,
      `project.subtitles[${index}].text`,
    ),
    x: requireOptionalFiniteNumber(subtitle.x, `project.subtitles[${index}].x`),
    y: requireOptionalFiniteNumber(subtitle.y, `project.subtitles[${index}].y`),
  };
}

function validateOverlays(
  value: unknown,
  projectRootPath: string,
  knownStyleNames: Set<string>,
  knownMotionNames: Set<string>,
): Project['overlays'] {
  if (!Array.isArray(value)) {
    throw new Error('project.overlays must be an array');
  }

  return value
    .map((overlayValue, index) =>
      validateOverlay(
        overlayValue,
        index,
        projectRootPath,
        knownStyleNames,
        knownMotionNames,
      ),
    )
    .sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
}

function validateOverlay(
  value: unknown,
  index: number,
  projectRootPath: string,
  knownStyleNames: Set<string>,
  knownMotionNames: Set<string>,
): Project['overlays'][number] {
  const overlay = requireRecord(value, `project.overlays[${index}]`);
  const kind = requireNonEmptyString(
    overlay.kind,
    `project.overlays[${index}].kind`,
  );
  const base = {
    durationSeconds: requirePositiveNumber(
      overlay.durationSeconds,
      `project.overlays[${index}].durationSeconds`,
    ),
    id: requireNonEmptyString(overlay.id, `project.overlays[${index}].id`),
    layer: requireOptionalFiniteNumber(
      overlay.layer,
      `project.overlays[${index}].layer`,
    ),
    startSeconds: requireNonNegativeNumber(
      overlay.startSeconds,
      `project.overlays[${index}].startSeconds`,
    ),
    x: requireFiniteNumber(overlay.x, `project.overlays[${index}].x`),
    y: requireFiniteNumber(overlay.y, `project.overlays[${index}].y`),
  };

  if (kind === 'text') {
    return {
      ...base,
      kind: 'text',
      motionName: requireOptionalKnownMotionName(
        overlay.motionName,
        `project.overlays[${index}].motionName`,
        knownMotionNames,
      ),
      styleName: requireOptionalKnownStyleName(
        overlay.styleName,
        `project.overlays[${index}].styleName`,
        knownStyleNames,
      ),
      text: requireNonEmptyString(
        overlay.text,
        `project.overlays[${index}].text`,
      ),
    };
  }

  if (kind === 'image') {
    const fit = overlay.fit;

    if (fit !== undefined && fit !== 'contain' && fit !== 'cover') {
      throw new Error(
        `project.overlays[${index}].fit must be "contain" or "cover" when provided`,
      );
    }

    return {
      ...base,
      fit,
      height: requirePositiveNumber(
        overlay.height,
        `project.overlays[${index}].height`,
      ),
      kind: 'image',
      mediaPath: requireProjectRelativePath(
        overlay.mediaPath,
        `project.overlays[${index}].mediaPath`,
        projectRootPath,
      ),
      opacity: requireOptionalNumberInRange(
        overlay.opacity,
        `project.overlays[${index}].opacity`,
        0,
        1,
      ),
      width: requirePositiveNumber(
        overlay.width,
        `project.overlays[${index}].width`,
      ),
    };
  }

  throw new Error(`project.overlays[${index}].kind must be "text" or "image"`);
}

function validateAudio(
  value: unknown,
  projectRootPath: string,
): Project['audio'] {
  if (Array.isArray(value)) {
    throw new Error(
      'project.audio must be an object with narration, music, and effects lanes',
    );
  }

  const audio = requireRecord(value, 'project.audio');
  const lanes: AudioLanes = {
    effects: validateAudioLane(audio.effects, 'effects', projectRootPath),
    music: validateAudioLane(audio.music, 'music', projectRootPath),
    narration: validateAudioLane(audio.narration, 'narration', projectRootPath),
  };
  const flatAudio = flattenAudioLanes(lanes);

  if (flatAudio.length < 1) {
    throw new Error('project.audio must contain at least one audio clip');
  }

  return flatAudio;
}

function validateAudioLane(
  value: unknown,
  laneName: AudioLaneName,
  projectRootPath: string,
): AudioLanes[AudioLaneName] {
  if (!Array.isArray(value)) {
    throw new Error(`project.audio.${laneName} must be an array`);
  }

  return value.map((audioValue, index) =>
    validateAudioClip(audioValue, laneName, index, projectRootPath),
  );
}

function validateAudioClip(
  value: unknown,
  laneName: AudioLaneName,
  index: number,
  projectRootPath: string,
): Project['audio'][number] {
  const fieldPrefix = `project.audio.${laneName}[${index}]`;
  const audio = requireRecord(value, fieldPrefix);

  return {
    durationSeconds: requirePositiveNumber(
      audio.durationSeconds,
      `${fieldPrefix}.durationSeconds`,
    ),
    startSeconds: requireNonNegativeNumber(
      audio.startSeconds,
      `${fieldPrefix}.startSeconds`,
    ),
    id: requireNonEmptyString(audio.id, `${fieldPrefix}.id`),
    loop: requireOptionalBoolean(audio.loop, `${fieldPrefix}.loop`),
    mediaPath: requireProjectRelativePath(
      audio.mediaPath,
      `${fieldPrefix}.mediaPath`,
      projectRootPath,
    ),
    trimAfterSeconds: requireOptionalNonNegativeNumber(
      audio.trimAfterSeconds,
      `${fieldPrefix}.trimAfterSeconds`,
    ),
    trimBeforeSeconds: requireNonNegativeNumber(
      audio.trimBeforeSeconds,
      `${fieldPrefix}.trimBeforeSeconds`,
    ),
    volume: requireNonNegativeNumber(audio.volume, `${fieldPrefix}.volume`),
  };
}

function requireKnownStyleName(
  value: unknown,
  fieldName: string,
  knownStyleNames: Set<string>,
): Project['subtitleDefaults']['styleName'] {
  const styleName = requireNonEmptyString(value, fieldName);

  if (!knownStyleNames.has(styleName)) {
    throw new Error(
      `Unknown caption styleName "${styleName}". Available styles: ${[...knownStyleNames].join(', ')}`,
    );
  }

  return styleName as Project['subtitleDefaults']['styleName'];
}

function requireKnownMotionName(
  value: unknown,
  fieldName: string,
  knownMotionNames: Set<string>,
): Project['subtitleDefaults']['motionName'] {
  const motionName = requireNonEmptyString(value, fieldName);

  if (!knownMotionNames.has(motionName)) {
    throw new Error(
      `Unknown caption motionName "${motionName}". Available motions: ${[...knownMotionNames].join(', ')}`,
    );
  }

  return motionName as Project['subtitleDefaults']['motionName'];
}

function requireOptionalKnownStyleName(
  value: unknown,
  fieldName: string,
  knownStyleNames: Set<string>,
): Project['subtitleDefaults']['styleName'] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireKnownStyleName(value, fieldName, knownStyleNames);
}

function requireOptionalKnownMotionName(
  value: unknown,
  fieldName: string,
  knownMotionNames: Set<string>,
): Project['subtitleDefaults']['motionName'] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireKnownMotionName(value, fieldName, knownMotionNames);
}

function requireFiniteNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  return value;
}

function requireOptionalFiniteNumber(
  value: unknown,
  fieldName: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireFiniteNumber(value, fieldName);
}

function requireOptionalNumberInRange(
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const numberValue = requireFiniteNumber(value, fieldName);

  if (numberValue < min || numberValue > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }

  return numberValue;
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

function requireOptionalBoolean(
  value: unknown,
  fieldName: string,
): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean when provided`);
  }

  return value;
}

function requirePathSegment(value: unknown, fieldName: string): string {
  const segment = requireNonEmptyString(value, fieldName);

  if (
    path.isAbsolute(segment) ||
    segment === '.' ||
    segment === '..' ||
    segment.includes('/') ||
    segment.includes('\\')
  ) {
    throw new Error(`${fieldName} must be a single safe path segment`);
  }

  return segment;
}

function requireProjectRelativePath(
  value: unknown,
  fieldName: string,
  projectRootPath: string,
): string {
  const candidate = requireNonEmptyString(value, fieldName);

  if (path.isAbsolute(candidate)) {
    throw new Error(`${fieldName} must be relative to the project directory`);
  }

  const normalizedPath = path.normalize(candidate);

  if (
    normalizedPath === '..' ||
    normalizedPath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(normalizedPath)
  ) {
    throw new Error(`${fieldName} must stay inside the project directory`);
  }

  const resolvedPath = path.resolve(projectRootPath, normalizedPath);
  const relativePath = path.relative(projectRootPath, resolvedPath);

  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`${fieldName} must stay inside the project directory`);
  }

  return normalizedPath;
}

function requireOptionalTransition(
  value: unknown,
  fieldName: string,
): Project['clips'][number]['transition'] {
  if (value === undefined) {
    return undefined;
  }

  const transition = requireRecord(value, fieldName);
  const kind = requireNonEmptyString(transition.kind, `${fieldName}.kind`);

  if (kind === 'cut') {
    if (transition.durationSeconds !== undefined) {
      throw new Error(
        `${fieldName}.durationSeconds is not allowed when kind is "cut"`,
      );
    }

    return { kind };
  }

  if (kind === 'crossfade') {
    return {
      durationSeconds: requirePositiveNumber(
        transition.durationSeconds,
        `${fieldName}.durationSeconds`,
      ),
      kind,
    };
  }

  throw new Error(`${fieldName}.kind must be "cut" or "crossfade"`);
}
