/**
 * Evidence Controller - REST API endpoints for evidence ingestion
 */

import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { EvidenceService } from '../services/evidence.service';
import { createStorageService } from '../services/storage.service';
import { UploadScanInputDto } from '../dto/upload-scan.dto';
import { logger } from '../utils/logger';

/**
 * POST /api/v1/scans/upload
 * Upload SBOM and vulnerability scan results
 */
export class EvidenceController {
  private evidenceService: EvidenceService;

  constructor() {
    const storageService = createStorageService();
    this.evidenceService = new EvidenceService(storageService);
  }

  /**
   * Upload scan results endpoint
   */
  async uploadScanResults(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract tenant ID from authenticated user (placeholder for now)
      // In production, this comes from JWT token or session
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Missing tenant ID. Include X-Tenant-ID header.',
        });
        return;
      }

      // Validate request body using class-validator
      const uploadDto = plainToClass(UploadScanInputDto, req.body);
      const validationErrors = await validate(uploadDto);

      if (validationErrors.length > 0) {
        const errors = validationErrors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid request payload',
          details: errors,
        });
        return;
      }

      logger.info('Received scan upload request', {
        tenantId,
        projectName: uploadDto.projectName,
        buildId: uploadDto.buildId,
      });

      // Process evidence upload
      const result = await this.evidenceService.uploadScanResults(
        tenantId,
        uploadDto
      );

      res.status(201).json(result);
    } catch (error) {
      logger.error('Failed to upload scan results', { error });
      next(error);
    }
  }

  /**
   * GET /api/v1/scans/:evidenceId
   * Retrieve evidence details by ID
   */
  async getEvidenceById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { evidenceId } = req.params;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Missing tenant ID',
        });
        return;
      }

      // TODO: Implement evidence retrieval service method
      res.status(501).json({
        success: false,
        message: 'Evidence retrieval not yet implemented',
        evidenceId,
      });
    } catch (error) {
      logger.error('Failed to retrieve evidence', { error });
      next(error);
    }
  }

  /**
   * GET /api/v1/scans
   * List evidence for a tenant (with pagination)
   */
  async listEvidence(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { page = '1', limit = '20', projectName } = req.query;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Missing tenant ID',
        });
        return;
      }

      // TODO: Implement evidence list service method
      res.status(501).json({
        success: false,
        message: 'Evidence listing not yet implemented',
        filters: { tenantId, page, limit, projectName },
      });
    } catch (error) {
      logger.error('Failed to list evidence', { error });
      next(error);
    }
  }
}
