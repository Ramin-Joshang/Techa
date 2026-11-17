import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import mongoose from 'mongoose';
import { logger } from '../../../core/logger/logger';

const GRIDFS_BUCKET_NAME = 'media_blobs';

export interface GridFsMediaMetadata {
  mimeType: string;
  mediaType: string;
  category: string;
  checksumSha256?: string;
}

export class MediaGridFsStorageService {
  private getBucket(): mongoose.mongo.GridFSBucket | null {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return null;
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: GRIDFS_BUCKET_NAME,
    });
  }

  public isAvailable(): boolean {
    return this.getBucket() !== null;
  }

  public async saveFromFile(params: {
    storageKey: string;
    filePath: string;
    metadata: GridFsMediaMetadata;
  }): Promise<boolean> {
    const bucket = this.getBucket();
    if (!bucket) return false;

    try {
      // Remove any stale duplicate with same storageKey before storing fresh copy
      await this.deleteByStorageKey(params.storageKey);

      const uploadStream = bucket.openUploadStream(params.storageKey, {
        chunkSizeBytes: 1024 * 1024, // 1 MiB chunks for smooth video & image streaming
        metadata: params.metadata,
      });

      const readStream = fs.createReadStream(params.filePath);
      await pipeline(readStream, uploadStream);
      return true;
    } catch (err) {
      logger.error({ err, storageKey: params.storageKey }, '[MediaGridFS] Failed to store media blob');
      return false;
    }
  }

  public async findFileRecord(storageKey: string): Promise<{
    _id: mongoose.Types.ObjectId;
    length: number;
    filename: string;
    metadata?: Record<string, unknown>;
  } | null> {
    const bucket = this.getBucket();
    if (!bucket) return null;

    const files = await bucket
      .find({ filename: storageKey })
      .sort({ uploadDate: -1 })
      .limit(1)
      .toArray();
    if (!files || files.length === 0) return null;
    return files[0] as {
      _id: mongoose.Types.ObjectId;
      length: number;
      filename: string;
      metadata?: Record<string, unknown>;
    };
  }

  public async openDownloadStream(
    storageKey: string,
    range?: { start: number; end: number }
  ): Promise<{ stream: Readable; sizeBytes: number } | null> {
    const bucket = this.getBucket();
    if (!bucket) return null;

    const record = await this.findFileRecord(storageKey);
    if (!record) return null;

    // GridFSBucketReadStream `end` option is exclusive (bytes [start, end))
    const downloadStream = range
      ? bucket.openDownloadStream(record._id, {
          start: range.start,
          end: range.end + 1,
        })
      : bucket.openDownloadStream(record._id);

    return {
      stream: downloadStream,
      sizeBytes: record.length,
    };
  }

  public async restoreToDisk(storageKey: string, destinationPath: string): Promise<boolean> {
    const opened = await this.openDownloadStream(storageKey);
    if (!opened) return false;

    const tempPath = `${destinationPath}.restore-${crypto.randomUUID()}`;
    try {
      await fsp.mkdir(path.dirname(destinationPath), { recursive: true });
      const writeStream = fs.createWriteStream(tempPath, { flags: 'wx' });
      await pipeline(opened.stream, writeStream);
      await fsp.rename(tempPath, destinationPath);
      return true;
    } catch (err) {
      try {
        await fsp.unlink(tempPath);
      } catch {
        // ignore cleanup error
      }
      logger.warn(
        { err, storageKey },
        '[MediaGridFS] Failed to rehydrate media file to local disk'
      );
      return false;
    }
  }

  public async deleteByStorageKey(storageKey: string): Promise<void> {
    const bucket = this.getBucket();
    if (!bucket) return;

    try {
      const files = await bucket.find({ filename: storageKey }).toArray();
      for (const file of files) {
        await bucket.delete(file._id);
      }
    } catch (err) {
      logger.warn({ err, storageKey }, '[MediaGridFS] Failed to delete GridFS blob');
    }
  }
}

export const mediaGridFsStorage = new MediaGridFsStorageService();
