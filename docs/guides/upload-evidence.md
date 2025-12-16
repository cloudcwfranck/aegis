# Upload Evidence

Step-by-step guide to uploading evidence to Aegis.

## Overview

Evidence can be uploaded through:

- Web interface
- REST API
- GraphQL API
- CI/CD pipeline integration

## Via Web Interface

### 1. Navigate to Dashboard

Go to http://localhost:5173 (development) or your Aegis instance URL.

### 2. Select Project

Click on the project where you want to upload evidence.

### 3. Click "Upload Evidence"

Click the **"Upload Evidence"** button in the top right corner.

### 4. Select File

Choose your SBOM or scan result file:

- SPDX 2.3 JSON (`.spdx.json`)
- CycloneDX 1.4 JSON (`.cyclonedx.json`)
- Grype JSON output
- Trivy JSON output

### 5. Review and Upload

Review the file details and click **"Upload"**.

### 6. Monitor Processing

Watch real-time progress:

- ✅ File uploaded
- ✅ SBOM parsed (X components found)
- ✅ Vulnerability scan complete
- ✅ POA&Ms generated

## Via REST API

```bash
curl -X POST https://api.aegis.gov/api/evidence \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sbom.spdx.json" \
  -F "projectId=123e4567-e89b-12d3-a456-426614174000" \
  -F "buildId=234e5678-e89b-12d3-a456-426614174001"
```

## Via CI/CD

### GitHub Actions

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

For more details, see the [Evidence Ingestion](../core-concepts/evidence.md) guide.
