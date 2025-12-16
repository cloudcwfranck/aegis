# GraphQL API

Aegis provides a comprehensive GraphQL API for flexible data querying.

## Endpoint

```
POST https://api.aegis.gov/graphql
```

## Authentication

Include JWT token in the Authorization header:

```bash
curl -X POST https://api.aegis.gov/graphql \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ projects { id name } }"}'
```

## Schema

### Query Evidence

```graphql
query GetEvidence($id: ID!) {
  evidence(id: $id) {
    id
    fileName
    fileSize
    status
    uploadedAt
    vulnerabilities {
      id
      cveId
      severity
      cvssScore
      description
    }
    components {
      id
      name
      version
      purl
    }
  }
}
```

### Query Vulnerabilities

```graphql
query GetVulnerabilities($projectId: ID!, $severity: VulnerabilitySeverity) {
  project(id: $projectId) {
    vulnerabilities(severity: $severity) {
      id
      cveId
      severity
      cvssScore
      cvssVector
      description
      publishedAt
      fixedVersion
      component {
        name
        version
      }
      poam {
        id
        status
        scheduledCompletionDate
      }
    }
  }
}
```

### Query POA&Ms

```graphql
query GetPOAMs($projectId: ID!, $status: POAMStatus) {
  project(id: $projectId) {
    poams(status: $status) {
      id
      title
      status
      discoveryDate
      scheduledCompletionDate
      actualCompletionDate
      vulnerability {
        cveId
        severity
        cvssScore
      }
      remediationPlan {
        description
        assignedTo
      }
    }
  }
}
```

### Upload Evidence

```graphql
mutation UploadEvidence($input: EvidenceInput!) {
  createEvidence(input: $input) {
    id
    fileName
    status
    uploadedAt
  }
}
```

Variables:

```json
{
  "input": {
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "buildId": "234e5678-e89b-12d3-a456-426614174001",
    "file": "base64-encoded-file-content"
  }
}
```

### Update POA&M

```graphql
mutation UpdatePOAM($id: ID!, $input: POAMInput!) {
  updatePOAM(id: $id, input: $input) {
    id
    status
    actualCompletionDate
  }
}
```

Variables:

```json
{
  "id": "345e6789-e89b-12d3-a456-426614174002",
  "input": {
    "status": "COMPLETED",
    "actualCompletionDate": "2026-01-10"
  }
}
```

## GraphQL Playground

Access the interactive GraphQL Playground at:

```
https://api.aegis.gov/graphql
```

For REST API endpoints, see the [REST API Reference](rest.md).
