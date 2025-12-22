# Welcome to Aegis DevSecOps Platform

Build production-ready, FedRAMP-compliant DevSecOps pipelines with automated vulnerability management and compliance reporting.

## What is Aegis?

**Aegis** is an enterprise-grade DevSecOps platform designed specifically for organizations requiring FedRAMP compliance. Built on modern cloud-native technologies, Aegis automates the collection, analysis, and reporting of security vulnerabilities while maintaining strict compliance with NIST 800-53 Rev 5 controls.

Aegis goes beyond simple vulnerability scanning by providing a comprehensive approach to security compliance, with **automated POA&M generation**, **real-time compliance dashboards**, and **multi-tenant isolation** that ensures enterprise-grade security and stability.

The platform provides the flexibility and performance needed for scalable government cloud deployments, supporting **Azure Government Cloud** with complete FedRAMP Moderate authorization.

## Why Aegis?

### Built for Compliance First

Unlike general-purpose DevOps tools, Aegis is designed from the ground up for federal compliance requirements:

- **FedRAMP Moderate Authorization** - Production-ready for government workloads
- **NIST 800-53 Rev 5 Controls** - Automated mapping to RA-5, SI-2, CM-8, and more
- **Automated POA&M Generation** - 30-day deadlines for Critical, 90-day for High vulnerabilities
- **Audit Trail** - Complete evidence retention and compliance reporting

### Production-Grade Architecture

- **Multi-tenant Isolation** - Secure separation using PostgreSQL Row-Level Security
- **Azure Government Cloud** - Deployed on FedRAMP-authorized infrastructure
- **Scalable Queue Processing** - BullMQ-powered asynchronous job processing
- **Secure Storage** - Azure Blob Storage with encryption at rest and in transit

### Developer-Friendly

- **GraphQL & REST APIs** - Modern API-first architecture
- **TypeScript** - End-to-end type safety across the platform
- **Container-Native** - Docker-based deployments with Chainguard hardened images
- **Monorepo Structure** - Streamlined development with Turborepo

## Key Features

| Feature                    | Description                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **SBOM Processing**        | Automated Software Bill of Materials parsing supporting SPDX 2.3 and CycloneDX formats |
| **Vulnerability Scanning** | Integration with Grype, Trivy, and other industry-standard scanners                    |
| **POA&M Automation**       | Generate OSCAL-compliant Plans of Action & Milestones with FedRAMP timelines           |
| **Compliance Dashboard**   | Real-time visibility into security posture and remediation status                      |
| **Evidence Storage**       | Tamper-proof evidence collection with Azure Blob Storage                               |
| **Multi-tenant**           | Enterprise-ready tenant isolation with PostgreSQL RLS                                  |

## Technology Stack

Aegis is built on proven, enterprise-grade technologies:

- **Backend**: Node.js, TypeScript, Express, GraphQL
- **Database**: PostgreSQL with Row-Level Security
- **Queue**: BullMQ with Redis
- **Storage**: Azure Blob Storage
- **Frontend**: React, TypeScript, Vite
- **Infrastructure**: Azure Government Cloud, Terraform
- **Containers**: Chainguard hardened images

## Getting Started

Ready to get started? Check out our [Quickstart Guide](quickstart.md) to set up Aegis in minutes.

For a comprehensive understanding of the platform architecture, see [Architecture Overview](architecture.md).

## Licensing

Aegis is proprietary software provided under a license for government use only.

Copyright © 2024 Aegis Platform Team. All rights reserved.

## Support

- **Documentation**: [docs.aegis.dso.mil](https://docs.aegis.dso.mil)
- **Platform One Party Bus**: [https://p1.dso.mil](https://p1.dso.mil)
- **Email**: aegis-support@example.gov
