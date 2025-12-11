/**
 * Storage Service - Multi-cloud blob storage for evidence artifacts
 * Supports Azure Blob Storage (Azure Gov) and S3-compatible (MinIO local dev)
 */

import { createHash } from 'crypto';
import { Readable } from 'stream';

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerClient,
} from '@azure/storage-blob';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';

import { logger } from '../utils/logger';

export interface UploadResult {
  uri: string;
  container: string;
  key: string;
  sha256: string;
  sizeBytes: number;
}

export interface StorageConfig {
  provider: 'azure' | 's3';
  // Azure-specific
  azureAccountName?: string;
  azureAccountKey?: string;
  azureEndpoint?: string; // For Azure Gov Cloud
  // S3-specific
  s3Endpoint?: string;
  s3Region?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  s3ForcePathStyle?: boolean;
  // Common
  container: string; // Azure container or S3 bucket
}

/**
 * Abstract interface for storage operations
 */
export interface IStorageService {
  uploadSBOM(
    tenantId: string,
    projectId: string,
    buildId: string,
    sbomContent: string
  ): Promise<UploadResult>;

  uploadScanResults(
    tenantId: string,
    projectId: string,
    buildId: string,
    scanContent: string
  ): Promise<UploadResult>;

  uploadSignature(
    tenantId: string,
    imageDigest: string,
    signatureContent: string
  ): Promise<UploadResult>;

  uploadPOAM(
    tenantId: string,
    exportId: string,
    fileName: string,
    content: string | Buffer,
    contentType: string
  ): Promise<UploadResult>;

  retrieveFile(uri: string): Promise<string>;
  fileExists(uri: string): Promise<boolean>;
  deleteFile(uri: string): Promise<void>;
}

/**
 * Azure Blob Storage implementation for Azure Government Cloud
 */
export class AzureBlobStorageService implements IStorageService {
  private containerClient: ContainerClient;
  private containerName: string;

  constructor(config: StorageConfig) {
    if (!config.azureAccountName || !config.azureAccountKey) {
      throw new Error('Azure storage credentials are required');
    }

    this.containerName = config.container;

    const credential = new StorageSharedKeyCredential(
      config.azureAccountName,
      config.azureAccountKey
    );

    // Azure Gov Cloud endpoint: https://<account>.blob.core.usgovcloudapi.net
    const blobEndpoint =
      config.azureEndpoint ||
      `https://${config.azureAccountName}.blob.core.usgovcloudapi.net`;

    const blobServiceClient = new BlobServiceClient(blobEndpoint, credential);
    this.containerClient = blobServiceClient.getContainerClient(
      this.containerName
    );

    logger.info('Azure Blob Storage service initialized', {
      container: this.containerName,
      endpoint: blobEndpoint,
    });
  }

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

  async retrieveFile(uri: string): Promise<string> {
    const key = this.parseUri(uri);

    try {
      const blobClient = this.containerClient.getBlobClient(key);
      const downloadResponse = await blobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new Error('Empty response body from Azure Blob Storage');
      }

      return await this.streamToString(
        downloadResponse.readableStreamBody as Readable
      );
    } catch (error) {
      logger.error('Failed to retrieve file from Azure Blob Storage', {
        uri,
        error,
      });
      throw new Error(`Failed to retrieve file: ${uri}`);
    }
  }

  async fileExists(uri: string): Promise<boolean> {
    const key = this.parseUri(uri);

    try {
      const blobClient = this.containerClient.getBlobClient(key);
      return await blobClient.exists();
    } catch (error) {
      return false;
    }
  }

  async deleteFile(uri: string): Promise<void> {
    const key = this.parseUri(uri);

    try {
      const blobClient = this.containerClient.getBlobClient(key);
      await blobClient.delete();
      logger.info('File deleted from Azure Blob Storage', { uri });
    } catch (error) {
      logger.error('Failed to delete file from Azure Blob Storage', {
        uri,
        error,
      });
      throw new Error(`Failed to delete file: ${uri}`);
    }
  }

  private async uploadFile(
    key: string,
    content: string | Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    const sha256 = this.calculateSHA256(buffer.toString());

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(key);

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
        metadata: {
          sha256,
          uploadedAt: new Date().toISOString(),
        },
      });

      const uri = `azure://${this.containerName}/${key}`;

      logger.info('File uploaded to Azure Blob Storage', {
        uri,
        sizeBytes: buffer.length,
        sha256: sha256.substring(0, 16),
      });

      return {
        uri,
        container: this.containerName,
        key,
        sha256,
        sizeBytes: buffer.length,
      };
    } catch (error) {
      logger.error('Failed to upload file to Azure Blob Storage', {
        key,
        error,
      });
      throw new Error(`Failed to upload file: ${key}`);
    }
  }

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

  private calculateSHA256(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private parseUri(uri: string): string {
    // Parse azure://container/key or https://account.blob.core.usgovcloudapi.net/container/key
    const azureMatch = uri.match(/^azure:\/\/[^/]+\/(.+)$/);
    if (azureMatch) {
      return azureMatch[1]!;
    }

    const httpsMatch = uri.match(/^https:\/\/[^/]+\/[^/]+\/(.+)$/);
    if (httpsMatch) {
      return httpsMatch[1]!;
    }

    throw new Error(`Invalid Azure Blob URI format: ${uri}`);
  }

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
 * S3-compatible storage implementation for MinIO (local development)
 */
export class S3StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    if (
      !config.s3AccessKeyId ||
      !config.s3SecretAccessKey ||
      !config.s3Region
    ) {
      throw new Error('S3 credentials and region are required');
    }

    this.bucket = config.container;

    this.s3Client = new S3Client({
      endpoint: config.s3Endpoint,
      region: config.s3Region,
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      },
      forcePathStyle: config.s3ForcePathStyle ?? false,
    });

    logger.info('S3 storage service initialized', {
      bucket: this.bucket,
      endpoint: config.s3Endpoint || 'AWS S3',
    });
  }

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

  async retrieveFile(uri: string): Promise<string> {
    const { bucket, key } = this.parseS3Uri(uri);

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('Empty response body from S3');
      }

      return await this.streamToString(response.Body as Readable);
    } catch (error) {
      logger.error('Failed to retrieve file from S3', { uri, error });
      throw new Error(`Failed to retrieve file: ${uri}`);
    }
  }

  async fileExists(uri: string): Promise<boolean> {
    const { bucket, key } = this.parseS3Uri(uri);

    try {
      const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteFile(uri: string): Promise<void> {
    const { bucket, key } = this.parseS3Uri(uri);

    try {
      const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await this.s3Client.send(command);
      logger.info('File deleted from S3', { uri });
    } catch (error) {
      logger.error('Failed to delete file from S3', { uri, error });
      throw new Error(`Failed to delete file: ${uri}`);
    }
  }

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

      const uri = `s3://${this.bucket}/${key}`;

      logger.info('File uploaded to S3', {
        uri,
        sizeBytes: buffer.length,
        sha256: sha256.substring(0, 16),
      });

      return {
        uri,
        container: this.bucket,
        key,
        sha256,
        sizeBytes: buffer.length,
      };
    } catch (error) {
      logger.error('Failed to upload file to S3', { key, error });
      throw new Error(`Failed to upload file: ${key}`);
    }
  }

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

  private calculateSHA256(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private parseS3Uri(uri: string): { bucket: string; key: string } {
    const match = uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid S3 URI format: ${uri}`);
    }

    return {
      bucket: match[1]!,
      key: match[2]!,
    };
  }

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
 * Factory function to create storage service based on environment configuration
 */
export function createStorageService(): IStorageService {
  const provider = (process.env['STORAGE_PROVIDER'] || 'azure') as
    | 'azure'
    | 's3';

  if (provider === 'azure') {
    const config: StorageConfig = {
      provider: 'azure',
      azureAccountName: process.env['AZURE_STORAGE_ACCOUNT'] ?? '',
      azureAccountKey: process.env['AZURE_STORAGE_KEY'] ?? '',
      azureEndpoint: process.env['AZURE_STORAGE_ENDPOINT'], // For Azure Gov: https://<account>.blob.core.usgovcloudapi.net
      container: process.env['AZURE_CONTAINER'] ?? 'aegis-evidence',
    };

    return new AzureBlobStorageService(config);
  } else {
    const config: StorageConfig = {
      provider: 's3',
      s3Endpoint: process.env['S3_ENDPOINT'], // For MinIO: http://localhost:9000
      s3Region: process.env['S3_REGION'] ?? 'us-east-1',
      s3AccessKeyId: process.env['S3_ACCESS_KEY'] ?? '',
      s3SecretAccessKey: process.env['S3_SECRET_KEY'] ?? '',
      s3ForcePathStyle: process.env['S3_ENDPOINT'] ? true : false,
      container: process.env['S3_BUCKET'] ?? 'aegis-evidence',
    };

    return new S3StorageService(config);
  }
}
