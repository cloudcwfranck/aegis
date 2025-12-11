# Aegis DevSecOps Platform

**FedRAMP Moderate ATO-ready | Impact Levels: IL2/IL4/IL5 capable**

Aegis is a multi-tenant SaaS platform for automated DevSecOps compliance, vulnerability management, and continuous ATO (Authority to Operate). Built for government agencies and contractors to achieve FedRAMP authorization faster.

## Features

- **SBOM Generation** - Syft integration for SPDX 2.3 software bill of materials
- **Vulnerability Scanning** - Grype-powered CVE detection with zero-CVE Chainguard base images
- **Image Signing & Attestation** - cosign + Sigstore for supply chain security
- **Policy Enforcement** - OPA/Gatekeeper admission control for Kubernetes
- **OSCAL POA&M Export** - Automated Plan of Action & Milestones in FedRAMP format
- **Multi-tenant RBAC** - Platform One Keycloak integration with 5 role types
- **Big Bang Integration** - Deploy to Platform One infrastructure with FluxCD
- **Automated Code Remediation** - AI-assisted vulnerability fixing (M7)

## Technology Stack

### Application Layer
- **Backend**: Node.js 18+, TypeScript, GraphQL (Apollo Server), TypeORM
- **Frontend**: React 18, Vite, TypeScript
- **Database**: PostgreSQL 15 with row-level security (RLS)
- **Queue**: BullMQ + Redis for async evidence processing
- **Storage**: S3-Gov (AWS) / Azure Blob Storage (Azure Gov)

### Infrastructure Layer
- **Kubernetes**: AKS-Gov (Azure) / EKS-Gov (AWS)
- **Service Mesh**: Istio with mTLS
- **GitOps**: FluxCD for continuous deployment
- **Policy Engine**: OPA Gatekeeper
- **Registry**: Harbor with Trivy scanning
- **Monitoring**: Prometheus + Grafana + Jaeger

### Security & Compliance
- **Base Images**: Chainguard (zero-CVE containers)
- **SBOM Tools**: Syft (SPDX 2.3 generation)
- **Scanners**: Grype (vulnerability detection)
- **Signing**: cosign + Sigstore (keyless signing)
- **KMS**: Azure Key Vault Gov / AWS KMS (FIPS 140-2)

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

See [docs/development.md](docs/development.md) for detailed setup instructions.

## Project Structure

```
aegis/
├── packages/                    # Monorepo packages (npm workspaces)
│   ├── api/                    # Backend GraphQL/REST API
│   ├── web/                    # Frontend React app
│   ├── shared/                 # Shared TypeScript types
│   ├── db/                     # TypeORM entities and migrations
│   └── workers/                # BullMQ background workers
│
├── infrastructure/              # Infrastructure as Code
│   ├── terraform/
│   │   ├── modules/            # AKS-Gov, EKS-Gov, KMS, Storage
│   │   └── environments/       # dev, staging, prod-gov
│   └── helm/aegis/            # Helm chart for Kubernetes
│
├── .github/workflows/          # CI/CD pipelines
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   ├── design/                # Design documents (KMS, etc.)
│   └── runbooks/              # Operational procedures
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
- [x] Terraform modules for AKS-Gov and EKS-Gov
- [x] CI/CD pipeline templates (GitHub Actions, GitLab CI)
- [x] Architecture Decision Records (ADR-001 through ADR-006)
- [x] KMS design document

### ⏳ M1: Evidence Ingestion + SBOM/Scanning (Weeks 3-6)

**Objectives**:
- Build evidence collection pipeline (GraphQL + REST API)
- Integrate Syft for SBOM generation (SPDX 2.3 format)
- Integrate Grype for vulnerability scanning
- Implement BullMQ workers for async processing
- S3-Gov blob storage with encryption at rest

**Key Deliverables**:
- Evidence upload API: `POST /api/v1/scans/upload`
- TypeORM entities: Evidence, Artifact, Build, Vulnerability
- Worker queue processing 100+ concurrent uploads
- React UI: Evidence list view with filtering

### ⏳ M2: Signing/Attestation + Policy Gates + POA&M Export (Weeks 7-11)

**Objectives**:
- Integrate cosign attestation with Sigstore
- Implement OPA/Conftest policy enforcement
- Generate OSCAL-compliant POA&M documents
- Export POA&M in multiple formats (OSCAL JSON, CSV, DOCX)

### ⏳ M3: UI v2 + RBAC + Vulnerability Heatmap (Weeks 12-16)

**Objectives**:
- Platform One Keycloak OIDC integration
- Multi-tenant RBAC (5 roles: OrgAdmin, ISSO, DevSecOps, Developer, Auditor)
- Vulnerability heatmap visualization (D3.js/Recharts)
- CVE triage workflow with SLA tracking

### ⏳ M4: Gatekeeper Enforcement + Admission Control (Weeks 18-22)

**Objectives**:
- Deploy OPA Gatekeeper to Kubernetes clusters
- Implement constraint templates (SignedImagesOnly, NoLatestTag, etc.)
- Dynamic policy sync from Aegis API to Gatekeeper

### ⏳ M5: Big Bang Baseline on AKS-Gov/EKS-Gov (Weeks 23-28)

**Objectives**:
- Deploy Platform One Big Bang with FluxCD
- Istio service mesh with mTLS enforcement
- Harbor registry integration
- Aegis as Big Bang add-on package

### ⏳ M6: Production Readiness + ATO Package (Weeks 30-34)

**Objectives**:
- Prometheus + Grafana dashboards
- Security hardening (DISA STIGs, CIS Benchmark)
- OSCAL System Security Plan (SSP) generation
- Performance and load testing

### ⏳ M7: Automated Code Remediation (Weeks 35-42)

**Objectives**:
- AI-assisted code remediation engine
- Automated Dockerfile generation (Chainguard base images)
- Dependency upgrade with CVE resolution
- Git pull request generation with before/after SBOM

## Architecture Decision Records

All major architectural decisions are documented in [docs/adr/](docs/adr/):

- [ADR-001: Multi-tenant Kubernetes namespace isolation](docs/adr/001-multi-tenant-isolation.md)
- [ADR-002: Evidence blob storage architecture](docs/adr/002-evidence-storage.md)
- [ADR-003: OSCAL-native POA&M generation](docs/adr/003-oscal-poam.md)
- [ADR-004: Platform One Keycloak RBAC](docs/adr/004-keycloak-rbac.md)
- [ADR-005: Chainguard zero-CVE containers](docs/adr/005-chainguard-containers.md)
- [ADR-006: Automated code remediation](docs/adr/006-code-remediation.md)

## Government Cloud Deployment

### Prerequisites (Critical Path)

These activities have 8-12 week lead times and must start immediately:

1. **Azure Government subscription** - Request via Microsoft Azure Government portal
2. **AWS GovCloud account** - Apply with MFA token at aws.amazon.com/govcloud-us
3. **DISA IL authorization package** - Required for IL4+ environments
4. **Platform One Party Bus access** - Register at https://p1.dso.mil
5. **Chainguard Enterprise credentials** - Sign up at chainguard.dev
6. **DoD PKI certificates** - Request from DISA for production deployment

### Deployment Regions

**Azure Government**:
- Primary: `usgovvirginia`
- Secondary: `usgovtexas`
- DoD IL4/IL5: `usdodeast`, `usdodcentral`

**AWS GovCloud**:
- Primary: `us-gov-west-1`
- Secondary: `us-gov-east-1`

### Infrastructure Provisioning

```bash
# Navigate to environment
cd infrastructure/terraform/environments/prod-gov

# Initialize Terraform
terraform init

# Plan infrastructure
terraform plan -var-file=terraform.tfvars

# Apply (create AKS-Gov or EKS-Gov cluster)
terraform apply
```

See [infrastructure/terraform/README.md](infrastructure/terraform/README.md) for detailed instructions.

## CI/CD Templates for User Projects

Aegis provides reusable CI/CD templates for scanning user applications:

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

See [.github/templates/user-ci-template.yml](.github/templates/user-ci-template.yml) for full example.

### GitLab CI

```yaml
# .gitlab-ci.yml
include:
  - remote: 'https://aegis.dso.mil/ci-templates/aegis-scan.yml'

variables:
  AEGIS_API_URL: $AEGIS_API_URL
  AEGIS_API_TOKEN: $AEGIS_API_TOKEN
```

See [.gitlab/ci/.gitlab-ci-template.yml](.gitlab/ci/.gitlab-ci-template.yml) for full example.

## Compliance & Security

### NIST 800-53 Controls

Aegis implements controls from NIST 800-53 Rev 5:

- **AC-2**: Account Management (Keycloak RBAC)
- **AC-3**: Access Enforcement (multi-tenant isolation)
- **AU-2**: Audit Events (comprehensive logging)
- **CM-2**: Baseline Configuration (SBOM + Gatekeeper)
- **IA-2**: Identification and Authentication (Platform One Keycloak)
- **SC-7**: Boundary Protection (network policies, Istio mTLS)
- **SC-8**: Transmission Confidentiality (TLS 1.3)
- **SC-13**: Cryptographic Protection (FIPS 140-2)
- **SI-2**: Flaw Remediation (automated POA&M, Chainguard images)

### FedRAMP Authorization

Aegis is designed for FedRAMP Moderate ATO:

- **SSP Generation**: OSCAL 1.0.4 System Security Plan
- **POA&M Tracking**: Automated vulnerability-to-POA&M mapping
- **Continuous Monitoring**: Real-time CVE detection and remediation
- **Evidence Collection**: Automated SBOM + scan results storage

See [docs/compliance/fedramp-controls.md](docs/compliance/fedramp-controls.md) for control mapping.

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
