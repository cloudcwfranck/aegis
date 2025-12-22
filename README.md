# Aegis DevSecOps Control Plane

**Provider-Neutral Architecture | FedRAMP Moderate Capable | DoD IL2/IL4/IL5 Ready**

Aegis is a provider-neutral DevSecOps control plane that orchestrates software supply-chain hardening, policy enforcement, and compliance evidence generation across build-time, deploy-time, and runtime environments. The control plane architecture is designed for portability across cloud providers and Kubernetes distributions, with Azure Government serving as the current reference implementation.

## What Aegis Does

Aegis ingests existing codebases and container images, applies automated hardening and policy enforcement, and delivers deployable, compliant software artifacts with continuous evidence trails for FedRAMP, DoD IL4, and OSCAL-based authorization processes.

**Aegis does not replace CI/CD platforms, Kubernetes, or vulnerability scanners.** It operates as an orchestration layer that integrates existing security tools with policy-driven workflows.

## Documentation

📚 **[View Full Documentation](https://aegis.dev/docs)** | [Build Locally](#building-documentation)

## Core Capabilities

- **Code and Image Ingestion** - Connect to existing Git repositories and container registries
- **Hardening and Remediation** - Rebase onto Iron Bank or Chainguard zero-CVE baselines
- **SBOM Generation** - SPDX 2.3-compliant software bill of materials via Syft
- **Vulnerability Scanning** - CVE detection and indexing via Grype
- **Cryptographic Signing** - Artifact signing and attestation via cosign and Sigstore
- **Policy Enforcement** - OPA/Conftest policy evaluation and Kubernetes admission control (Gatekeeper)
- **Compliance Automation** - OSCAL 1.0.4 POA&M generation, NIST 800-53 control mapping, continuous evidence
- **CI/CD Integration** - GitHub Actions, GitLab CI, Azure DevOps workflow integration
- **Multi-tenant RBAC** - Platform One Keycloak integration with role-based access control

## Architecture: Control Plane vs Infrastructure Adapters

### Control Plane Layer (Provider-Neutral)

These components are cloud-agnostic by design and portable across providers:

- **Policy Engine**: OPA, Conftest, Gatekeeper integration
- **Evidence Data Model**: SBOM, vulnerabilities, POA&M, OSCAL artifacts
- **Remediation Orchestration**: Hardening workflows and validation pipelines
- **Compliance Logic**: NIST 800-30 risk assessment, 800-40 remediation timelines, 800-53 control mapping
- **CI/CD Adapters**: GitHub Actions, GitLab CI, Azure DevOps integration
- **Database Layer**: TypeORM abstraction supporting PostgreSQL on any cloud
- **Queue Layer**: BullMQ abstraction supporting Redis on any cloud

### Infrastructure Adapter Layer (Current: Azure Government)

These components are provider-specific in the current deployment:

- **Blob Storage**: Azure Blob Storage (Gov Cloud endpoint: `aegisblobprod.blob.core.usgovcloudapi.net`)
  - **Design Intent**: Abstract behind storage interface supporting S3, GCS, MinIO
- **Container Registry**: Azure Container Registry (`aegisacr.azurecr.us`)
  - **Design Intent**: Abstract behind registry interface supporting ECR, GCR, Harbor
- **Compute Platform**: Azure Container Apps
  - **Design Intent**: Deploy to EKS, GKE, on-premises Kubernetes via Helm
- **Database**: Azure Database for PostgreSQL (portable via TypeORM)
- **Cache/Queue**: Azure Cache for Redis (portable via BullMQ)

**Why Azure is the reference implementation:**
- FedRAMP High authorization for Azure Gov Cloud
- DoD IL4/IL5 compliance baseline
- Rapid deployment via Azure Container Apps

**Portability roadmap:** Storage and registry abstraction layers are explicit engineering objectives (est. 4-6 weeks for multi-cloud support).

## Technology Stack

### Application Layer (Cloud-Agnostic)

- **Backend**: Node.js 18+, TypeScript, REST API, TypeORM
- **Frontend**: React 18, Vite, TypeScript
- **Database**: PostgreSQL 15 (portable: AWS RDS, GCP Cloud SQL, Azure DB, self-hosted)
- **Queue**: BullMQ + Redis (portable: ElastiCache, Memorystore, Azure Cache, self-hosted)
- **Policy Engine**: OPA, Conftest, Gatekeeper (Kubernetes-native)

### Infrastructure Layer (Provider-Specific)

**Current Deployment (Azure Government):**
- Kubernetes: Azure Kubernetes Service (AKS-Gov)
- Storage: Azure Blob Storage
- Registry: Azure Container Registry
- KMS: Azure Key Vault (FIPS 140-2)

**Supported Kubernetes Distributions (Design Intent):**
- Amazon Elastic Kubernetes Service (EKS-Gov)
- Google Kubernetes Engine (GKE)
- Red Hat OpenShift
- On-premises Kubernetes

### Security & Compliance Tools (Provider-Neutral)

- **Base Images**: Chainguard zero-CVE containers, Iron Bank hardened images
- **SBOM Tools**: Syft (SPDX 2.3 generation)
- **Scanners**: Grype (vulnerability detection)
- **Signing**: cosign + Sigstore (keyless signing)
- **Service Mesh**: Istio with mTLS (Kubernetes-native)
- **GitOps**: FluxCD (Kubernetes-native)
- **Monitoring**: Prometheus, Grafana, Jaeger (Kubernetes-native)

## Quick Start

### Prerequisites

- **Node.js**: 18.19.0+ (see `.nvmrc`)
- **Docker**: 24.0+ with Docker Compose
- **npm**: 9.0+

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/aegis.git
cd aegis

# Install dependencies
npm install

# Start local infrastructure (PostgreSQL, Redis, MinIO)
npm run docker:dev

# Run database migrations
npm run db:migrate

# Start development servers (API + Web + Workers)
npm run dev

# Open browser
open http://localhost:3000
```

### Environment Configuration

Copy `.env.example` files from each package:

```bash
cp packages/api/.env.example packages/api/.env
```

See [docs/environment-configuration.md](docs/environment-configuration.md) for detailed configuration.

## Project Structure

```
aegis/
├── packages/                    # Monorepo packages (npm workspaces)
│   ├── api/                    # Backend REST API (control plane)
│   ├── web/                    # Frontend React app
│   ├── shared/                 # Shared TypeScript types
│   ├── db/                     # TypeORM entities and migrations
│   └── workers/                # BullMQ background workers
│
├── infrastructure/              # Infrastructure as Code
│   ├── terraform/
│   │   ├── modules/            # Cloud-specific modules (AKS, EKS, KMS, Storage)
│   │   └── environments/       # dev, staging, prod-gov
│   └── helm/aegis/            # Kubernetes Helm chart (cloud-agnostic)
│
├── .github/workflows/          # CI/CD pipelines
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   ├── design/                # Design documents
│   ├── core-concepts/         # Evidence, SBOM, POA&M, Compliance
│   └── deployment/            # Azure (reference), AWS, GCP (future)
│
├── package.json               # Root workspace configuration
├── turbo.json                # Turborepo build configuration
└── README.md                 # This file
```

## Roadmap

### ✅ Sprint 0: Foundation (Weeks 0-2) - COMPLETED

- [x] Monorepo structure with npm workspaces + Turborepo
- [x] TypeScript configuration and linting
- [x] Docker Compose for local development
- [x] Terraform modules for Azure Government
- [x] CI/CD pipeline templates (GitHub Actions, GitLab CI)
- [x] Architecture Decision Records (ADR-001 through ADR-006)

### ✅ M1: Evidence Ingestion + SBOM/Scanning (Weeks 3-6) - COMPLETED

- [x] Evidence collection pipeline (REST API)
- [x] Syft integration for SBOM generation (SPDX 2.3)
- [x] Grype integration for vulnerability scanning
- [x] BullMQ workers for async processing
- [x] Azure Blob Storage with encryption at rest
- [x] TypeORM entities: Evidence, Vulnerability, Package
- [x] React UI: Evidence list view with filtering

### ✅ M2: POA&M Export + Policy Enforcement (Weeks 7-11) - COMPLETED

- [x] OSCAL 1.0.4 POA&M generation
- [x] NIST 800-30 risk assessment engine
- [x] NIST 800-40 remediation timeline calculation
- [x] NIST 800-53 Rev 5 control mapping
- [x] Policy evaluation service (OPA/Conftest integration)
- [x] Multi-format export (OSCAL JSON, CSV)
- [x] Vulnerability-to-POA&M auto-generation

### ⏳ M3: UI v2 + RBAC + Vulnerability Dashboard (Weeks 12-16)

**Objectives:**
- Platform One Keycloak OIDC integration
- Multi-tenant RBAC (5 roles: OrgAdmin, ISSO, DevSecOps, Developer, Auditor)
- Vulnerability dashboard with risk heatmap
- CVE triage workflow with SLA tracking
- POA&M management UI

### ⏳ M4: Signing/Attestation + Gatekeeper Enforcement (Weeks 18-22)

**Objectives:**
- cosign integration for artifact signing
- Sigstore attestation generation
- OPA Gatekeeper deployment to Kubernetes
- Dynamic policy sync from Aegis to Gatekeeper
- Admission control constraint templates

### ⏳ M5: Image Hardening + Chainguard Rebasing (Weeks 23-28)

**Objectives:**
- Automated Dockerfile generation with Chainguard base images
- Iron Bank baseline integration
- Dependency upgrade automation
- Application rebuild and validation workflows
- Before/after SBOM comparison

### ⏳ M6: Multi-Cloud Storage Abstraction (Weeks 30-34)

**Objectives:**
- Storage interface abstraction layer
- AWS S3 adapter implementation
- GCP Cloud Storage adapter implementation
- MinIO adapter for on-premises deployments
- Terraform modules for AWS EKS-Gov deployment

### ⏳ M7: Production Readiness + ATO Package (Weeks 35-40)

**Objectives:**
- Prometheus + Grafana dashboards
- Security hardening (DISA STIGs, CIS Benchmark)
- OSCAL System Security Plan (SSP) generation
- Performance and load testing
- Production deployment playbooks

## Architecture Decision Records

All major architectural decisions are documented in [docs/adr/](docs/adr/):

- [ADR-001: Multi-tenant Kubernetes namespace isolation](docs/adr/001-multi-tenant-isolation.md)
- [ADR-002: Evidence blob storage architecture](docs/adr/002-evidence-storage.md)
- [ADR-003: OSCAL-native POA&M generation](docs/adr/003-oscal-poam.md)
- [ADR-004: Platform One Keycloak RBAC](docs/adr/004-keycloak-rbac.md)
- [ADR-005: Chainguard zero-CVE containers](docs/adr/005-chainguard-containers.md)
- [ADR-006: Automated code remediation](docs/adr/006-code-remediation.md)

## Current State vs Design Intent

### Current State: Azure Reference Implementation

**What is deployed today:**

Aegis runs on Azure Government Cloud infrastructure:
- Azure Blob Storage for evidence artifact storage
- Azure Container Registry for hardened image storage
- Azure Container Apps for control plane hosting
- Azure Database for PostgreSQL for relational data
- Azure Cache for Redis for job queues

**Compliance baseline:** FedRAMP High (Azure Gov Cloud), DoD IL4/IL5 capable

### Design Intent: Multi-Cloud Control Plane

**Architectural decisions made for portability:**

- Storage operations use service interface pattern (future: S3, GCS, MinIO adapters)
- TypeORM abstracts database (portable to any PostgreSQL instance)
- BullMQ abstracts Redis (portable to any Redis instance)
- All components containerized (deployable to any Kubernetes distribution)
- No proprietary Azure SDKs in control plane logic

**Roadmap to multi-cloud:** Storage and registry abstraction layers are M6 deliverables (est. 6-8 weeks).

## Government Cloud Deployment (Azure Reference)

### Prerequisites

These activities have 8-12 week lead times:

1. **Azure Government subscription** - Request via Microsoft Azure Government portal
2. **DISA IL authorization package** - Required for IL4+ environments
3. **Platform One Party Bus access** - Register at https://p1.dso.mil
4. **Chainguard Enterprise credentials** - Sign up at chainguard.dev
5. **DoD PKI certificates** - Request from DISA for production deployment

### Deployment Regions (Azure Government)

- Primary: `usgovvirginia`
- Secondary: `usgovtexas`
- DoD IL4/IL5: `usdodeast`, `usdodcentral`

### Infrastructure Provisioning

```bash
# Navigate to Azure Government environment
cd infrastructure/terraform/environments/prod-gov

# Initialize Terraform
terraform init

# Plan infrastructure
terraform plan -var-file=terraform.tfvars

# Apply (create AKS-Gov cluster)
terraform apply
```

See [docs/deployment/azure.md](docs/deployment/azure.md) for detailed Azure deployment instructions.

**Future cloud providers:** AWS GovCloud (M6), GCP (M6), on-premises Kubernetes (M7).

## CI/CD Integration (Cloud-Agnostic)

Aegis integrates with CI/CD platforms via standard REST APIs:

### GitHub Actions

```yaml
# .github/workflows/aegis-scan.yml
name: Aegis Security Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aegis/sbom-scan-action@v1
        with:
          aegis_api_url: ${{ secrets.AEGIS_API_URL }}
          aegis_api_token: ${{ secrets.AEGIS_API_TOKEN }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
include:
  - remote: 'https://aegis.dso.mil/ci-templates/aegis-scan.yml'

variables:
  AEGIS_API_URL: $AEGIS_API_URL
  AEGIS_API_TOKEN: $AEGIS_API_TOKEN
```

### Azure DevOps

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: AegisScan@1
    inputs:
      aegisApiUrl: $(AEGIS_API_URL)
      aegisApiToken: $(AEGIS_API_TOKEN)
```

## Compliance & Security

### NIST 800-53 Controls (Provider-Neutral)

Aegis implements controls from NIST 800-53 Rev 5:

- **AC-2**: Account Management (Keycloak RBAC)
- **AC-3**: Access Enforcement (multi-tenant isolation)
- **AU-2**: Audit Events (comprehensive logging)
- **CM-2**: Baseline Configuration (SBOM + Gatekeeper)
- **IA-2**: Identification and Authentication (Platform One Keycloak)
- **SC-7**: Boundary Protection (network policies, Istio mTLS)
- **SC-8**: Transmission Confidentiality (TLS 1.3)
- **SC-13**: Cryptographic Protection (FIPS 140-2 via cloud KMS)
- **SI-2**: Flaw Remediation (automated POA&M, Chainguard images)
- **RA-5**: Vulnerability Monitoring (Grype continuous scanning)

### FedRAMP Authorization Path

Aegis is designed for FedRAMP Moderate ATO:

- **SSP Generation**: OSCAL 1.0.4 System Security Plan (M7)
- **POA&M Automation**: Vulnerability-to-POA&M mapping with NIST 800-30 risk scoring (M2 ✅)
- **Continuous Monitoring**: Real-time CVE detection and evidence generation (M1 ✅)
- **Evidence Collection**: Automated SBOM + scan results + attestations (M1 ✅)

Current deployment inherits Azure Government FedRAMP High authorization.

## Development Commands

```bash
# Build all packages
npm run build

# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run typecheck

# Clean build artifacts
npm run clean

# Database migrations
npm run db:migrate
npm run db:generate

# Start/stop local services
npm run docker:dev
npm run docker:down
```

## Building Documentation

Build the MkDocs documentation locally:

```bash
# Install MkDocs and Material theme
pip install mkdocs mkdocs-material mkdocs-material-extensions

# Serve documentation with live reload
mkdocs serve

# Build static site
mkdocs build
```

The documentation will be available at http://localhost:8000.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Copyright © 2024 Aegis Platform Team. All rights reserved.

This software is provided under a proprietary license for government use only.

## Support

- **Documentation**: [docs.aegis.dso.mil](https://docs.aegis.dso.mil)
- **Platform One Party Bus**: [https://p1.dso.mil](https://p1.dso.mil)
- **Issue Tracker**: GitHub Issues
- **Email**: aegis-support@example.gov

## Acknowledgments

- **Platform One**: Big Bang framework and Keycloak integration
- **Chainguard**: Zero-CVE container base images
- **Anchore**: Syft SBOM and Grype scanning tools
- **Sigstore**: cosign signing and transparency log
- **NIST**: OSCAL framework and 800-53 controls
- **CNCF**: Kubernetes, OPA, Gatekeeper, Istio, Prometheus
