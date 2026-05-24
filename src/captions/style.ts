import type { CSSProperties } from 'react';

export const styleCatalog = {
  centerHeadline: {
    color: '#fff7db',
    fontFamily: 'Hiragino Sans, Yu Gothic, sans-serif',
    fontSize: 82,
    fontWeight: 900,
    left: '50%',
    letterSpacing: '-0.04em',
    lineHeight: 1.12,
    maxWidth: 920,
    position: 'absolute',
    textAlign: 'center',
    textShadow:
      '0 9px 0 #101010, 9px 0 0 #101010, -9px 0 0 #101010, 0 -9px 0 #101010, 0 18px 28px rgba(0, 0, 0, 0.55)',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'max-content',
  },
} satisfies Record<string, CSSProperties>;
