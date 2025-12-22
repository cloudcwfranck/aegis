/**
 * OSCAL Export Service
 * Generates OSCAL 1.0.4 compliant POA&M documents
 * Based on ADR-003: OSCAL-Native POA&M Generation
 */

import { POAMItemEntity, POAMStatus } from '@aegis/db';
import { v4 as uuidv4 } from 'uuid';

interface OSCALMetadata {
  title: string;
  'last-modified': string;
  version: string;
  'oscal-version': string;
  parties?: Array<{
    uuid: string;
    type: string;
    name: string;
    'email-addresses'?: string[];
  }>;
}

interface OSCALSystemId {
  'identifier-type': string;
  id: string;
}

interface OSCALRiskFacet {
  name: string;
  system: string;
  value: string;
}

interface OSCALRisk {
  status: string;
  characterization: {
    facets: OSCALRiskFacet[];
  };
}

interface OSCALTrackingEntry {
  uuid: string;
  'date-time-stamp': string;
  title: string;
  description?: string;
  'scheduled-completion-date'?: string;
}

interface OSCALPOAMItem {
  uuid: string;
  title: string;
  description: string;
  'related-observations'?: Array<{
    'observation-uuid': string;
  }>;
  risk: OSCALRisk;
  'remediation-tracking'?: {
    'tracking-entries': OSCALTrackingEntry[];
  };
}

interface OSCALPOAMDocument {
  'plan-of-action-and-milestones': {
    uuid: string;
    metadata: OSCALMetadata;
    'system-id': OSCALSystemId;
    'poam-items': OSCALPOAMItem[];
  };
}

/**
 * OSCAL Export Service
 * Converts POA&M entities to OSCAL 1.0.4 JSON format
 */
export class OSCALExportService {
  /**
   * Generate OSCAL 1.0.4 POA&M document
   */
  generateOSCALPOAM(
    poamItems: POAMItemEntity[],
    tenantName: string,
    systemId?: string
  ): OSCALPOAMDocument {
    const metadata = this.generateMetadata(tenantName);
    const oscalItems = poamItems.map((item) => this.convertToOSCALItem(item));

    return {
      'plan-of-action-and-milestones': {
        uuid: uuidv4(),
        metadata,
        'system-id': {
          'identifier-type': 'https://fedramp.gov',
          id: systemId || 'PENDING',
        },
        'poam-items': oscalItems,
      },
    };
  }

  /**
   * Generate OSCAL metadata
   */
  private generateMetadata(tenantName: string): OSCALMetadata {
    const now = new Date().toISOString();

    return {
      title: `Aegis POA&M - ${tenantName}`,
      'last-modified': now,
      version: '1.0',
      'oscal-version': '1.0.4',
      parties: [
        {
          uuid: uuidv4(),
          type: 'organization',
          name: tenantName,
        },
      ],
    };
  }

  /**
   * Convert POA&M entity to OSCAL POA&M item
   */
  private convertToOSCALItem(poamItem: POAMItemEntity): OSCALPOAMItem {
    return {
      uuid: poamItem.oscalUuid,
      title: poamItem.title,
      description: poamItem.description,
      'related-observations': poamItem.relatedObservations.map((obs) => ({
        'observation-uuid': obs.observationUuid,
      })),
      risk: {
        status: poamItem.status,
        characterization: {
          facets: [
            {
              name: 'likelihood',
              system: 'https://fedramp.gov',
              value: poamItem.likelihood,
            },
            {
              name: 'impact',
              system: 'https://fedramp.gov',
              value: poamItem.impact,
            },
            {
              name: 'risk-level',
              system: 'https://fedramp.gov',
              value: poamItem.riskLevel,
            },
            ...(poamItem.cvssScore
              ? [
                  {
                    name: 'cvss-score',
                    system: 'https://www.first.org/cvss',
                    value: poamItem.cvssScore.toString(),
                  },
                ]
              : []),
          ],
        },
      },
      'remediation-tracking': {
        'tracking-entries': [
          {
            uuid: uuidv4(),
            'date-time-stamp': poamItem.createdAt.toISOString(),
            title: poamItem.remediationPlan,
            'scheduled-completion-date':
              poamItem.scheduledCompletionDate.toISOString(),
          },
          ...poamItem.remediationSteps.map((step) => ({
            uuid: step.uuid,
            'date-time-stamp':
              step.completedDate || poamItem.createdAt.toISOString(),
            title: step.title,
            description: step.description,
          })),
        ],
      },
    };
  }

  /**
   * Export POA&M to CSV format
   */
  exportToCSV(poamItems: POAMItemEntity[]): string {
    const headers = [
      'POA&M Item ID',
      'CVE ID',
      'Weakness Name',
      'Weakness Description',
      'Risk Level',
      'Status',
      'Remediation Plan',
      'Scheduled Completion Date',
      'Actual Completion Date',
      'Assigned To',
      'Created Date',
    ];

    const rows = poamItems.map((item) => [
      item.oscalUuid,
      item.cveId || 'N/A',
      item.title,
      item.description.replace(/"/g, '""'), // Escape quotes
      item.riskLevel,
      item.status,
      item.remediationPlan.replace(/"/g, '""'),
      item.scheduledCompletionDate.toISOString().split('T')[0],
      item.actualCompletionDate
        ? item.actualCompletionDate.toISOString().split('T')[0]
        : 'In Progress',
      item.assignedTo || 'Unassigned',
      item.createdAt.toISOString().split('T')[0],
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate summary statistics for POA&M report
   */
  generatePOAMSummary(poamItems: POAMItemEntity[]): {
    totalItems: number;
    byRiskLevel: Record<string, number>;
    byStatus: Record<string, number>;
    overdueItems: number;
    averageDaysToCompletion: number;
  } {
    const byRiskLevel: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let completedItems = 0;
    let totalDaysToCompletion = 0;
    const now = new Date();

    for (const item of poamItems) {
      // Count by risk level
      byRiskLevel[item.riskLevel] = (byRiskLevel[item.riskLevel] || 0) + 1;

      // Count by status
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;

      // Calculate days to completion for closed items
      if (item.actualCompletionDate) {
        const daysToComplete =
          (item.actualCompletionDate.getTime() - item.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        totalDaysToCompletion += daysToComplete;
        completedItems++;
      }
    }

    const overdueItems = poamItems.filter(
      (item) =>
        item.status !== POAMStatus.CLOSED && item.scheduledCompletionDate < now
    ).length;

    const averageDaysToCompletion =
      completedItems > 0 ? totalDaysToCompletion / completedItems : 0;

    return {
      totalItems: poamItems.length,
      byRiskLevel,
      byStatus,
      overdueItems,
      averageDaysToCompletion: Math.round(averageDaysToCompletion),
    };
  }
}
