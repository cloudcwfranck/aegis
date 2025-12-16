/**
 * Incident Controller
 * API endpoints for incident management and monitoring dashboard
 */

import { Request, Response } from 'express';

import { IncidentStatus, IncidentSeverity, IncidentType } from '@aegis/db';

import { IncidentService } from '../services/incident.service';
import { logger } from '../utils/logger';

const incidentService = new IncidentService();

/**
 * Get all incidents with optional filters
 * GET /api/v1/incidents
 */
export async function getIncidents(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const {
      status,
      severity,
      type,
      projectName,
      fromDate,
      toDate,
      limit,
    } = req.query;

    const filters: {
      status?: IncidentStatus[];
      severity?: IncidentSeverity[];
      type?: IncidentType[];
      projectName?: string;
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
    } = {};

    if (status) {
      filters.status = (status as string).split(',') as IncidentStatus[];
    }

    if (severity) {
      filters.severity = (severity as string).split(',') as IncidentSeverity[];
    }

    if (type) {
      filters.type = (type as string).split(',') as IncidentType[];
    }

    if (projectName) {
      filters.projectName = projectName as string;
    }

    if (fromDate) {
      filters.fromDate = new Date(fromDate as string);
    }

    if (toDate) {
      filters.toDate = new Date(toDate as string);
    }

    if (limit) {
      filters.limit = parseInt(limit as string, 10);
    }

    const incidents = await incidentService.getIncidents(tenantId, filters);

    res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    logger.error('Failed to get incidents', { error });
    res.status(500).json({
      error: 'Failed to get incidents',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get incident statistics
 * GET /api/v1/incidents/stats
 */
export async function getIncidentStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const stats = await incidentService.getIncidentStats(tenantId);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Failed to get incident stats', { error });
    res.status(500).json({
      error: 'Failed to get incident stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get incident clusters
 * GET /api/v1/incidents/clusters
 */
export async function getIncidentClusters(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const clusters = await incidentService.clusterIncidents(tenantId);

    res.status(200).json({
      success: true,
      clusterCount: clusters.length,
      clusters,
    });
  } catch (error) {
    logger.error('Failed to get incident clusters', { error });
    res.status(500).json({
      error: 'Failed to get incident clusters',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get a single incident by ID
 * GET /api/v1/incidents/:incidentId
 */
export async function getIncidentById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { incidentId } = req.params;

    if (!incidentId) {
      res.status(400).json({ error: 'incidentId parameter is required' });
      return;
    }

    const tenantId = req.headers['x-tenant-id'] as string;
    const incidents = await incidentService.getIncidents(tenantId);
    const incident = incidents.find((i) => i.id === incidentId);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    logger.error('Failed to get incident', { error });
    res.status(500).json({
      error: 'Failed to get incident',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update incident status
 * PATCH /api/v1/incidents/:incidentId/status
 */
export async function updateIncidentStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { incidentId } = req.params;
    const { status, userId } = req.body;

    if (!incidentId) {
      res.status(400).json({ error: 'incidentId parameter is required' });
      return;
    }

    if (!status) {
      res.status(400).json({ error: 'status is required' });
      return;
    }

    if (!Object.values(IncidentStatus).includes(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const incident = await incidentService.updateIncidentStatus(
      incidentId,
      status as IncidentStatus,
      userId
    );

    res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    logger.error('Failed to update incident status', { error });
    res.status(500).json({
      error: 'Failed to update incident status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Generate incidents from evidence scan
 * POST /api/v1/incidents/generate
 */
export async function generateIncidents(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { evidenceId } = req.body;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    if (!evidenceId) {
      res.status(400).json({ error: 'evidenceId is required' });
      return;
    }

    // Generate incidents from vulnerabilities
    const vulnIncidents = await incidentService.generateIncidentsFromVulnerabilities(
      tenantId,
      evidenceId
    );

    // Generate incidents from policy violations
    const policyIncidents = await incidentService.generateIncidentsFromPolicyViolations(
      tenantId,
      evidenceId
    );

    const allIncidents = [...vulnIncidents, ...policyIncidents];

    res.status(201).json({
      success: true,
      incidentCount: allIncidents.length,
      incidents: allIncidents,
    });
  } catch (error) {
    logger.error('Failed to generate incidents', { error });
    res.status(500).json({
      error: 'Failed to generate incidents',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
