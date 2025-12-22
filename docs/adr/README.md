# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Aegis DevSecOps Control Plane.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs provide transparency into why certain technical approaches were chosen over alternatives.

## Architectural Principles

Aegis is designed as a **provider-neutral control plane** with the following core principles:

1. **Separation of Concerns**: Control plane logic (policy enforcement, evidence generation) is decoupled from infrastructure adapters (storage, registry, compute)
2. **Portability by Design**: Components use abstraction layers (TypeORM for database, BullMQ for queues) that work across cloud providers
3. **Standards-Based Integration**: Integrates with open-source tools (OPA, Grype, cosign) via standard APIs, not proprietary SDKs
4. **Kubernetes-Native**: Designed to run on any Kubernetes distribution (AKS, EKS, GKE, OpenShift, on-premises)
5. **Cloud-Agnostic Workflows**: Policy evaluation, SBOM generation, and compliance artifacts are independent of cloud infrastructure

## Current State vs Design Intent

**Current Implementation:** Azure Government serves as the reference deployment (FedRAMP High baseline, DoD IL4/IL5 capable)

**Design Intent:** Multi-cloud control plane with pluggable storage, registry, and compute adapters (est. M6 milestone for AWS/GCP support)

## ADR Index

- [ADR-001: Multi-tenant Kubernetes namespace isolation strategy](001-multi-tenant-isolation.md)
- [ADR-002: Evidence blob storage architecture](002-evidence-storage.md)
- [ADR-003: OSCAL-native POA&M generation approach](003-oscal-poam.md)
- [ADR-004: Platform One Keycloak integration for RBAC](004-keycloak-rbac.md)
- [ADR-005: Chainguard zero-CVE container strategy](005-chainguard-containers.md)
- [ADR-006: Automated code remediation architecture](006-code-remediation.md)

## Format

Each ADR follows this structure:

1. **Title**: Clear, concise decision statement
2. **Status**: Proposed, Accepted, Deprecated, Superseded
3. **Context**: What is the issue we're seeing that motivates this decision?
4. **Decision**: What is the change we're proposing and/or doing?
5. **Consequences**: What becomes easier or more difficult as a result of this change?
6. **Portability Considerations**: How does this decision affect multi-cloud portability?

## Relationship to Multi-Cloud Strategy

ADRs document both current implementation decisions (Azure-specific) and future portability requirements. Each ADR includes a "Portability Considerations" section that discusses:

- How the decision supports or constrains multi-cloud deployment
- What abstractions are needed for provider-independence
- Migration path from current (Azure) to multi-cloud support
