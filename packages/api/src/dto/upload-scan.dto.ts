/**
 * Data Transfer Objects for Evidence Upload API
 */

import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class UploadScanInputDto {
  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @IsString()
  @IsNotEmpty()
  buildId!: string;

  @IsString()
  @IsNotEmpty()
  imageDigest!: string;

  @IsString()
  @IsOptional()
  gitCommitSha?: string;

  @IsString()
  @IsOptional()
  gitBranch?: string;

  @IsString()
  @IsOptional()
  ciPipelineUrl?: string;

  @IsObject()
  @IsNotEmpty()
  sbom!: Record<string, unknown>; // SPDX JSON

  @IsObject()
  @IsNotEmpty()
  vulnerabilities!: Record<string, unknown>; // Grype JSON

  @IsObject()
  @IsOptional()
  signature?: Record<string, unknown>; // cosign signature bundle
}

export interface UploadScanResponse {
  success: boolean;
  evidenceId: string;
  message: string;
  summary: {
    packageCount: number;
    vulnerabilityCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

/**
 * SPDX 2.3 Document structure (simplified)
 */
export interface SPDXDocument {
  spdxVersion: string;
  dataLicense: string;
  SPDXID: string;
  name: string;
  documentNamespace: string;
  creationInfo: {
    created: string;
    creators: string[];
  };
  packages: SPDXPackage[];
  relationships?: SPDXRelationship[];
}

export interface SPDXPackage {
  SPDXID: string;
  name: string;
  versionInfo?: string;
  filesAnalyzed?: boolean;
  licenseConcluded?: string;
  licenseDeclared?: string;
  externalRefs?: ExternalRef[];
}

export interface ExternalRef {
  referenceCategory: string;
  referenceType: string;
  referenceLocator: string;
}

export interface SPDXRelationship {
  spdxElementId: string;
  relationshipType: string;
  relatedSpdxElement: string;
}

/**
 * Grype scan results structure (simplified)
 */
export interface GrypeScanResults {
  matches: GrypeMatch[];
  source: {
    type: string;
    target: unknown;
  };
  distro?: {
    name: string;
    version: string;
  };
  descriptor: {
    name: string;
    version: string;
  };
}

export interface GrypeMatch {
  vulnerability: {
    id: string; // CVE ID
    dataSource: string;
    namespace: string;
    severity: string;
    urls: string[];
    description?: string;
    cvss?: CVSSInfo[];
  };
  relatedVulnerabilities: RelatedVulnerability[];
  matchDetails: MatchDetail[];
  artifact: {
    name: string;
    version: string;
    type: string;
    locations: Location[];
    language?: string;
    licenses?: string[];
    cpes?: string[];
    purl?: string;
  };
}

export interface CVSSInfo {
  version: string;
  vector: string;
  metrics: {
    baseScore: number;
    exploitabilityScore?: number;
    impactScore?: number;
  };
  vendorMetadata?: Record<string, unknown>;
}

export interface RelatedVulnerability {
  id: string;
  dataSource: string;
  namespace: string;
  severity: string;
  urls: string[];
  description?: string;
  cvss?: CVSSInfo[];
}

export interface MatchDetail {
  type: string;
  matcher: string;
  searchedBy: Record<string, unknown>;
  found: Record<string, unknown>;
}

export interface Location {
  path: string;
  layerID?: string;
}
