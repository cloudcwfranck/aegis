/**
 * Policy Routes
 * RESTful endpoints for policy management and evaluation
 */

import { Router } from 'express';

import * as policyController from '../controllers/policy.controller';

const router = Router();

/**
 * Policy evaluation
 */
router.post('/evaluate', policyController.evaluatePolicies);
router.get('/evaluations/:evidenceId', policyController.getEvaluationResults);

/**
 * Policy CRUD operations
 */
router.get('/', policyController.getPolicies);
router.post('/', policyController.createPolicy);
router.put('/:policyId', policyController.updatePolicy);
router.delete('/:policyId', policyController.deletePolicy);

export default router;
