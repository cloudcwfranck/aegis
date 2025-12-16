# Vulnerability Scanning

Aegis automatically scans software components for known vulnerabilities, providing real-time security insights and compliance reporting.

## Overview

The **Vulnerability Indexer** matches software components from SBOMs against vulnerability databases to identify security issues.

```
SBOM Components
     │
     ▼
┌──────────────────┐
│ Query CVE DBs    │
│ - NVD            │
│ - OSV            │
│ - GitHub         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Match & Score    │
│ - CVE ID         │
│ - CVSS Score     │
│ - Severity       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Store Vulns      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Generate POA&Ms  │
└──────────────────┘
```

## Vulnerability Sources

Aegis queries multiple authoritative vulnerability databases:

### National Vulnerability Database (NVD)

- **Maintainer**: NIST
- **Coverage**: Cross-ecosystem (all languages/platforms)
- **Update Frequency**: Real-time
- **CVSS Scoring**: CVSS 2.0, 3.0, 3.1

### Open Source Vulnerabilities (OSV)

- **Maintainer**: Google
- **Coverage**: Open-source ecosystems
- **Update Frequency**: Real-time
- **Format**: Standardized JSON

### GitHub Advisory Database

- **Maintainer**: GitHub
- **Coverage**: npm, PyPI, Maven, NuGet, RubyGems
- **Update Frequency**: Real-time
- **Integration**: Native GitHub Security Advisories

## Vulnerability Entity

Vulnerabilities are stored with complete metadata:

```typescript
@Entity()
export class Vulnerability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  evidenceId: string;

  @Column()
  componentId: string;

  @Column()
  cveId: string; // e.g., CVE-2024-47076

  @Column()
  severity: VulnerabilitySeverity; // CRITICAL, HIGH, MEDIUM, LOW, NONE

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  cvssScore: number; // 0.0 - 10.0

  @Column({ nullable: true })
  cvssVector: string; // e.g., CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H

  @Column('text')
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  references: string[]; // URLs to advisories

  @Column({ type: 'date', nullable: true })
  publishedAt: Date;

  @Column({ type: 'date', nullable: true })
  modifiedAt: Date;

  @Column({ default: false })
  exploitAvailable: boolean;

  @Column({ nullable: true })
  fixedVersion: string; // Version that fixes the vulnerability

  @ManyToOne(() => Component, (component) => component.vulnerabilities)
  component: Component;

  @OneToOne(() => POAM, (poam) => poam.vulnerability)
  poam: POAM;
}
```

## Severity Levels

Aegis uses CVSS 3.1 scores to classify vulnerabilities:

| Severity     | CVSS Score | Color     | FedRAMP Deadline |
| ------------ | ---------- | --------- | ---------------- |
| **CRITICAL** | 9.0 - 10.0 | 🔴 Red    | 30 days          |
| **HIGH**     | 7.0 - 8.9  | 🟠 Orange | 90 days          |
| **MEDIUM**   | 4.0 - 6.9  | 🟡 Yellow | 180 days         |
| **LOW**      | 0.1 - 3.9  | ⚪ Gray   | No deadline      |
| **NONE**     | 0.0        | ⚪ Gray   | N/A              |

## CVSS Scoring

The **Common Vulnerability Scoring System (CVSS)** provides a standardized vulnerability assessment:

### CVSS Vector Example

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

**Breakdown**:

- **AV:N** - Attack Vector: Network
- **AC:L** - Attack Complexity: Low
- **PR:N** - Privileges Required: None
- **UI:N** - User Interaction: None
- **S:U** - Scope: Unchanged
- **C:H** - Confidentiality Impact: High
- **I:H** - Integrity Impact: High
- **A:H** - Availability Impact: High

**Score**: 9.8 (Critical)

## Vulnerability Indexer Worker

The worker scans components for vulnerabilities:

```typescript
export class VulnerabilityIndexerWorker {
  async process(job: Job<VulnerabilityScanJob>) {
    const { evidenceId, components } = job.data;

    const vulnerabilities: Vulnerability[] = [];

    for (const component of components) {
      // Query multiple databases
      const nvdVulns = await this.queryNVD(component.purl);
      const osvVulns = await this.queryOSV(component.purl);
      const ghVulns = await this.queryGitHubAdvisory(component.purl);

      // Merge and deduplicate
      const allVulns = this.mergeVulnerabilities([
        ...nvdVulns,
        ...osvVulns,
        ...ghVulns,
      ]);

      // Filter to applicable versions
      const applicableVulns = this.filterByVersion(allVulns, component.version);

      vulnerabilities.push(...applicableVulns);
    }

    // Store vulnerabilities
    await this.storeVulnerabilities(evidenceId, vulnerabilities);

    // Queue POA&M generation for Critical and High
    const criticalAndHigh = vulnerabilities.filter(
      (v) => v.severity === 'CRITICAL' || v.severity === 'HIGH'
    );

    if (criticalAndHigh.length > 0) {
      await this.queuePOAMGeneration(evidenceId, criticalAndHigh);
    }

    return {
      vulnerabilitiesFound: vulnerabilities.length,
      critical: vulnerabilities.filter((v) => v.severity === 'CRITICAL').length,
      high: vulnerabilities.filter((v) => v.severity === 'HIGH').length,
    };
  }
}
```

## Vulnerability Matching

Aegis uses multiple strategies to match components to vulnerabilities:

### 1. Package URL (PURL) Matching

```typescript
// Match by PURL
const purl = 'pkg:npm/express@4.17.1';
const vulns = await db.query(
  'SELECT * FROM vulnerabilities WHERE affected_packages @> $1',
  [purl]
);
```

### 2. CPE Matching

For system packages:

```typescript
// Match by CPE (Common Platform Enumeration)
const cpe = 'cpe:2.3:a:nodejs:node.js:18.12.0:*:*:*:*:*:*:*';
const vulns = await cveDatabase.findByCPE(cpe);
```

### 3. Version Range Matching

```typescript
// Check if component version falls within vulnerable range
function isVulnerable(componentVersion: string, vulnRange: string): boolean {
  // Example: vulnRange = ">=4.0.0, <4.17.3"
  return semver.satisfies(componentVersion, vulnRange);
}
```

## Exploit Detection

Aegis flags vulnerabilities with known exploits:

```typescript
@Column({ default: false })
exploitAvailable: boolean;

@Column({ type: 'jsonb', nullable: true })
exploitMetadata: {
  exploitDB?: string;      // ExploitDB ID
  metasploit?: string;     // Metasploit module
  nuclei?: string;         // Nuclei template
  references?: string[];   // PoC URLs
};
```

Sources:

- **ExploitDB**: Public exploit database
- **Metasploit**: Penetration testing framework
- **Nuclei Templates**: Vulnerability scanning templates
- **CISA KEV**: Known Exploited Vulnerabilities catalog

## False Positive Handling

Mark vulnerabilities as false positives:

```graphql
mutation MarkFalsePositive($id: ID!, $reason: String!) {
  markVulnerabilityFalsePositive(id: $id, reason: $reason) {
    id
    falsePositive
    falsePositiveReason
    falsePositiveMarkedBy
    falsePositiveMarkedAt
  }
}
```

False positive reasons:

- **Not applicable**: Component not actually used
- **Mitigated**: Compensating controls in place
- **Configuration**: Vulnerable feature disabled
- **Environment**: Not exposed in deployment environment

## Vulnerability Dashboard

Query vulnerability metrics:

```graphql
query VulnerabilityMetrics($projectId: ID!, $timeRange: TimeRange!) {
  project(id: $projectId) {
    vulnerabilityMetrics(timeRange: $timeRange) {
      total
      critical
      high
      medium
      low
      trend {
        date
        count
      }
      topVulnerabilities {
        cveId
        severity
        cvssScore
        affectedComponentsCount
      }
    }
  }
}
```

Dashboard displays:

- **Severity Distribution**: Pie chart of Critical/High/Medium/Low
- **Trend Over Time**: Line graph showing vulnerability count by date
- **Top CVEs**: Table of most prevalent vulnerabilities
- **Remediation Status**: Progress toward fixing issues
- **POA&M Deadlines**: Upcoming FedRAMP compliance deadlines

## Remediation Guidance

Aegis provides remediation recommendations:

```json
{
  "cveId": "CVE-2024-47076",
  "component": {
    "name": "express",
    "currentVersion": "4.17.1",
    "fixedVersion": "4.18.2"
  },
  "remediation": {
    "action": "UPDATE",
    "recommendation": "Update express to version 4.18.2 or later",
    "commands": ["npm install express@4.18.2", "npm update express"],
    "breakingChanges": false,
    "estimatedEffort": "LOW"
  }
}
```

## Continuous Monitoring

Aegis monitors for new vulnerabilities affecting existing components:

```typescript
// Daily job to check for new CVEs
cron.schedule('0 2 * * *', async () => {
  const activeComponents = await getActiveComponents();

  for (const component of activeComponents) {
    const newVulns = await checkForNewVulnerabilities(component);

    if (newVulns.length > 0) {
      await sendNotification({
        type: 'NEW_VULNERABILITY',
        component: component.name,
        vulnerabilities: newVulns,
      });

      await generatePOAMs(newVulns);
    }
  }
});
```

## Notifications

Configure alerts for new vulnerabilities:

- **Email**: Send to security team
- **Slack**: Post to #security channel
- **Webhook**: HTTP POST to external system
- **PagerDuty**: Page on-call engineer (Critical only)

## Best Practices

### 1. Scan on Every Build

Integrate scanning into CI/CD:

```yaml
- name: Generate SBOM
  run: syft . -o spdx-json > sbom.spdx.json

- name: Upload to Aegis
  run: |
    curl -X POST $AEGIS_API_URL/api/evidence \
      -F "file=@sbom.spdx.json"

- name: Check for Critical Vulnerabilities
  run: |
    CRITICAL_COUNT=$(curl -s $AEGIS_API_URL/api/evidence/$EVIDENCE_ID/vulnerabilities?severity=CRITICAL | jq '.count')
    if [ $CRITICAL_COUNT -gt 0 ]; then
      echo "Critical vulnerabilities found. Failing build."
      exit 1
    fi
```

### 2. Prioritize by Exploitability

Focus on vulnerabilities with known exploits:

```sql
SELECT * FROM vulnerabilities
WHERE severity IN ('CRITICAL', 'HIGH')
  AND exploit_available = true
ORDER BY cvss_score DESC;
```

### 3. Track Remediation Progress

Monitor fix rate:

```graphql
query RemediationMetrics {
  vulnerabilityMetrics {
    total
    fixed
    inProgress
    open
    falsePositives
    fixRate
    meanTimeToRemediate
  }
}
```

### 4. Automate Dependency Updates

Use tools like Dependabot or Renovate to automatically update dependencies:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
```

## Next Steps

- **[POA&M Generation](poam.md)** - Learn about automated remediation planning
- **[Compliance Mapping](compliance.md)** - Understand NIST control mapping
- **[Managing POA&Ms Guide](../guides/managing-poams.md)** - Track remediation efforts
