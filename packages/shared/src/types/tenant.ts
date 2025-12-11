/**
 * Multi-tenant organization types
 * Aligned with M3 requirements: Multi-tenant isolation
 */

export enum TenantTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  GOVERNMENT = 'GOVERNMENT',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: TenantTier;
  status: TenantStatus;
  settings: {
    maxProjects?: number;
    maxUsers?: number;
    retentionDays?: number;
    enabledFeatures: string[];
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  repositoryUrl?: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
