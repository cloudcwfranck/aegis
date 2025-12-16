# Integrations

Integrate Aegis with your existing DevOps tools and workflows.

## CI/CD Platforms

### GitHub Actions

```yaml
name: Aegis Security Scan

on:
  push:
    branches: [main]
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate SBOM
        run: syft . -o spdx-json > sbom.spdx.json

      - name: Upload to Aegis
        run: |
          curl -X POST ${{ secrets.AEGIS_API_URL }}/api/evidence \
            -H "Authorization: Bearer ${{ secrets.AEGIS_TOKEN }}" \
            -F "file=@sbom.spdx.json" \
            -F "projectId=${{ secrets.AEGIS_PROJECT_ID }}"

      - name: Check for Critical Vulnerabilities
        run: |
          CRITICAL_COUNT=$(curl -s ${{ secrets.AEGIS_API_URL }}/api/evidence/$EVIDENCE_ID/vulnerabilities?severity=CRITICAL | jq '.count')
          if [ $CRITICAL_COUNT -gt 0 ]; then
            echo "::error::Critical vulnerabilities found"
            exit 1
          fi
```

### GitLab CI

```yaml
security_scan:
  stage: security
  script:
    - syft . -o spdx-json > sbom.spdx.json
    - |
      curl -X POST $AEGIS_API_URL/api/evidence \
        -H "Authorization: Bearer $AEGIS_TOKEN" \
        -F "file=@sbom.spdx.json" \
        -F "projectId=$PROJECT_ID"
  only:
    - main
```

### Azure Pipelines

```yaml
- task: Bash@3
  displayName: 'Generate SBOM'
  inputs:
    targetType: 'inline'
    script: 'syft . -o spdx-json > sbom.spdx.json'

- task: Bash@3
  displayName: 'Upload to Aegis'
  inputs:
    targetType: 'inline'
    script: |
      curl -X POST $(AEGIS_API_URL)/api/evidence \
        -H "Authorization: Bearer $(AEGIS_TOKEN)" \
        -F "file=@sbom.spdx.json" \
        -F "projectId=$(PROJECT_ID)"
```

## Container Registries

### Azure Container Registry

Scan images on push:

```bash
# Build and push image
az acr build --registry myregistry --image myapp:latest .

# Generate SBOM
syft myregistry.azurecr.io/myapp:latest -o spdx-json > sbom.spdx.json

# Upload to Aegis
curl -X POST $AEGIS_API_URL/api/evidence \
  -F "file=@sbom.spdx.json"
```

## Notification Integrations

### Slack

Configure Slack webhook for notifications:

```graphql
mutation CreateSlackWebhook {
  createWebhook(
    input: {
      url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
      events: ["VULNERABILITY_DETECTED", "POAM_OVERDUE"]
    }
  ) {
    id
    active
  }
}
```

### PagerDuty

Alert on-call for Critical vulnerabilities:

```graphql
mutation CreatePagerDutyWebhook {
  createWebhook(
    input: {
      url: "https://events.pagerduty.com/v2/enqueue"
      events: ["VULNERABILITY_DETECTED"]
      filters: { severities: ["CRITICAL"] }
    }
  ) {
    id
    active
  }
}
```

## Vulnerability Scanners

### Grype

```bash
grype myapp:latest -o json | \
  curl -X POST $AEGIS_API_URL/api/evidence \
    -F "file=@-" \
    -F "projectId=$PROJECT_ID"
```

### Trivy

```bash
trivy image --format json myapp:latest | \
  curl -X POST $AEGIS_API_URL/api/evidence \
    -F "file=@-" \
    -F "projectId=$PROJECT_ID"
```

For webhook configuration, see the [Webhooks API](../api-reference/webhooks.md).
