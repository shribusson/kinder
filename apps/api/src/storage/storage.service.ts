import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { lookup } from 'mime-types';
import { Readable } from 'stream';

export interface UploadOptions {
  bucket?: string;
  key: string;
  body: Buffer | Readable;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read';
}

export interface DownloadResult {
  body: Readable;
  contentType?: string;
  contentLength?: number;
  metadata?: Record<string, string>;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly defaultBucket: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
    const region = process.env.S3_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || 'minioadmin';
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || 'minioadmin';
    this.defaultBucket = process.env.S3_BUCKET || 'kinder-storage';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.logger.log(`S3 client initialized: ${endpoint}, bucket: ${this.defaultBucket}`);
  }

  /**
   * Upload a file to S3/MinIO
   */
  async upload(options: UploadOptions): Promise<{ url: string; key: string }> {
    const bucket = options.bucket || this.defaultBucket;
    const contentType = options.contentType || lookup(options.key) || 'application/octet-stream';

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: options.key,
          Body: options.body,
          ContentType: contentType,
          Metadata: options.metadata,
          ACL: options.acl || 'private',
        }),
      );

      const url = `${process.env.S3_ENDPOINT}/${bucket}/${options.key}`;
      this.logger.log(`File uploaded: ${url}`);

      return { url, key: options.key };
    } catch (error) {
      this.logger.error(`Upload failed for ${options.key}:`, error);
      throw error;
    }
  }

  /**
   * Download a file from S3/MinIO
   */
  async download(key: string, bucket?: string): Promise<DownloadResult> {
    const bucketName = bucket || this.defaultBucket;

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );

      if (!response.Body) {
        throw new Error('Empty response body');
      }

      return {
        body: response.Body as Readable,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        metadata: response.Metadata,
      };
    } catch (error) {
      this.logger.error(`Download failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for temporary access
   */
  async getSignedUrl(
    key: string,
    expiresIn: number = 3600,
    bucket?: string,
  ): Promise<string> {
    const bucketName = bucket || this.defaultBucket;

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.debug(`Signed URL generated for ${key}: ${expiresIn}s`);
      return url;
    } catch (error) {
      this.logger.error(`Signed URL generation failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from S3/MinIO
   */
  async delete(key: string, bucket?: string): Promise<void> {
    const bucketName = bucket || this.defaultBucket;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Delete failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a file exists
   */
  async exists(key: string, bucket?: string): Promise<boolean> {
    const bucketName = bucket || this.defaultBucket;

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Copy a file within S3/MinIO
   */
  async copy(
    sourceKey: string,
    destinationKey: string,
    sourceBucket?: string,
    destinationBucket?: string,
  ): Promise<void> {
    const srcBucket = sourceBucket || this.defaultBucket;
    const dstBucket = destinationBucket || this.defaultBucket;

    try {
      await this.s3Client.send(
        new CopyObjectCommand({
          CopySource: `${srcBucket}/${sourceKey}`,
          Bucket: dstBucket,
          Key: destinationKey,
        }),
      );

      this.logger.log(`File copied: ${sourceKey} -> ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Copy failed: ${sourceKey} -> ${destinationKey}:`, error);
      throw error;
    }
  }

  /**
   * List files with a prefix
   */
  async listFiles(
    prefix: string,
    bucket?: string,
    maxKeys: number = 1000,
  ): Promise<string[]> {
    const bucketName = bucket || this.defaultBucket;

    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          MaxKeys: maxKeys,
        }),
      );

      return response.Contents?.map((obj) => obj.Key!).filter(Boolean) || [];
    } catch (error) {
      this.logger.error(`List failed for prefix ${prefix}:`, error);
      throw error;
    }
  }

  /**
   * Generate storage key with tenant isolation
   */
  generateKey(accountId: string, category: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `accounts/${accountId}/${category}/${timestamp}-${sanitized}`;
  }

  /**
   * Get public URL for a file (if bucket is public)
   */
  getPublicUrl(key: string, bucket?: string): string {
    const bucketName = bucket || this.defaultBucket;
    return `${process.env.S3_ENDPOINT}/${bucketName}/${key}`;
  }
}
