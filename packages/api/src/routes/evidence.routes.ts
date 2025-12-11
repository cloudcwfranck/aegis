/**
 * Evidence Routes - REST API routes for evidence management
 */

import { Router } from 'express';

import { EvidenceController } from '../controllers/evidence.controller';

const router = Router();
const evidenceController = new EvidenceController();

/**
 * POST /api/v1/scans/upload
 * Upload SBOM and vulnerability scan results
 */
router.post(
  '/upload',
  (req, res, next) => evidenceController.uploadScanResults(req, res, next)
);

/**
 * GET /api/v1/scans/:evidenceId
 * Retrieve evidence details by ID
 */
router.get(
  '/:evidenceId',
  (req, res, next) => evidenceController.getEvidenceById(req, res, next)
);

/**
 * GET /api/v1/scans
 * List evidence for a tenant (with pagination and filters)
 */
router.get(
  '/',
  (req, res, next) => evidenceController.listEvidence(req, res, next)
);

export default router;
