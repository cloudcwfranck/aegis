/**
 * Storage Service - S3-compatible blob storage for evidence artifacts
 * Supports both AWS S3-Gov and MinIO (local development)
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { Readable } from 'stream';
import { logger } from '../utils/logger';

export interface UploadResult {
  s3Uri: string;
  s3Bucket: string;
  s3Key: string;
  sha256: string;
  sizeBytes: number;
}

export interface StorageConfig {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean; // Required for MinIO
}

export class StorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;

    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle ?? false,
    });

    logger.info('Storage service initialized', {
      bucket: this.bucket,
      endpoint: config.endpoint || 'AWS S3',
    });
  }

  /**
   * Upload SBOM document to S3
   */
  async uploadSBOM(
    tenantId: string,
    projectId: string,
    buildId: string,
    sbomContent: string
  ): Promise<UploadResult> {
    const sha256 = this.calculateSHA256(sbomContent);
    const key = this.generateKey('sbom', tenantId, projectId, buildId, sha256);

    return await this.uploadFile(key, sbomContent, 'application/json');
  }

  /**
   * Upload vulnerability scan results to S3
   */
  async uploadScanResults(
    tenantId: string,
    projectId: string,
    buildId: string,
    scanContent: string
  ): Promise<UploadResult> {
    const sha256 = this.calculateSHA256(scanContent);
    const key = this.generateKey('scans', tenantId, projectId, buildId, sha256);

    return await this.uploadFile(key, scanContent, 'application/json');
  }

  /**
   * Upload cosign signature bundle to S3
   */
  async uploadSignature(
    tenantId: string,
    imageDigest: string,
    signatureContent: string
  ): Promise<UploadResult> {
    const sha256 = this.calculateSHA256(signatureContent);
    const timestamp = Date.now();
    const key = `signatures/${tenantId}/${imageDigest}/signature-${timestamp}-${sha256.substring(0, 8)}.json`;

    return await this.uploadFile(key, signatureContent, 'application/json');
  }

  /**
   * Upload POA&M export document
   */
  async uploadPOAM(
    tenantId: string,
    exportId: string,
    fileName: string,
    content: string | Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const key = `poam/${tenantId}/${exportId}/${fileName}`;

    return await this.uploadFile(key, content, contentType);
  }

  /**
   * Retrieve file from S3
   */
  async retrieveFile(s3Uri: string): Promise<string> {
    const { bucket, key } = this.parseS3Uri(s3Uri);

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('Empty response body from S3');
      }

      return await this.streamToString(response.Body as Readable);
    } catch (error) {
      logger.error('Failed to retrieve file from S3', { s3Uri, error });
      throw new Error(`Failed to retrieve file: ${s3Uri}`);
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(s3Uri: string): Promise<boolean> {
    const { bucket, key } = this.parseS3Uri(s3Uri);

    try {
      const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(s3Uri: string): Promise<void> {
    const { bucket, key } = this.parseS3Uri(s3Uri);

    try {
      const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await this.s3Client.send(command);
      logger.info('File deleted from S3', { s3Uri });
    } catch (error) {
      logger.error('Failed to delete file from S3', { s3Uri, error });
      throw new Error(`Failed to delete file: ${s3Uri}`);
    }
  }

  /**
   * Generic file upload
   */
  private async uploadFile(
    key: string,
    content: string | Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    const sha256 = this.calculateSHA256(buffer.toString());

    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        sha256,
        uploadedAt: new Date().toISOString(),
      },
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      const s3Uri = `s3://${this.bucket}/${key}`;

      logger.info('File uploaded to S3', {
        s3Uri,
        sizeBytes: buffer.length,
        sha256: sha256.substring(0, 16),
      });

      return {
        s3Uri,
        s3Bucket: this.bucket,
        s3Key: key,
        sha256,
        sizeBytes: buffer.length,
      };
    } catch (error) {
      logger.error('Failed to upload file to S3', { key, error });
      throw new Error(`Failed to upload file: ${key}`);
    }
  }

  /**
   * Generate S3 key path
   */
  private generateKey(
    type: string,
    tenantId: string,
    projectId: string,
    buildId: string,
    sha256: string
  ): string {
    const shortHash = sha256.substring(0, 8);
    return `${type}/${tenantId}/${projectId}/${buildId}/${type}-${shortHash}.json`;
  }

  /**
   * Calculate SHA256 hash
   */
  private calculateSHA256(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Parse S3 URI (s3://bucket/key)
   */
  private parseS3Uri(s3Uri: string): { bucket: string; key: string } {
    const match = s3Uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid S3 URI format: ${s3Uri}`);
    }

    return {
      bucket: match[1]!,
      key: match[2]!,
    };
  }

  /**
   * Convert readable stream to string
   */
  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }
}

/**
 * Create storage service instance from environment variables
 */
export function createStorageService(): StorageService {
  const config: StorageConfig = {
    endpoint: process.env['S3_ENDPOINT'], // undefined for AWS S3
    region: process.env['S3_REGION'] ?? 'us-gov-west-1',
    bucket: process.env['S3_BUCKET'] ?? 'aegis-evidence',
    accessKeyId: process.env['S3_ACCESS_KEY'] ?? '',
    secretAccessKey: process.env['S3_SECRET_KEY'] ?? '',
    forcePathStyle: process.env['S3_ENDPOINT'] ? true : false, // MinIO requires path-style
  };

  return new StorageService(config);
}
