# Webhooks

Configure webhooks to receive real-time notifications for security events.

## Overview

Aegis can send HTTP POST requests to your endpoints when important events occur:

- New vulnerability detected
- POA&M deadline approaching
- Evidence processing completed
- Critical vulnerability discovered

## Webhook Configuration

Configure webhooks via the API:

```graphql
mutation CreateWebhook($input: WebhookInput!) {
  createWebhook(input: $input) {
    id
    url
    events
    secret
    active
  }
}
```

Variables:

```json
{
  "input": {
    "url": "https://your-app.com/webhooks/aegis",
    "events": ["VULNERABILITY_DETECTED", "POAM_OVERDUE"],
    "secret": "your-webhook-secret"
  }
}
```

## Webhook Events

### VULNERABILITY_DETECTED

Sent when a new vulnerability is discovered:

```json
{
  "event": "VULNERABILITY_DETECTED",
  "timestamp": "2025-12-16T15:30:00Z",
  "data": {
    "vulnerabilityId": "456e7890-e89b-12d3-a456-426614174003",
    "cveId": "CVE-2024-47076",
    "severity": "CRITICAL",
    "cvssScore": 9.8,
    "component": {
      "name": "curl",
      "version": "7.68.0"
    },
    "projectId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### POAM_OVERDUE

Sent when a POA&M passes its deadline:

```json
{
  "event": "POAM_OVERDUE",
  "timestamp": "2025-12-16T15:30:00Z",
  "data": {
    "poamId": "567e8901-e89b-12d3-a456-426614174004",
    "vulnerabilityId": "456e7890-e89b-12d3-a456-426614174003",
    "cveId": "CVE-2024-47076",
    "scheduledCompletionDate": "2026-01-15",
    "daysOverdue": 5
  }
}
```

### EVIDENCE_COMPLETED

Sent when evidence processing finishes:

```json
{
  "event": "EVIDENCE_COMPLETED",
  "timestamp": "2025-12-16T15:30:00Z",
  "data": {
    "evidenceId": "345e6789-e89b-12d3-a456-426614174002",
    "fileName": "sbom.spdx.json",
    "vulnerabilitiesFound": 27,
    "criticalCount": 2,
    "highCount": 5
  }
}
```

## Webhook Security

### Signature Verification

All webhook requests include an `X-Aegis-Signature` header:

```
X-Aegis-Signature: sha256=abc123...
```

Verify the signature:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Best Practices

1. **Verify signatures** for all webhook requests
2. **Use HTTPS** endpoints only
3. **Return 200 OK** quickly to avoid retries
4. **Process asynchronously** for long-running tasks
5. **Monitor failures** and update webhook config if needed

For API authentication, see the [Authentication Guide](authentication.md).
