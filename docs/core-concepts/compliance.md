# Compliance Mapping

Aegis automatically maps vulnerabilities and remediation activities to FedRAMP and NIST 800-53 Rev 5 compliance controls.

## Overview

Compliance mapping ensures that all security activities are traceable to federal requirements:

- **FedRAMP Moderate** authorization requirements
- **NIST 800-53 Rev 5** control implementation
- **Continuous monitoring** obligations
- **Audit readiness** for federal assessments

## NIST 800-53 Rev 5 Controls

Aegis implements the following security controls:

### RA-5: Vulnerability Monitoring and Scanning

**Requirement**: Organizations must scan for vulnerabilities and update scanning tools and techniques.

**Aegis Implementation**:

- Continuous SBOM scanning on every build
- Daily vulnerability database updates
- Real-time CVE monitoring
- Automated notifications for new vulnerabilities

**Evidence**:

```json
{
  "control": "RA-5",
  "implementation": {
    "scanFrequency": "On every build",
    "databaseUpdates": "Daily",
    "coverage": "100% of components",
    "lastScan": "2025-12-16T15:30:00Z"
  },
  "artifacts": [
    "SBOM files",
    "Vulnerability scan reports",
    "Audit logs"
  ]
}
```

### SI-2: Flaw Remediation

**Requirement**: Organizations must identify, report, and correct information system flaws.

**Aegis Implementation**:

- Automated POA&M generation
- FedRAMP-compliant remediation timelines (30/90/180 days)
- Remediation tracking and reporting
- Completion verification

**Evidence**:

```json
{
  "control": "SI-2",
  "implementation": {
    "criticalDeadline": "30 days",
    "highDeadline": "90 days",
    "mediumDeadline": "180 days",
    "trackingMechanism": "OSCAL POA&Ms",
    "verificationProcess": "Automated re-scanning"
  },
  "artifacts": [
    "POA&M documents",
    "Remediation reports",
    "Completion evidence"
  ]
}
```

### CM-8: System Component Inventory

**Requirement**: Organizations must develop and maintain an inventory of system components.

**Aegis Implementation**:

- Comprehensive SBOM for all applications
- Automated component tracking
- Version and license documentation
- Dependency graph visualization

**Evidence**:

```json
{
  "control": "CM-8",
  "implementation": {
    "inventoryFormat": "SPDX 2.3 and CycloneDX 1.4",
    "updateFrequency": "On every build",
    "coverage": "All software components",
    "accessibility": "API and dashboard"
  },
  "artifacts": [
    "SBOM files",
    "Component database",
    "Dependency graphs"
  ]
}
```

### SI-4: System Monitoring

**Requirement**: Organizations must monitor the information system to detect attacks and indicators of potential attacks.

**Aegis Implementation**:

- Real-time vulnerability monitoring
- Exploit detection and alerting
- Continuous CVE tracking
- Security event logging

**Evidence**:

```json
{
  "control": "SI-4",
  "implementation": {
    "monitoring": "Continuous",
    "alerting": "Real-time for Critical/High",
    "logging": "All security events",
    "retention": "7 years"
  },
  "artifacts": [
    "Monitoring logs",
    "Alert history",
    "Incident reports"
  ]
}
```

### CM-7: Least Functionality

**Requirement**: Organizations must configure systems to provide only essential capabilities.

**Aegis Implementation**:

- Identification of vulnerable features
- Recommendations for disabling unused functionality
- Configuration guidance
- Compliance verification

**Evidence**:

```json
{
  "control": "CM-7",
  "implementation": {
    "process": "Identify and document vulnerable features",
    "guidance": "Provide remediation recommendations",
    "verification": "Configuration scanning"
  },
  "artifacts": [
    "Vulnerability reports",
    "Configuration recommendations",
    "Verification scans"
  ]
}
```

## FedRAMP Requirements

### Continuous Monitoring

FedRAMP requires continuous monitoring of security controls:

**Monthly Reporting**:

- Vulnerability scan results
- POA&M status updates
- Incident reports
- Configuration changes

**Aegis Automation**:

```typescript
// Generate monthly compliance report
async function generateMonthlyReport(tenantId: string, month: Date) {
  const report = {
    reportingPeriod: month,
    tenant: tenantId,
    vulnerabilitySummary: {
      newVulnerabilities: await getNewVulnerabilities(tenantId, month),
      remediatedVulnerabilities: await getRemediatedVulnerabilities(tenantId, month),
      openPOAMs: await getOpenPOAMs(tenantId),
      overduePOAMs: await getOverduePOAMs(tenantId)
    },
    nist80053Controls: {
      'RA-5': await getRA5Evidence(tenantId, month),
      'SI-2': await getSI2Evidence(tenantId, month),
      'CM-8': await getCM8Evidence(tenantId, month),
      'SI-4': await getSI4Evidence(tenantId, month)
    },
    oscalDocuments: await generateOSCALReport(tenantId, month)
  };

  return report;
}
```

### POA&M Deadlines

FedRAMP specifies remediation timelines:

| Severity | Deadline | Aegis Enforcement |
|----------|----------|-------------------|
| Critical | 30 days | Automated POA&M with 30-day deadline |
| High | 90 days | Automated POA&M with 90-day deadline |
| Medium | 180 days | Automated POA&M with 180-day deadline |
| Low | No deadline | Tracked but no mandatory deadline |

### Deviation Requests

When deadlines cannot be met, submit deviation requests:

```graphql
mutation RequestDeadlineExtension($poamId: ID!, $input: DeviationRequestInput!) {
  requestDeadlineExtension(poamId: $poamId, input: $input) {
    id
    originalDeadline
    requestedDeadline
    justification
    approvalStatus
  }
}
```

Input:

```json
{
  "requestedDeadline": "2026-03-15",
  "justification": "Extensive testing required due to critical system dependencies",
  "mitigatingControls": [
    "Network segmentation implemented",
    "Enhanced monitoring in place",
    "Access controls strengthened"
  ],
  "approverRequired": "CISO"
}
```

## Compliance Dashboard

The compliance dashboard provides real-time status:

```
Compliance Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIST 800-53 Rev 5 Controls
✅ RA-5: Vulnerability Monitoring       COMPLIANT
✅ SI-2: Flaw Remediation               COMPLIANT
✅ CM-8: Component Inventory            COMPLIANT
⚠️  SI-4: System Monitoring             PARTIAL
✅ CM-7: Least Functionality            COMPLIANT

FedRAMP POA&M Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total POA&Ms: 27
Open: 15 (55.6%)
In Progress: 8 (29.6%)
Completed: 4 (14.8%)
Overdue: 3 (11.1%)

Upcoming Deadlines
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next 7 days: 3 POA&Ms
Next 30 days: 8 POA&Ms
```

## Audit Trail

All compliance-related activities are logged:

```typescript
@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  action: string; // e.g., 'VULNERABILITY_DETECTED', 'POAM_CREATED', 'POAM_COMPLETED'

  @Column({ type: 'jsonb' })
  details: Record<string, any>;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
}
```

Example audit log entries:

```json
[
  {
    "action": "VULNERABILITY_DETECTED",
    "details": {
      "cveId": "CVE-2024-47076",
      "severity": "CRITICAL",
      "component": "curl@7.68.0"
    },
    "timestamp": "2025-12-16T15:30:00Z"
  },
  {
    "action": "POAM_CREATED",
    "details": {
      "poamId": "123e4567-e89b-12d3-a456-426614174000",
      "vulnerabilityId": "234e5678-e89b-12d3-a456-426614174001",
      "deadline": "2026-01-15"
    },
    "timestamp": "2025-12-16T15:31:00Z"
  },
  {
    "action": "POAM_COMPLETED",
    "details": {
      "poamId": "123e4567-e89b-12d3-a456-426614174000",
      "completionDate": "2026-01-10",
      "verificationMethod": "Automated scan"
    },
    "timestamp": "2026-01-10T14:20:00Z"
  }
]
```

## Compliance Reports

Generate compliance reports for audits:

### SSP (System Security Plan) Package

```graphql
mutation GenerateSSPPackage($projectId: ID!) {
  generateSSPPackage(projectId: $projectId) {
    url
    expiresAt
    contents {
      systemSecurityPlan
      poamDocuments
      vulnerabilityReports
      sbomInventory
      auditLogs
    }
  }
}
```

### SAR (Security Assessment Report)

```graphql
mutation GenerateSAR($projectId: ID!, $assessmentPeriod: DateRange!) {
  generateSAR(projectId: $projectId, assessmentPeriod: $assessmentPeriod) {
    url
    expiresAt
    summary {
      controlsAssessed
      controlsCompliant
      findingsCount
      openPOAMsCount
    }
  }
}
```

### Continuous Monitoring Report

```graphql
mutation GenerateContinuousMonitoringReport($projectId: ID!, $month: Date!) {
  generateContinuousMonitoringReport(projectId: $projectId, month: $month) {
    url
    expiresAt
    metrics {
      newVulnerabilities
      remediatedVulnerabilities
      openPOAMs
      overduePOAMs
    }
  }
}
```

## OSCAL Export

Export compliance data in OSCAL format:

```typescript
// Export all compliance data as OSCAL
const oscalPackage = {
  systemSecurityPlan: oscalSSP,
  securityAssessmentPlan: oscalSAP,
  securityAssessmentResults: oscalSAR,
  planOfActionAndMilestones: oscalPOAM
};

// Generate OSCAL JSON
const oscalJSON = JSON.stringify(oscalPackage, null, 2);

// Generate OSCAL XML
const oscalXML = convertJSONToOSCALXML(oscalPackage);
```

## Best Practices

### 1. Maintain Current SBOMs

Generate SBOMs on every build:

```yaml
- name: Generate SBOM
  run: syft . -o spdx-json > sbom.spdx.json

- name: Upload to Aegis
  run: |
    curl -X POST $AEGIS_API_URL/api/evidence \
      -F "file=@sbom.spdx.json"
```

### 2. Monitor POA&M Deadlines

Set up alerts for upcoming deadlines:

```typescript
// Alert 7 days before deadline
await scheduleAlert({
  type: 'DEADLINE_APPROACHING',
  daysBeforeDeadline: 7,
  recipients: ['security-team@example.com']
});
```

### 3. Document Deviations

When accepting risk or extending deadlines, provide detailed justification:

```typescript
await updatePOAM(poamId, {
  status: 'RISK_ACCEPTED',
  riskAcceptance: {
    reason: 'Detailed technical justification',
    mitigatingControls: ['Control 1', 'Control 2'],
    approvedBy: 'CISO',
    approvalDate: new Date()
  }
});
```

### 4. Regular Compliance Reviews

Schedule monthly compliance reviews:

```typescript
cron.schedule('0 0 1 * *', async () => {
  const report = await generateMonthlyReport();

  await sendNotification({
    type: 'MONTHLY_COMPLIANCE_REPORT',
    recipients: ['compliance-team@example.com'],
    report
  });
});
```

## Next Steps

- **[Managing POA&Ms Guide](../guides/managing-poams.md)** - Track remediation efforts
- **[Compliance Reports Guide](../guides/compliance-reports.md)** - Generate audit reports
- **[Deployment Guide](../deployment/azure.md)** - Deploy to Azure Government Cloud
