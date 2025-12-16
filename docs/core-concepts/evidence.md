# Evidence Ingestion

Evidence is the foundation of Aegis's compliance tracking. This page explains how evidence is collected, processed, and stored.

## What is Evidence?

In Aegis, **evidence** refers to any artifact that demonstrates security compliance:

- **SBOMs** (Software Bill of Materials)
- **Vulnerability scan results**
- **Container image scan reports**
- **Code analysis reports**
- **Security test results**

Evidence provides the raw data that Aegis processes to generate vulnerability reports, POA&Ms, and compliance dashboards.

## Evidence Lifecycle

```
Upload → Store → Parse → Scan → Report
```

### 1. Upload

Evidence can be uploaded via:

- **Web Interface**: Drag-and-drop or file picker
- **REST API**: `POST /api/evidence`
- **GraphQL API**: `createEvidence` mutation
- **CI/CD Integration**: Automated uploads from build pipelines

### 2. Store

Upon upload, Aegis:

1. Validates file format and size
2. Generates unique evidence ID
3. Stores file in Azure Blob Storage
4. Creates metadata record in PostgreSQL
5. Enqueues processing job

**Storage Structure**:

```
azure-blob-storage/
  └── tenant-{uuid}/
        └── evidence/
              └── {evidence-id}/
                    ├── original.json       # Original uploaded file
                    ├── parsed.json         # Parsed SBOM data
                    └── scan-results.json   # Vulnerability scan output
```

### 3. Parse

The **SBOM Parser Worker** processes the evidence:

- Detects format (SPDX, CycloneDX, Syft, etc.)
- Extracts software components
- Normalizes package identifiers
- Resolves dependencies
- Stores components in database

### 4. Scan

The **Vulnerability Indexer Worker** scans components:

- Queries vulnerability databases (NVD, OSV, GitHub Advisory)
- Matches components to known CVEs
- Calculates CVSS scores
- Identifies exploitable vulnerabilities
- Flags Critical and High severity issues

### 5. Report

Results are made available via:

- **Dashboard**: Real-time compliance metrics
- **POA&Ms**: Automatically generated remediation plans
- **API**: Programmatic access to findings
- **Exports**: PDF and JSON compliance reports

## Evidence Types

### SBOM Files

Aegis supports industry-standard SBOM formats:

#### SPDX (Recommended)

```json
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "aegis-api",
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-express",
      "name": "express",
      "versionInfo": "4.18.2",
      "supplier": "Organization: OpenJS Foundation",
      "downloadLocation": "https://registry.npmjs.org/express/-/express-4.18.2.tgz"
    }
  ]
}
```

#### CycloneDX

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2"
    }
  ]
}
```

### Scan Results

Aegis accepts scan results from:

- **Grype**: Container and filesystem vulnerability scanner
- **Trivy**: Comprehensive security scanner
- **Snyk**: Developer security platform
- **Custom Scanners**: JSON format following Aegis schema

Example Grype output:

```json
{
  "matches": [
    {
      "vulnerability": {
        "id": "CVE-2024-47076",
        "severity": "Critical",
        "cvss": [
          {
            "version": "3.1",
            "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
            "score": 9.8
          }
        ]
      },
      "artifact": {
        "name": "curl",
        "version": "7.68.0"
      }
    }
  ]
}
```

## Evidence Entity

The `Evidence` entity stores metadata about uploaded files:

```typescript
@Entity()
export class Evidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  projectId: string;

  @Column()
  buildId: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column()
  blobUrl: string;

  @Column({ type: 'enum', enum: EvidenceStatus })
  status: EvidenceStatus; // UPLOADED, PARSING, PARSED, SCANNING, COMPLETED, FAILED

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  uploadedAt: Date;

  @OneToMany(() => Vulnerability, (vuln) => vuln.evidence)
  vulnerabilities: Vulnerability[];
}
```

## Upload Evidence

### Via Web Interface

1. Navigate to the Aegis dashboard
2. Select your project
3. Click **"Upload Evidence"**
4. Select SBOM or scan result file
5. Click **"Upload"**

The interface shows real-time progress:

- ✅ File uploaded
- ✅ SBOM parsed (X components found)
- ✅ Vulnerability scan complete (X vulnerabilities found)
- ✅ POA&Ms generated

### Via REST API

```bash
curl -X POST http://localhost:3001/api/evidence \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sbom.spdx.json" \
  -F "projectId=123e4567-e89b-12d3-a456-426614174000" \
  -F "buildId=123e4567-e89b-12d3-a456-426614174001"
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "fileName": "sbom.spdx.json",
  "fileSize": 1024,
  "status": "UPLOADED",
  "uploadedAt": "2025-12-16T15:30:00Z"
}
```

### Via GraphQL API

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
    "buildId": "123e4567-e89b-12d3-a456-426614174001",
    "file": "base64-encoded-file-content"
  }
}
```

### Via CI/CD Pipeline

#### GitHub Actions

```yaml
name: Upload SBOM to Aegis

on:
  push:
    branches: [main]

jobs:
  upload-sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate SBOM
        run: |
          syft . -o spdx-json > sbom.spdx.json

      - name: Upload to Aegis
        env:
          AEGIS_API_URL: ${{ secrets.AEGIS_API_URL }}
          AEGIS_TOKEN: ${{ secrets.AEGIS_TOKEN }}
          PROJECT_ID: ${{ secrets.AEGIS_PROJECT_ID }}
        run: |
          curl -X POST $AEGIS_API_URL/api/evidence \
            -H "Authorization: Bearer $AEGIS_TOKEN" \
            -F "file=@sbom.spdx.json" \
            -F "projectId=$PROJECT_ID"
```

## Evidence Processing

### Queue Jobs

Evidence processing is handled by background workers:

```typescript
// SBOM Parser Queue
await sbomParserQueue.add('parse-sbom', {
  evidenceId: evidence.id,
  blobUrl: evidence.blobUrl,
  format: 'spdx-2.3',
});

// Vulnerability Indexer Queue
await vulnerabilityIndexerQueue.add('scan-components', {
  evidenceId: evidence.id,
  components: parsedComponents,
});

// POA&M Generator Queue
await poamGeneratorQueue.add('generate-poam', {
  evidenceId: evidence.id,
  vulnerabilities: criticalAndHighVulns,
});
```

### Status Tracking

Monitor evidence processing status:

```graphql
query GetEvidenceStatus($id: ID!) {
  evidence(id: $id) {
    id
    status
    fileName
    uploadedAt
    processingStartedAt
    processingCompletedAt
    vulnerabilities {
      totalCount
      criticalCount
      highCount
    }
  }
}
```

## Retention Policy

Evidence is retained according to FedRAMP requirements:

- **Raw Evidence**: 3 years minimum
- **Parsed Data**: 3 years minimum
- **Audit Logs**: 7 years (configurable)

Retention is enforced via:

- Azure Blob Storage lifecycle management
- PostgreSQL archival policies
- Automated compliance reports

## Security Considerations

### Access Control

- Evidence is tenant-isolated
- Access controlled via JWT claims
- Row-Level Security enforces tenant boundaries

### Encryption

- **In Transit**: TLS 1.2+ for uploads
- **At Rest**: Azure Storage Service Encryption
- **Database**: PostgreSQL SSL connections

### Validation

- File size limits (100MB default)
- MIME type validation
- Malware scanning (future)
- Schema validation for SBOMs

## Next Steps

- **[SBOM Processing](sbom.md)** - Learn how SBOMs are parsed
- **[Vulnerability Scanning](vulnerabilities.md)** - Understand vulnerability detection
- **[Upload Evidence Guide](../guides/upload-evidence.md)** - Detailed upload instructions
