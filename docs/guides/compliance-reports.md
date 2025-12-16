# Compliance Reports

Generate FedRAMP and NIST compliance reports for audits.

## Report Types

### SSP Package (System Security Plan)

Complete security package including:

- System Security Plan
- POA&M documents
- Vulnerability reports
- SBOM inventory
- Audit logs

```graphql
mutation GenerateSSPPackage($projectId: ID!) {
  generateSSPPackage(projectId: $projectId) {
    url
    expiresAt
  }
}
```

### SAR (Security Assessment Report)

Assessment of security controls:

```graphql
mutation GenerateSAR($projectId: ID!, $assessmentPeriod: DateRange!) {
  generateSAR(projectId: $projectId, assessmentPeriod: $assessmentPeriod) {
    url
    expiresAt
  }
}
```

### Continuous Monitoring Report

Monthly compliance report for FedRAMP:

```graphql
mutation GenerateMonthlyReport($projectId: ID!, $month: Date!) {
  generateContinuousMonitoringReport(projectId: $projectId, month: $month) {
    url
    expiresAt
  }
}
```

## OSCAL Format

All reports are available in OSCAL (Open Security Controls Assessment Language):

- OSCAL JSON
- OSCAL XML

## Report Contents

### Vulnerability Summary

- Total vulnerabilities by severity
- New vulnerabilities this period
- Remediated vulnerabilities
- Open POA&Ms

### Control Assessment

- NIST 800-53 Rev 5 controls
- Implementation status
- Evidence artifacts

### Compliance Status

- FedRAMP authorization status
- Continuous monitoring compliance
- Outstanding issues

For more details, see the [Compliance Mapping](../core-concepts/compliance.md) guide.
