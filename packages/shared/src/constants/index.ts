/**
 * Shared constants for Aegis platform
 */

export const AEGIS_VERSION = '0.1.0';

export const NIST_CONTROLS = {
  AU_2: 'Audit Events',
  CM_2: 'Baseline Configuration',
  IA_2: 'Identification and Authentication',
  SC_7: 'Boundary Protection',
  SI_2: 'Flaw Remediation',
} as const;

export const COMPLIANCE_FRAMEWORKS = {
  FEDRAMP_MODERATE: 'FedRAMP Moderate',
  NIST_800_53_R5: 'NIST 800-53 Rev 5',
  DISA_STIG: 'DISA STIG',
  IL2: 'Impact Level 2',
  IL4: 'Impact Level 4',
  IL5: 'Impact Level 5',
} as const;

export const CVE_SLA_DAYS = {
  CRITICAL: 30,
  HIGH: 90,
  MEDIUM: 180,
  LOW: 365,
} as const;

export const SUPPORTED_LANGUAGES = [
  'nodejs',
  'python',
  'java',
  'go',
  'ruby',
  'dotnet',
] as const;

export const CHAINGUARD_REGISTRY = 'cgr.dev/chainguard' as const;
