# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Aegis DevSecOps Platform.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences.

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
