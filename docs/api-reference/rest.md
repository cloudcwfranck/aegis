# REST API

Aegis provides a RESTful API for traditional HTTP integrations.

## Base URL

```
https://api.aegis.gov/api
```

## Authentication

Include JWT token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Upload Evidence

```bash
POST /api/evidence
```

Upload an SBOM or scan result file.

**Request**:

```bash
curl -X POST https://api.aegis.gov/api/evidence \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sbom.spdx.json" \
  -F "projectId=123e4567-e89b-12d3-a456-426614174000" \
  -F "buildId=234e5678-e89b-12d3-a456-426614174001"
```

**Response**:

```json
{
  "id": "345e6789-e89b-12d3-a456-426614174002",
  "fileName": "sbom.spdx.json",
  "fileSize": 1024,
  "status": "UPLOADED",
  "uploadedAt": "2025-12-16T15:30:00Z"
}
```

### Get Evidence

```bash
GET /api/evidence/:id
```

Retrieve evidence details.

**Response**:

```json
{
  "id": "345e6789-e89b-12d3-a456-426614174002",
  "fileName": "sbom.spdx.json",
  "fileSize": 1024,
  "status": "COMPLETED",
  "uploadedAt": "2025-12-16T15:30:00Z",
  "vulnerabilities": {
    "total": 27,
    "critical": 2,
    "high": 5,
    "medium": 12,
    "low": 8
  }
}
```

### List Projects

```bash
GET /api/projects
```

Get all projects for the authenticated tenant.

**Response**:

```json
{
  "projects": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "aegis-api",
      "description": "Aegis API Service",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Vulnerabilities

```bash
GET /api/evidence/:id/vulnerabilities?severity=CRITICAL
```

Get vulnerabilities for evidence, optionally filtered by severity.

**Response**:

```json
{
  "vulnerabilities": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174003",
      "cveId": "CVE-2024-47076",
      "severity": "CRITICAL",
      "cvssScore": 9.8,
      "description": "curl CURLOPT_PROTOCOLS bypass via redirect",
      "component": {
        "name": "curl",
        "version": "7.68.0"
      }
    }
  ]
}
```

### Health Check

```bash
GET /health
```

Check API server health.

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-16T15:30:00Z",
  "version": "0.1.0",
  "uptime": 3600
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file format",
    "details": {
      "field": "file",
      "reason": "Must be SPDX or CycloneDX format"
    }
  }
}
```

Common error codes:

- `VALIDATION_ERROR` - Invalid request parameters
- `AUTHENTICATION_ERROR` - Invalid or missing token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

For GraphQL API, see the [GraphQL API Reference](graphql.md).
