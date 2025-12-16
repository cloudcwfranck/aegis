/**
 * Evidence GraphQL Resolver
 * Mutations and queries for evidence management
 */

import { Resolver, Mutation, Query, Arg, Ctx } from 'type-graphql';

import { EvidenceService } from '../../services/evidence.service';
import { createStorageService } from '../../services/storage.service';
import { logger } from '../../utils/logger';
import { GraphQLContext } from '../types/context.types';
import {
  UploadScanInput,
  UploadScanResult,
  EvidenceListResult,
} from '../types/evidence.types';

@Resolver()
export class EvidenceResolver {
  private evidenceService: EvidenceService;

  constructor() {
    const storageService = createStorageService();
    this.evidenceService = new EvidenceService(storageService);
  }

  /**
   * Upload SBOM and vulnerability scan results
   */
  @Mutation(() => UploadScanResult, {
    description:
      'Upload SBOM (SPDX 2.3) and vulnerability scan results (Grype JSON)',
  })
  async uploadScanResults(
    @Arg('input') input: UploadScanInput,
    @Ctx() ctx: GraphQLContext
  ): Promise<UploadScanResult> {
    try {
      // Extract tenant ID from context (set by auth middleware)
      const tenantId = ctx.tenantId;

      if (!tenantId) {
        throw new Error('Unauthorized: Missing tenant context');
      }

      logger.info('GraphQL: Received scan upload request', {
        tenantId,
        projectName: input.projectName,
        buildId: input.buildId,
      });

      // Convert GraphQL input to service DTO
      const result = await this.evidenceService.uploadScanResults(tenantId, {
        projectName: input.projectName,
        buildId: input.buildId,
        imageDigest: input.imageDigest,
        sbom: input.sbom as Record<string, unknown>,
        vulnerabilities: input.vulnerabilities as Record<string, unknown>,
        gitCommitSha: input.gitCommitSha,
        gitBranch: input.gitBranch,
        ciPipelineUrl: input.ciPipelineUrl,
      });

      return {
        success: result.success,
        evidenceId: result.evidenceId,
        message: result.message,
        summary: result.summary
          ? {
              packageCount: result.summary.packageCount,
              vulnerabilityCount: result.summary.vulnerabilityCount,
              criticalCount: result.summary.criticalCount,
              highCount: result.summary.highCount,
              mediumCount: result.summary.mediumCount,
              lowCount: result.summary.lowCount,
            }
          : undefined,
      };
    } catch (error) {
      logger.error('GraphQL: Failed to upload scan results', { error });
      throw error;
    }
  }

  /**
   * List evidence records (placeholder)
   */
  @Query(() => EvidenceListResult, {
    description: 'List evidence records with pagination and filters',
  })
  async listEvidence(
    @Arg('page', { defaultValue: 1 }) page: number,
    @Arg('limit', { defaultValue: 20 }) limit: number,
    @Arg('projectName', { nullable: true }) projectName?: string,
    @Ctx() ctx?: GraphQLContext
  ): Promise<EvidenceListResult> {
    const tenantId = ctx?.tenantId;

    if (!tenantId) {
      throw new Error('Unauthorized: Missing tenant context');
    }

    // TODO: Implement evidence list service method
    logger.info('GraphQL: List evidence request', {
      tenantId,
      page,
      limit,
      projectName,
    });

    return {
      items: [],
      total: 0,
      page,
      limit,
    };
  }
}
