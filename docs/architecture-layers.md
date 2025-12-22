# Aegis Architecture: Control Plane vs Infrastructure Adapters

**Document Version:** 1.0
**Last Updated:** 2024-12-19
**Status:** Living Document

## Executive Summary

Aegis is architectured as a **provider-neutral DevSecOps control plane** that orchestrates software supply-chain security across build, deploy, and runtime stages. The architecture explicitly separates cloud-agnostic control plane logic from provider-specific infrastructure adapters.

**Current State:** Azure Government is the reference implementation (FedRAMP High baseline, DoD IL4/IL5 capable).

**Design Intent:** Multi-cloud control plane deployable to AWS GovCloud, GCP, and on-premises Kubernetes.

## Architectural Layering

### Layer 1: Control Plane (Provider-Neutral)

The control plane contains the core business logic for policy enforcement, evidence generation, and compliance automation. These components are designed to be portable across cloud providers.

#### Policy Enforcement Engine

**Components:**
- OPA/Conftest policy evaluation
- Policy data model (PolicyEntity, PolicyEvaluationEntity)
- Policy service (CVE severity thresholds, SBOM completeness, image provenance)
- Gatekeeper integration for Kubernetes admission control

**Portability:** Kubernetes-native; works on any K8s distribution

**Cloud Dependencies:** None

#### Evidence and Compliance Engine

**Components:**
- Evidence data model (EvidenceEntity, VulnerabilityEntity, PackageEntity, POAMItemEntity)
- OSCAL 1.0.4 export service
- NIST 800-30 risk assessment engine
- NIST 800-40 remediation timeline calculator
- NIST 800-53 Rev 5 control mapper

**Portability:** Pure TypeScript logic; no cloud SDKs

**Cloud Dependencies:** None

#### SBOM and Vulnerability Processing

**Components:**
- SBOM parser (SPDX 2.3, CycloneDX)
- Vulnerability indexer (Grype integration)
- Package dependency resolver
- BullMQ workers for async processing

**Portability:** Standard open-source tool integration

**Cloud Dependencies:** Redis queue (abstracted via BullMQ)

#### Remediation Orchestration (Future: M5)

**Components:**
- Dockerfile hardening engine
- Dependency upgrade automation
- Image rebasing workflows (Chainguard, Iron Bank)
- Application rebuild and validation

**Portability:** Standard Git and container registry APIs

**Cloud Dependencies:** Storage for artifacts (abstracted in M6)

### Layer 2: Infrastructure Adapters (Provider-Specific)

These components interface with cloud-specific services. Current implementation uses Azure Government; future implementations will support AWS, GCP, and on-premises.

#### Blob Storage Adapter

**Current Implementation:** Azure Blob Storage

```typescript
// packages/api/src/services/blob-storage.service.ts
export class BlobStorageService {
  // Azure-specific implementation
  async uploadEvidence(file: Buffer): Promise<string> {
    // Uses Azure SDK
  }
}
```

**Cloud Provider:** Azure Government (`aegisblobprod.blob.core.usgovcloudapi.net`)

**Purpose:** Stores evidence artifacts, SBOMs, scan results, attestations

**Design Intent (M6):** Abstract behind storage interface

```typescript
interface StorageAdapter {
  upload(key: string, data: Buffer): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
}

class AzureBlobAdapter implements StorageAdapter { /* ... */ }
class S3Adapter implements StorageAdapter { /* ... */ }
class GCSAdapter implements StorageAdapter { /* ... */ }
class MinIOAdapter implements StorageAdapter { /* ... */ }
```

**Effort to Abstract:** 1-2 weeks (M6 milestone)

#### Container Registry Adapter

**Current Implementation:** Azure Container Registry

**Cloud Provider:** Azure Government (`aegisacr.azurecr.us`)

**Purpose:** Stores hardened container images, signed artifacts

**Design Intent (M6):** Abstract behind registry interface

```typescript
interface RegistryAdapter {
  push(image: string, tag: string): Promise<void>;
  pull(image: string, tag: string): Promise<Buffer>;
  sign(image: string, privateKey: string): Promise<void>;
  verify(image: string): Promise<boolean>;
}

class ACRAdapter implements RegistryAdapter { /* ... */ }
class ECRAdapter implements RegistryAdapter { /* ... */ }
class GCRAdapter implements RegistryAdapter { /* ... */ }
class HarborAdapter implements RegistryAdapter { /* ... */ }
```

**Effort to Abstract:** 2-3 weeks (M6 milestone)

#### Compute Platform Adapter

**Current Implementation:** Azure Container Apps

**Cloud Provider:** Azure Government (AKS-Gov underlying infrastructure)

**Purpose:** Hosts control plane API, workers, and job runners

**Design Intent (M6-M7):** Deploy to any Kubernetes distribution

**Deployment Targets:**
- AWS: EKS-Gov (Elastic Kubernetes Service)
- GCP: GKE (Google Kubernetes Engine)
- Red Hat: OpenShift
- On-premises: Vanilla Kubernetes, Rancher

**Effort to Migrate:** Low (Helm charts exist, need multi-cloud CI/CD)

#### Database Adapter (Already Portable)

**Current Implementation:** Azure Database for PostgreSQL

**Abstraction Layer:** TypeORM

**Portability Status:** ✅ Already portable

**Supported Databases:**
- AWS RDS PostgreSQL
- GCP Cloud SQL PostgreSQL
- Azure Database for PostgreSQL
- Self-hosted PostgreSQL

**Migration Effort:** Low (connection string change only)

#### Cache/Queue Adapter (Already Portable)

**Current Implementation:** Azure Cache for Redis

**Abstraction Layer:** BullMQ

**Portability Status:** ✅ Already portable

**Supported Caches:**
- AWS ElastiCache
- GCP Memorystore
- Azure Cache for Redis
- Self-hosted Redis

**Migration Effort:** Low (connection string change only)

### Layer 3: Integration Adapters (Cloud-Agnostic)

These components integrate with external systems via standard APIs and are inherently portable.

#### CI/CD Platform Adapters

**Supported Platforms:**
- GitHub Actions (webhook integration)
- GitLab CI (pipeline integration)
- Azure DevOps (pipeline tasks)
- Jenkins (plugin integration, future)

**Portability:** Standard REST APIs

**Cloud Dependencies:** None

#### Security Tool Integrations

**Integrated Tools:**
- Syft (SBOM generation)
- Grype (vulnerability scanning)
- cosign (artifact signing)
- Sigstore (transparency log)
- OPA (policy evaluation)
- Gatekeeper (admission control)

**Portability:** Standard CLI and API interfaces

**Cloud Dependencies:** None

#### Identity Provider Integration

**Current Implementation:** Platform One Keycloak

**Protocol:** OIDC / OAuth 2.0

**Portability:** Standard OIDC; works with any provider

**Supported Providers:**
- Platform One Keycloak
- Azure AD / Entra ID
- AWS Cognito
- Okta
- Auth0

**Cloud Dependencies:** None (standard OIDC)

## Portability Assessment Matrix

| Component | Current State | Portability | Multi-Cloud Ready | Effort to Abstract |
|-----------|---------------|-------------|-------------------|-------------------|
| **Control Plane** |
| Policy Engine | TypeScript | Cloud-agnostic | ✅ Yes | None (already portable) |
| Evidence Model | TypeScript | Cloud-agnostic | ✅ Yes | None (already portable) |
| OSCAL Export | TypeScript | Cloud-agnostic | ✅ Yes | None (already portable) |
| POA&M Generator | TypeScript | Cloud-agnostic | ✅ Yes | None (already portable) |
| **Database Layer** |
| PostgreSQL | TypeORM | Cloud-agnostic | ✅ Yes | Low (connection string) |
| **Queue Layer** |
| Redis/BullMQ | BullMQ | Cloud-agnostic | ✅ Yes | Low (connection string) |
| **Infrastructure Adapters** |
| Blob Storage | Azure Blob | Azure-specific | ❌ No | Medium (1-2 weeks, M6) |
| Container Registry | ACR | Azure-specific | ❌ No | Medium (2-3 weeks, M6) |
| Compute Platform | ACA | Azure-specific | ⚠️ Partial | Low (Helm exists, needs CI/CD) |
| **Integration Adapters** |
| CI/CD Integration | REST API | Cloud-agnostic | ✅ Yes | None (standard APIs) |
| Security Tools | CLI/API | Cloud-agnostic | ✅ Yes | None (standard tools) |
| Identity (OIDC) | Keycloak | Cloud-agnostic | ✅ Yes | None (standard protocol) |

## Multi-Cloud Roadmap

### Phase 1: Current State (Azure Reference Implementation) ✅

**Status:** Production deployment on Azure Government

**Components:**
- Azure Blob Storage for evidence artifacts
- Azure Container Registry for images
- Azure Container Apps for hosting
- Azure Database for PostgreSQL
- Azure Cache for Redis

**Compliance:** FedRAMP High (inherited from Azure Gov Cloud)

### Phase 2: Storage Abstraction (M6 - Est. 4 weeks)

**Objectives:**
- Create `StorageAdapter` interface
- Implement `AzureBlobAdapter` (refactor existing code)
- Implement `S3Adapter` for AWS
- Implement `GCSAdapter` for GCP
- Implement `MinIOAdapter` for on-premises

**Deliverables:**
- `/packages/api/src/adapters/storage/` module
- Adapter selection via environment variable (`STORAGE_PROVIDER=azure|s3|gcs|minio`)
- Backward compatibility with existing Azure deployments

### Phase 3: Registry Abstraction (M6 - Est. 3 weeks)

**Objectives:**
- Create `RegistryAdapter` interface
- Implement `ACRAdapter` (refactor existing code)
- Implement `ECRAdapter` for AWS
- Implement `GCRAdapter` for GCP
- Implement `HarborAdapter` for on-premises

**Deliverables:**
- `/packages/api/src/adapters/registry/` module
- Adapter selection via environment variable (`REGISTRY_PROVIDER=acr|ecr|gcr|harbor`)

### Phase 4: Multi-Cloud Infrastructure as Code (M6 - Est. 6 weeks)

**Objectives:**
- Terraform modules for AWS EKS-Gov
- Terraform modules for GCP GKE
- Helm chart updates for multi-cloud deployment
- CI/CD pipeline templates for AWS and GCP

**Deliverables:**
- `/infrastructure/terraform/modules/aws-eks-gov/`
- `/infrastructure/terraform/modules/gcp-gke/`
- Updated Helm chart with cloud-specific value overrides

### Phase 5: Production Validation (M7 - Est. 4 weeks)

**Objectives:**
- Deploy to AWS EKS-Gov test environment
- Deploy to GCP GKE test environment
- Performance and compatibility testing
- Update deployment runbooks

**Deliverables:**
- Validated AWS GovCloud deployment
- Validated GCP deployment
- Multi-cloud deployment guide

## Compliance and Authorization

### FedRAMP Authorization Strategy

**Current State (Azure):**
- Inherits Azure Government FedRAMP High authorization
- SSP references Azure Gov Cloud compliance artifacts
- POA&M items track Aegis-specific vulnerabilities

**Multi-Cloud Strategy:**
- Control plane authorization is cloud-independent (same codebase)
- Infrastructure authorization varies by cloud (AWS FedRAMP, GCP compliance)
- Customers choose cloud provider based on their ATO requirements

### DoD Impact Level Support

| Impact Level | Azure | AWS | GCP | On-Premises |
|--------------|-------|-----|-----|-------------|
| IL2 | ✅ Supported | ⏳ M6 | ⏳ M6 | ⏳ M7 |
| IL4 | ✅ Supported | ⏳ M6 | ⏳ M6 | ⏳ M7 |
| IL5 | ✅ Supported | ⏳ M6 | ❌ Not available | ⏳ M7 |
| IL6 | ⏳ Future | ⏳ Future | ❌ Not available | ⏳ M7 |

## Technical Validation

This architecture is:

✅ **Technically accurate** - Control plane components use portable abstractions (TypeORM, BullMQ, standard APIs)

✅ **Auditable** - Clear separation between cloud-agnostic logic and provider-specific adapters

✅ **Defensible** - Current Azure deployment is production-ready; multi-cloud is explicit roadmap with effort estimates

✅ **Consistent with industry patterns** - Follows adapter pattern used by Kubernetes, Cloud Native Buildpacks, and other multi-cloud platforms

✅ **FedRAMP-compliant** - Authorization strategy accounts for inherited vs. application-specific controls

## References

- [ADR-002: Evidence Blob Storage Architecture](adr/002-evidence-storage.md)
- [Azure Government Deployment Guide](deployment/azure.md)
- [M6 Roadmap: Multi-Cloud Storage Abstraction](../README.md#m6-multi-cloud-storage-abstraction-weeks-30-34)
- [NIST 800-53 Control Mapping](core-concepts/compliance.md)

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-12-19 | Initial architecture layers document | Aegis Team |
