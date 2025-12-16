/**
 * Policy Controller
 * Handles policy management and evaluation endpoints
 */

import { Request, Response } from 'express';

import { PolicyService } from '../services/policy.service';
import { logger } from '../utils/logger';

const policyService = new PolicyService();

/**
 * Evaluate policies against evidence
 * POST /api/v1/policies/evaluate
 */
export async function evaluatePolicies(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { evidenceId, policyIds } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!evidenceId) {
      res.status(400).json({ error: 'evidenceId is required' });
      return;
    }

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const results = await policyService.evaluatePolicies({
      evidenceId,
      tenantId,
      policyIds,
    });

    const allPassed = results.every((r) => r.passed);

    res.status(200).json({
      success: true,
      allPassed,
      evaluatedPolicies: results.length,
      passedPolicies: results.filter((r) => r.passed).length,
      failedPolicies: results.filter((r) => !r.passed).length,
      results,
    });
  } catch (error) {
    logger.error('Policy evaluation failed', { error });
    res.status(500).json({
      error: 'Policy evaluation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get policy evaluation results for evidence
 * GET /api/v1/policies/evaluations/:evidenceId
 */
export async function getEvaluationResults(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { evidenceId } = req.params;

    if (!evidenceId) {
      res.status(400).json({ error: 'evidenceId parameter is required' });
      return;
    }

    const results = await policyService.getEvaluationResults(evidenceId);

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    logger.error('Failed to get evaluation results', { error });
    res.status(500).json({
      error: 'Failed to get evaluation results',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get all policies for tenant
 * GET /api/v1/policies
 */
export async function getPolicies(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const policies = await policyService.getPolicies(tenantId);

    res.status(200).json({
      success: true,
      count: policies.length,
      policies,
    });
  } catch (error) {
    logger.error('Failed to get policies', { error });
    res.status(500).json({
      error: 'Failed to get policies',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Create a new policy
 * POST /api/v1/policies
 */
export async function createPolicy(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const policyData = {
      ...req.body,
      tenantId,
    };

    const policy = await policyService.createPolicy(policyData);

    res.status(201).json({
      success: true,
      policy,
    });
  } catch (error) {
    logger.error('Failed to create policy', { error });
    res.status(500).json({
      error: 'Failed to create policy',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update a policy
 * PUT /api/v1/policies/:policyId
 */
export async function updatePolicy(req: Request, res: Response): Promise<void> {
  try {
    const { policyId } = req.params;
    const updates = req.body;

    if (!policyId) {
      res.status(400).json({ error: 'policyId parameter is required' });
      return;
    }

    const policy = await policyService.updatePolicy(policyId, updates);

    res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    logger.error('Failed to update policy', { error });
    res.status(500).json({
      error: 'Failed to update policy',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Delete a policy
 * DELETE /api/v1/policies/:policyId
 */
export async function deletePolicy(req: Request, res: Response): Promise<void> {
  try {
    const { policyId } = req.params;

    if (!policyId) {
      res.status(400).json({ error: 'policyId parameter is required' });
      return;
    }

    await policyService.deletePolicy(policyId);

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete policy', { error });
    res.status(500).json({
      error: 'Failed to delete policy',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
