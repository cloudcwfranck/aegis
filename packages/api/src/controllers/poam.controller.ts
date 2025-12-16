/**
 * POA&M Controller
 * API endpoints for OSCAL POA&M management
 * Based on ADR-003: OSCAL-Native POA&M Generation
 */

import { POAMStatus, RiskLevel } from '@aegis/db';
import { Request, Response } from 'express';

import { OSCALExportService } from '../services/oscal-export.service';
import { POAMService } from '../services/poam.service';
import { logger } from '../utils/logger';

const poamService = new POAMService();
const oscalExportService = new OSCALExportService();

/**
 * Get all POA&M items with optional filters
 * GET /api/v1/poam
 */
export async function getPOAMItems(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const {
      status,
      riskLevel,
      assignedTo,
      overdue,
      limit,
    } = req.query as Record<string, string>;

    const filters: {
      status?: POAMStatus[];
      riskLevel?: RiskLevel[];
      assignedTo?: string;
      overdue?: boolean;
      limit?: number;
    } = {};

    if (status) {
      filters.status = status.split(',') as POAMStatus[];
    }

    if (riskLevel) {
      filters.riskLevel = riskLevel.split(',') as RiskLevel[];
    }

    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    if (overdue === 'true') {
      filters.overdue = true;
    }

    if (limit) {
      filters.limit = parseInt(limit, 10);
    }

    const poamItems = await poamService.getPOAMItems(tenantId, filters);

    res.json({
      poamItems,
      count: poamItems.length,
    });
  } catch (error) {
    logger.error('Error fetching POA&M items', { error });
    res.status(500).json({
      error: 'Failed to fetch POA&M items',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get POA&M statistics
 * GET /api/v1/poam/stats
 */
export async function getPOAMStats(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const stats = await poamService.getPOAMStats(tenantId);

    res.json({ stats });
  } catch (error) {
    logger.error('Error fetching POA&M stats', { error });
    res.status(500).json({
      error: 'Failed to fetch POA&M stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get single POA&M item by ID
 * GET /api/v1/poam/:poamId
 */
export async function getPOAMById(req: Request, res: Response): Promise<void> {
  try {
    const { poamId } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const poamItems = await poamService.getPOAMItems(tenantId);
    const poamItem = poamItems.find((item) => item.id === poamId);

    if (!poamItem) {
      res.status(404).json({ error: 'POA&M item not found' });
      return;
    }

    res.json({ poamItem });
  } catch (error) {
    logger.error('Error fetching POA&M item', { error });
    res.status(500).json({
      error: 'Failed to fetch POA&M item',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update POA&M status
 * PATCH /api/v1/poam/:poamId/status
 */
export async function updatePOAMStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { poamId } = req.params;
    const { status, userId, rationale } = req.body as {
      status: POAMStatus;
      userId?: string;
      rationale?: string;
    };

    if (!poamId) {
      res.status(400).json({ error: 'poamId is required' });
      return;
    }

    if (!status) {
      res.status(400).json({ error: 'status is required' });
      return;
    }

    const updatedPoamItem = await poamService.updatePOAMStatus(
      poamId,
      status,
      userId,
      rationale
    );

    res.json({ poamItem: updatedPoamItem });
  } catch (error) {
    logger.error('Error updating POA&M status', { error });
    res.status(500).json({
      error: 'Failed to update POA&M status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Generate POA&M from vulnerabilities
 * POST /api/v1/poam/generate
 */
export async function generatePOAM(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { evidenceId } = req.body as { evidenceId: string };

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    if (!evidenceId) {
      res.status(400).json({ error: 'evidenceId is required' });
      return;
    }

    const poamItems = await poamService.generatePOAMFromVulnerabilities(
      tenantId,
      evidenceId
    );

    res.json({
      message: `Generated ${poamItems.length} POA&M item(s) from vulnerabilities`,
      poamItems,
      count: poamItems.length,
    });
  } catch (error) {
    logger.error('Error generating POA&M', { error });
    res.status(500).json({
      error: 'Failed to generate POA&M',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Export POA&M in OSCAL JSON format
 * GET /api/v1/poam/export/oscal
 */
export async function exportOSCAL(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { systemId } = req.query as { systemId?: string };

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const poamItems = await poamService.getPOAMItems(tenantId);
    const oscalDocument = oscalExportService.generateOSCALPOAM(
      poamItems,
      'Aegis Tenant', // TODO: Get actual tenant name
      systemId
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="poam-oscal-${tenantId}-${new Date().toISOString().split('T')[0]}.json"`
    );
    res.json(oscalDocument);
  } catch (error) {
    logger.error('Error exporting OSCAL POA&M', { error });
    res.status(500).json({
      error: 'Failed to export OSCAL POA&M',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Export POA&M in CSV format
 * GET /api/v1/poam/export/csv
 */
export async function exportCSV(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const poamItems = await poamService.getPOAMItems(tenantId);
    const csvContent = oscalExportService.exportToCSV(poamItems);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="poam-${tenantId}-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    logger.error('Error exporting CSV POA&M', { error });
    res.status(500).json({
      error: 'Failed to export CSV POA&M',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get POA&M summary/report
 * GET /api/v1/poam/summary
 */
export async function getPOAMSummary(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({ error: 'x-tenant-id header is required' });
      return;
    }

    const poamItems = await poamService.getPOAMItems(tenantId);
    const summary = oscalExportService.generatePOAMSummary(poamItems);

    res.json({ summary });
  } catch (error) {
    logger.error('Error generating POA&M summary', { error });
    res.status(500).json({
      error: 'Failed to generate POA&M summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
