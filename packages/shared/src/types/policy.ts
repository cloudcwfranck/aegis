/**
 * Policy types for OPA/Conftest enforcement
 * Aligned with M2 and M4 requirements: Rego policies, Gatekeeper constraints
 */

export enum PolicyType {
  CVE_SEVERITY = 'CVE_SEVERITY',
  IMAGE_PROVENANCE = 'IMAGE_PROVENANCE',
  SBOM_COMPLETENESS = 'SBOM_COMPLETENESS',
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED',
  ALLOWED_REGISTRIES = 'ALLOWED_REGISTRIES',
  RESOURCE_LIMITS = 'RESOURCE_LIMITS',
  NO_PRIVILEGED = 'NO_PRIVILEGED',
  CUSTOM = 'CUSTOM',
}

export enum PolicyEnforcementLevel {
  ADVISORY = 'ADVISORY',
  WARNING = 'WARNING',
  BLOCKING = 'BLOCKING',
}

export interface Policy {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: PolicyType;
  enforcementLevel: PolicyEnforcementLevel;
  enabled: boolean;
  regoCode: string;
  parameters: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyEvaluationResult {
  policyId: string;
  passed: boolean;
  violations: Array<{
    message: string;
    severity: string;
    metadata?: Record<string, unknown>;
  }>;
  evaluatedAt: Date;
}
