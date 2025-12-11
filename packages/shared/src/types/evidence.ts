/**
 * Evidence types for SBOM and vulnerability scanning results
 * Aligned with M1 requirements: SPDX 2.3 format, Grype JSON
 */

export enum EvidenceType {
  SBOM = 'SBOM',
  VULNERABILITY_SCAN = 'VULNERABILITY_SCAN',
  SIGNATURE = 'SIGNATURE',
  POLICY_EVALUATION = 'POLICY_EVALUATION',
}

export enum SBOMFormat {
  SPDX_2_3 = 'SPDX_2_3',
  CYCLONEDX_1_4 = 'CYCLONEDX_1_4',
}

export interface Evidence {
  id: string;
  tenantId: string;
  projectName: string;
  buildId: string;
  imageDigest: string;
  type: EvidenceType;
  format?: SBOMFormat;
  s3Uri: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SBOMPackage {
  name: string;
  version: string;
  type: string;
  license?: string;
  purl?: string;
}

export interface SBOMDocument {
  format: SBOMFormat;
  version: string;
  packages: SBOMPackage[];
  relationships: Array<{
    source: string;
    target: string;
    type: string;
  }>;
  metadata: Record<string, unknown>;
}
