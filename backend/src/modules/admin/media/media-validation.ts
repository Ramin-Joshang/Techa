import path from 'node:path';
import { MediaType } from '@techa/shared';
import { env } from '../../../core/config/env';

export interface AllowedMediaSpec {
  mimeType: string;
  mediaType: MediaType;
  extensions: readonly string[];
  canonicalExt: string;
}

export const ALLOWED_MEDIA_SPECS: readonly AllowedMediaSpec[] = [
  {
    mimeType: 'image/jpeg',
    mediaType: 'image',
    extensions: ['.jpg', '.jpeg'],
    canonicalExt: 'jpg',
  },
  {
    mimeType: 'image/png',
    mediaType: 'image',
    extensions: ['.png'],
    canonicalExt: 'png',
  },
  {
    mimeType: 'image/webp',
    mediaType: 'image',
    extensions: ['.webp'],
    canonicalExt: 'webp',
  },
  {
    mimeType: 'image/gif',
    mediaType: 'image',
    extensions: ['.gif'],
    canonicalExt: 'gif',
  },
  {
    mimeType: 'video/mp4',
    mediaType: 'video',
    extensions: ['.mp4', '.m4v'],
    canonicalExt: 'mp4',
  },
  {
    mimeType: 'video/x-m4v',
    mediaType: 'video',
    extensions: ['.m4v', '.mp4'],
    canonicalExt: 'm4v',
  },
  {
    mimeType: 'video/quicktime',
    mediaType: 'video',
    extensions: ['.mov'],
    canonicalExt: 'mov',
  },
  {
    mimeType: 'video/webm',
    mediaType: 'video',
    extensions: ['.webm'],
    canonicalExt: 'webm',
  },
  {
    mimeType: 'video/ogg',
    mediaType: 'video',
    extensions: ['.ogv', '.ogg'],
    canonicalExt: 'ogv',
  },
  {
    mimeType: 'application/pdf',
    mediaType: 'document',
    extensions: ['.pdf'],
    canonicalExt: 'pdf',
  },
  {
    mimeType: 'application/zip',
    mediaType: 'document',
    extensions: ['.zip'],
    canonicalExt: 'zip',
  },
  {
    mimeType: 'application/x-zip-compressed',
    mediaType: 'document',
    extensions: ['.zip'],
    canonicalExt: 'zip',
  },
];

export const FORBIDDEN_MIME_OR_EXT = new Set([
  '.svg',
  '.html',
  '.htm',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.php',
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
]);

export function sanitizeOriginalFilename(rawName: string): string {
  const base = path.basename(rawName || 'upload').replace(/[\x00-\x1f\x7f\\/:*?"<>|]/g, '_').trim();
  if (!base) return 'file';
  return base.slice(0, 255);
}

export function getSpecByMimeType(mimeType: string): AllowedMediaSpec | null {
  const normalized = (mimeType || '').split(';')[0].trim().toLowerCase();
  return ALLOWED_MEDIA_SPECS.find((s) => s.mimeType === normalized) || null;
}

export function getSpecByExtension(ext: string): AllowedMediaSpec | null {
  const normalized = (ext || '').trim().toLowerCase();
  if (!normalized) return null;
  return ALLOWED_MEDIA_SPECS.find((s) => s.extensions.includes(normalized)) || null;
}

/**
 * Resolves the allowed media spec from MIME type, falling back to extension
 * only when the browser sends an ambiguous generic MIME (e.g. application/octet-stream).
 * Actual binary content is always verified afterward via Magic Bytes.
 */
export function resolveAllowedMediaSpec(
  claimedMimeType: string,
  ext: string
): AllowedMediaSpec | null {
  const normalizedMime = (claimedMimeType || '').split(';')[0].trim().toLowerCase();
  const byMime = getSpecByMimeType(normalizedMime);
  if (byMime) {
    // Normalize zip alias to canonical application/zip
    if (byMime.mimeType === 'application/x-zip-compressed') {
      return getSpecByMimeType('application/zip');
    }
    return byMime;
  }

  if (
    (!normalizedMime ||
      normalizedMime === 'application/octet-stream' ||
      normalizedMime === 'binary/octet-stream') &&
    ext
  ) {
    return getSpecByExtension(ext);
  }

  return null;
}

export interface MediaSizeLimitsBytes {
  image: number;
  video: number;
  document: number;
}

export function getDefaultMediaLimitsBytes(): MediaSizeLimitsBytes {
  return {
    image: env.MEDIA_MAX_IMAGE_BYTES,
    video: env.MEDIA_MAX_VIDEO_BYTES,
    document: env.MEDIA_MAX_DOCUMENT_BYTES,
  };
}

export function getMaxBytesForMediaType(
  mediaType: MediaType,
  limits: MediaSizeLimitsBytes = getDefaultMediaLimitsBytes()
): number {
  switch (mediaType) {
    case 'image':
      return limits.image;
    case 'video':
      return limits.video;
    case 'document':
      return limits.document;
  }
}

/**
 * Inspects file header magic bytes to confirm actual binary signature matches expected MIME type.
 */
export function verifyMagicBytes(headerBuffer: Buffer, expectedMimeType: string): boolean {
  if (!headerBuffer || headerBuffer.length < 4) {
    return false;
  }

  switch (expectedMimeType) {
    case 'image/jpeg':
      // FF D8 FF
      return (
        headerBuffer.length >= 3 &&
        headerBuffer[0] === 0xff &&
        headerBuffer[1] === 0xd8 &&
        headerBuffer[2] === 0xff
      );

    case 'image/png':
      // 89 50 4E 47 0D 0A 1A 0A
      return (
        headerBuffer.length >= 8 &&
        headerBuffer[0] === 0x89 &&
        headerBuffer[1] === 0x50 &&
        headerBuffer[2] === 0x4e &&
        headerBuffer[3] === 0x47 &&
        headerBuffer[4] === 0x0d &&
        headerBuffer[5] === 0x0a &&
        headerBuffer[6] === 0x1a &&
        headerBuffer[7] === 0x0a
      );

    case 'image/webp':
      // RIFF....WEBP
      return (
        headerBuffer.length >= 12 &&
        headerBuffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        headerBuffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );

    case 'image/gif': {
      // GIF87a or GIF89a
      if (headerBuffer.length < 6) return false;
      const sig = headerBuffer.subarray(0, 6).toString('ascii');
      return sig === 'GIF87a' || sig === 'GIF89a';
    }

    case 'video/mp4':
    case 'video/x-m4v':
      // ....ftyp at offset 4
      return (
        headerBuffer.length >= 8 &&
        headerBuffer.subarray(4, 8).toString('ascii') === 'ftyp'
      );

    case 'video/quicktime': {
      // QuickTime (.mov): ftyp, moov, mdat, wide, or free at offset 4
      if (headerBuffer.length < 8) return false;
      const atom = headerBuffer.subarray(4, 8).toString('ascii');
      return ['ftyp', 'moov', 'mdat', 'wide', 'free', 'skip'].includes(atom);
    }

    case 'video/webm':
      // EBML header: 1A 45 DF A3
      return (
        headerBuffer.length >= 4 &&
        headerBuffer[0] === 0x1a &&
        headerBuffer[1] === 0x45 &&
        headerBuffer[2] === 0xdf &&
        headerBuffer[3] === 0xa3
      );

    case 'video/ogg':
      // OggS
      return headerBuffer.subarray(0, 4).toString('ascii') === 'OggS';

    case 'application/pdf':
      // %PDF-
      return (
        headerBuffer.length >= 5 &&
        headerBuffer.subarray(0, 5).toString('ascii') === '%PDF-'
      );

    case 'application/zip':
    case 'application/x-zip-compressed':
      // PK\x03\x04 (standard zip) or PK\x05\x06 (empty zip)
      return (
        headerBuffer.length >= 4 &&
        headerBuffer[0] === 0x50 &&
        headerBuffer[1] === 0x4b &&
        ((headerBuffer[2] === 0x03 && headerBuffer[3] === 0x04) ||
          (headerBuffer[2] === 0x05 && headerBuffer[3] === 0x06))
      );

    default:
      return false;
  }
}
