/**
 * Incident Routes
 * RESTful endpoints for incident monitoring and management
 */

import { Router } from 'express';

import * as incidentController from '../controllers/incident.controller';

const router = Router();

/**
 * Incident analytics and monitoring
 */
router.get('/stats', incidentController.getIncidentStats);
router.get('/clusters', incidentController.getIncidentClusters);

/**
 * Incident CRUD operations
 */
router.get('/', incidentController.getIncidents);
router.get('/:incidentId', incidentController.getIncidentById);
router.patch('/:incidentId/status', incidentController.updateIncidentStatus);

/**
 * Incident generation
 */
router.post('/generate', incidentController.generateIncidents);

export default router;
