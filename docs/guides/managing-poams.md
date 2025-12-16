# Managing POA&Ms

Track and manage Plans of Action & Milestones for vulnerability remediation.

## Overview

POA&Ms are automatically generated for Critical and High severity vulnerabilities with FedRAMP-compliant deadlines:

- **Critical**: 30 days
- **High**: 90 days
- **Medium**: 180 days

## View POA&Ms

### Dashboard View

Navigate to your project dashboard to see:

- Total POA&Ms
- Open POA&Ms
- Overdue POA&Ms
- Upcoming deadlines

### List All POA&Ms

```graphql
query GetPOAMs($projectId: ID!) {
  project(id: $projectId) {
    poams {
      id
      title
      status
      scheduledCompletionDate
      vulnerability {
        cveId
        severity
      }
    }
  }
}
```

## Update POA&M Status

### Mark In Progress

```graphql
mutation UpdatePOAM($id: ID!) {
  updatePOAM(id: $id, input: { status: IN_PROGRESS }) {
    id
    status
  }
}
```

### Mark Completed

```graphql
mutation CompletePOAM($id: ID!) {
  updatePOAM(id: $id, input: {
    status: COMPLETED
    actualCompletionDate: "2026-01-10"
  }) {
    id
    status
    actualCompletionDate
  }
}
```

### Accept Risk

```graphql
mutation AcceptRisk($id: ID!, $reason: String!) {
  updatePOAM(id: $id, input: {
    status: RISK_ACCEPTED
    riskAcceptance: {
      reason: $reason
      approvedBy: "CISO"
    }
  }) {
    id
    status
  }
}
```

## Export POA&Ms

Generate compliance reports:

```graphql
mutation ExportPOAMs($projectId: ID!) {
  exportPOAMs(projectId: $projectId, format: OSCAL_JSON) {
    url
    expiresAt
  }
}
```

Formats:

- `OSCAL_JSON` - NIST standard format
- `OSCAL_XML` - Alternative NIST format
- `PDF` - Human-readable report
- `CSV` - Spreadsheet format

For more details, see the [POA&M Generation](../core-concepts/poam.md) guide.
