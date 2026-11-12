import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { StorageKeySchema, MediaType } from '@techa/shared';
import { env } from '../../../core/config/env';
import { BadRequestError, ForbiddenError } from '../../../core/errors/app-error';
import {
  getSpecByMimeType,
  getMaxBytesForMediaType,
  sanitizeOriginalFilename,
  verifyMagicBytes,
  FORBIDDEN_MIME_OR_EXT,
} from './media-validation';

export interface StoredMediaResult {
  storageKey: string;
  safeFilename: string;
  originalFileName: string;
  mimeType: string;
  mediaType: MediaType;
  sizeBytes: number;
  checksumSha256: string;
}

export class LocalMediaStorageProvider {
  public getStorageRoot(): string {
    return path.resolve(env.TECHA_MEDIA_STORAGE_ROOT);
  }

  public resolveSafePath(storageKey: string): string {
    const parsed = StorageKeySchema.safeParse(storageKey);
    if (!parsed.success) {
      throw new BadRequestError('کلید ذخیره‌سازی فایل نامعتبر است');
    }

    const root = this.getStorageRoot();
    const resolved = path.resolve(root, parsed.data);

    // Enforce strict boundary inside storageRoot (no traversal)
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      throw new ForbiddenError('مسیر فایل خارج از محدوده مجاز ذخیره‌سازی است');
    }

    return resolved;
  }

  public generateStorageTarget(canonicalExt: string, date = new Date()): {
    storageKey: string;
    safeFilename: string;
  } {
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const safeFilename = `${uuid}.${canonicalExt}`;
    const storageKey = `media/${year}/${month}/${safeFilename}`;
    return { storageKey, safeFilename };
  }

  public async storeFromStream(params: {
    fileStream: Readable;
    originalFileName: string;
    claimedMimeType: string;
  }): Promise<StoredMediaResult> {
    const cleanOriginal = sanitizeOriginalFilename(params.originalFileName);
    const ext = path.extname(cleanOriginal).toLowerCase();

    if (ext && FORBIDDEN_MIME_OR_EXT.has(ext)) {
      params.fileStream.resume();
      throw new BadRequestError(`پسوند فایل "${ext}" از نظر امنیتی غیرمجاز است`);
    }

    const spec = getSpecByMimeType(params.claimedMimeType);
    if (!spec) {
      params.fileStream.resume();
      throw new BadRequestError(`نوع فایل "${params.claimedMimeType}" مجاز نیست`);
    }

    if (ext && !spec.extensions.includes(ext)) {
      params.fileStream.resume();
      throw new BadRequestError(
        `پسوند فایل "${ext}" با نوع محتوای "${spec.mimeType}" همخوانی ندارد`
      );
    }

    const maxBytes = getMaxBytesForMediaType(spec.mediaType);
    const { storageKey, safeFilename } = this.generateStorageTarget(spec.canonicalExt);
    const finalPath = this.resolveSafePath(storageKey);
    const tempPath = `${finalPath}.tmp-${crypto.randomUUID()}`;

    await fsp.mkdir(path.dirname(finalPath), { recursive: true });

    const hash = crypto.createHash('sha256');
    const headerChunks: Buffer[] = [];
    let headerBytes = 0;
    let totalBytes = 0;
    let aborted = false;

    const writeStream = fs.createWriteStream(tempPath, { flags: 'wx' });

    const cleanupTemp = async () => {
      try {
        await fsp.unlink(tempPath);
      } catch {
        // ignore if already removed
      }
    };

    try {
      await new Promise<void>((resolve, reject) => {
        const fail = (err: Error) => {
          if (aborted) return;
          aborted = true;
          params.fileStream.unpipe();
          params.fileStream.destroy();
          writeStream.destroy();
          reject(err);
        };

        params.fileStream.on('data', (chunk: Buffer) => {
          if (aborted) return;
          totalBytes += chunk.length;
          if (totalBytes > maxBytes) {
            fail(
              new BadRequestError(
                `حجم فایل از سقف مجاز (${Math.round(maxBytes / (1024 * 1024))} مگابایت) بیشتر است`
              )
            );
            return;
          }

          if (headerBytes < 16) {
            const take = chunk.subarray(0, 16 - headerBytes);
            headerChunks.push(take);
            headerBytes += take.length;
          }

          hash.update(chunk);

          if (!writeStream.write(chunk)) {
            params.fileStream.pause();
            writeStream.once('drain', () => {
              if (!aborted) params.fileStream.resume();
            });
          }
        });

        params.fileStream.on('error', (err) => fail(err));
        writeStream.on('error', (err) => fail(err));

        params.fileStream.on('end', () => {
          if (aborted) return;
          writeStream.end(() => resolve());
        });
      });

      if (totalBytes === 0) {
        await cleanupTemp();
        throw new BadRequestError('فایل ارسالی خالی است');
      }

      const headerBuffer = Buffer.concat(headerChunks);
      if (!verifyMagicBytes(headerBuffer, spec.mimeType)) {
        await cleanupTemp();
        throw new BadRequestError(
          'محتوای واقعی فایل (Magic Bytes) با نوع فایل اعلام‌شده مطابقت ندارد'
        );
      }

      await fsp.rename(tempPath, finalPath);

      return {
        storageKey,
        safeFilename,
        originalFileName: cleanOriginal,
        mimeType: spec.mimeType,
        mediaType: spec.mediaType,
        sizeBytes: totalBytes,
        checksumSha256: hash.digest('hex'),
      };
    } catch (err) {
      await cleanupTemp();
      throw err;
    }
  }

  public async exists(storageKey: string): Promise<boolean> {
    try {
      const targetPath = this.resolveSafePath(storageKey);
      const stat = await fsp.lstat(targetPath);
      if (stat.isSymbolicLink() || !stat.isFile()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public async openReadStreamSafe(storageKey: string): Promise<{
    stream: fs.ReadStream;
    sizeBytes: number;
  }> {
    const targetPath = this.resolveSafePath(storageKey);
    const stat = await fsp.lstat(targetPath);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new ForbiddenError('دسترسی به فایل نامعتبر مسدود شد');
    }
    return {
      stream: fs.createReadStream(targetPath),
      sizeBytes: stat.size,
    };
  }

  public async deleteFile(storageKey: string): Promise<void> {
    const targetPath = this.resolveSafePath(storageKey);
    try {
      const stat = await fsp.lstat(targetPath);
      if (!stat.isSymbolicLink() && stat.isFile()) {
        await fsp.unlink(targetPath);
      }
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        throw err;
      }
    }
  }
}

export const localMediaStorage = new LocalMediaStorageProvider();
