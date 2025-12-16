/**
 * POA&M API Routes
 * OSCAL 1.0.4 compliant POA&M endpoints
 */

import { Router } from 'express';

import {
  getPOAMItems,
  getPOAMStats,
  getPOAMById,
  updatePOAMStatus,
  generatePOAM,
  exportOSCAL,
  exportCSV,
  getPOAMSummary,
} from '../controllers/poam.controller';

const router = Router();

// POA&M CRUD operations
router.get('/', getPOAMItems); // GET /api/v1/poam
router.get('/stats', getPOAMStats); // GET /api/v1/poam/stats
router.get('/summary', getPOAMSummary); // GET /api/v1/poam/summary
router.get('/:poamId', getPOAMById); // GET /api/v1/poam/:poamId
router.patch('/:poamId/status', updatePOAMStatus); // PATCH /api/v1/poam/:poamId/status

// POA&M generation
router.post('/generate', generatePOAM); // POST /api/v1/poam/generate

// Export endpoints
router.get('/export/oscal', exportOSCAL); // GET /api/v1/poam/export/oscal
router.get('/export/csv', exportCSV); // GET /api/v1/poam/export/csv

export default router;
