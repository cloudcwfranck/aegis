# POA&M Generation

Plans of Action & Milestones (POA&Ms) are automatically generated for all Critical and High severity vulnerabilities, ensuring FedRAMP compliance.

## What is a POA&M?

A **Plan of Action & Milestones** (POA&M) is a formal document required by FedRAMP that:

- Identifies security weaknesses
- Documents remediation plans
- Sets deadlines for fixes
- Tracks progress toward resolution

POA&Ms are mandatory for:

- FedRAMP Authorization
- NIST 800-53 compliance
- Federal security audits

## OSCAL Format

Aegis generates POA&Ms in **OSCAL** (Open Security Controls Assessment Language), the NIST standard format:

```json
{
  "plan-of-action-and-milestones": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "metadata": {
      "title": "POA&M for CVE-2024-47076",
      "last-modified": "2025-12-16T15:30:00Z",
      "version": "1.0",
      "oscal-version": "1.0.4"
    },
    "poam-items": [
      {
        "uuid": "234e5678-e89b-12d3-a456-426614174001",
        "title": "curl CURLOPT_PROTOCOLS bypass vulnerability",
        "description": "Critical vulnerability in curl library allowing protocol bypass via redirect",
        "finding-uuid": "345e6789-e89b-12d3-a456-426614174002",
        "risk-statement": "Attackers could exploit this vulnerability to bypass protocol restrictions and access unintended resources",
        "risk-level": "CRITICAL",
        "related-observations": [
          {
            "observation-uuid": "456e7890-e89b-12d3-a456-426614174003",
            "description": "CVE-2024-47076 detected in curl@7.68.0"
          }
        ],
        "mitigating-factor": [
          {
            "description": "Network isolation limits exposure"
          }
        ],
        "remediation-plan": [
          {
            "uuid": "567e8901-e89b-12d3-a456-426614174004",
            "description": "Update curl to version 7.88.0 or later",
            "scheduled-completion-date": "2026-01-15"
          }
        ]
      }
    ]
  }
}
```

## FedRAMP Timelines

POA&Ms are assigned deadlines based on FedRAMP requirements:

| Severity     | Deadline    | Days from Discovery |
| ------------ | ----------- | ------------------- |
| **CRITICAL** | 30 days     | 30                  |
| **HIGH**     | 90 days     | 90                  |
| **MEDIUM**   | 180 days    | 180                 |
| **LOW**      | No deadline | N/A                 |

Example:

```
CVE-2024-47076 (CRITICAL, CVSS 9.8)
Discovered: Dec 16, 2025
Deadline: Jan 15, 2026 (30 days)
Status: OPEN
```

## POA&M Entity

POA&Ms are tracked in the database:

```typescript
@Entity()
export class POAM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  vulnerabilityId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  riskStatement: string;

  @Column({ type: 'enum', enum: POAMStatus })
  status: POAMStatus; // OPEN, IN_PROGRESS, COMPLETED, RISK_ACCEPTED, FALSE_POSITIVE

  @Column({ type: 'date' })
  discoveryDate: Date;

  @Column({ type: 'date' })
  scheduledCompletionDate: Date;

  @Column({ type: 'date', nullable: true })
  actualCompletionDate: Date;

  @Column({ type: 'jsonb' })
  remediationPlan: {
    description: string;
    steps: string[];
    estimatedEffort: string;
    assignedTo?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  nistControls: string[]; // e.g., ["RA-5", "SI-2", "CM-8"]

  @Column({ type: 'jsonb', nullable: true })
  oscalDocument: Record<string, any>;

  @OneToOne(() => Vulnerability, (vuln) => vuln.poam)
  vulnerability: Vulnerability;
}
```

## POA&M Statuses

### OPEN

Initial state when POA&M is created:

```typescript
{
  status: 'OPEN',
  discoveryDate: '2025-12-16',
  scheduledCompletionDate: '2026-01-15',
  actualCompletionDate: null
}
```

### IN_PROGRESS

Remediation work has started:

```typescript
{
  status: 'IN_PROGRESS',
  remediationPlan: {
    assignedTo: 'security-team',
    steps: [
      'Review vulnerability details',
      'Test updated version in staging',
      'Deploy to production'
    ],
    currentStep: 2
  }
}
```

### COMPLETED

Vulnerability has been fixed:

```typescript
{
  status: 'COMPLETED',
  actualCompletionDate: '2026-01-10',
  completionEvidence: {
    scanResult: 'No vulnerabilities found',
    verifiedBy: 'security-team'
  }
}
```

### RISK_ACCEPTED

Risk has been accepted (requires approval):

```typescript
{
  status: 'RISK_ACCEPTED',
  riskAcceptance: {
    reason: 'Component not exposed to network',
    approvedBy: 'CISO',
    approvalDate: '2025-12-20',
    expirationDate: '2026-06-20'
  }
}
```

### FALSE_POSITIVE

Vulnerability is not applicable:

```typescript
{
  status: 'FALSE_POSITIVE',
  falsePositiveReason: 'Vulnerable feature not enabled',
  verifiedBy: 'security-team'
}
```

## POA&M Generator Worker

Automatically generates POA&Ms for Critical and High vulnerabilities:

```typescript
export class POAMGeneratorWorker {
  async process(job: Job<POAMGenerateJob>) {
    const { evidenceId, vulnerabilities } = job.data;

    const poams: POAM[] = [];

    for (const vuln of vulnerabilities) {
      // Skip if POA&M already exists
      if (await this.poamExists(vuln.id)) {
        continue;
      }

      // Calculate deadline based on severity
      const deadline = this.calculateDeadline(vuln.severity);

      // Map to NIST controls
      const nistControls = this.mapToNISTControls(vuln);

      // Generate remediation plan
      const remediationPlan = this.generateRemediationPlan(vuln);

      // Create OSCAL document
      const oscalDocument = this.generateOSCAL({
        vulnerability: vuln,
        deadline,
        nistControls,
        remediationPlan,
      });

      // Create POA&M
      const poam = await this.createPOAM({
        vulnerabilityId: vuln.id,
        title: `Remediate ${vuln.cveId}`,
        description: vuln.description,
        riskStatement: this.generateRiskStatement(vuln),
        status: 'OPEN',
        discoveryDate: new Date(),
        scheduledCompletionDate: deadline,
        remediationPlan,
        nistControls,
        oscalDocument,
      });

      poams.push(poam);
    }

    return { poamsGenerated: poams.length };
  }

  private calculateDeadline(severity: string): Date {
    const now = new Date();
    switch (severity) {
      case 'CRITICAL':
        return addDays(now, 30);
      case 'HIGH':
        return addDays(now, 90);
      case 'MEDIUM':
        return addDays(now, 180);
      default:
        return null;
    }
  }

  private mapToNISTControls(vuln: Vulnerability): string[] {
    // Map vulnerability type to NIST 800-53 Rev 5 controls
    const controls = ['RA-5', 'SI-2']; // Always include these

    if (vuln.exploitAvailable) {
      controls.push('SI-4'); // System Monitoring
    }

    if (vuln.component.type === 'dependency') {
      controls.push('CM-8'); // System Component Inventory
    }

    return controls;
  }
}
```

## NIST 800-53 Control Mapping

POA&Ms are mapped to NIST 800-53 Rev 5 controls:

| Control  | Name                                  | Description                        |
| -------- | ------------------------------------- | ---------------------------------- |
| **RA-5** | Vulnerability Monitoring and Scanning | Continuous vulnerability scanning  |
| **SI-2** | Flaw Remediation                      | Timely patching of vulnerabilities |
| **CM-8** | System Component Inventory            | SBOM maintenance                   |
| **SI-4** | System Monitoring                     | Detection of exploitation attempts |
| **CM-7** | Least Functionality                   | Disable vulnerable features        |

Example mapping:

```typescript
{
  cveId: 'CVE-2024-47076',
  nistControls: ['RA-5', 'SI-2', 'CM-8'],
  controlMappings: [
    {
      control: 'RA-5',
      implementation: 'Automated SBOM scanning detected vulnerability',
      status: 'COMPLIANT'
    },
    {
      control: 'SI-2',
      implementation: 'Remediation planned within 30-day deadline',
      status: 'IN_PROGRESS'
    },
    {
      control: 'CM-8',
      implementation: 'Component inventory maintained in Aegis',
      status: 'COMPLIANT'
    }
  ]
}
```

## Query POA&Ms

### Get All POA&Ms

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

### Get Overdue POA&Ms

```graphql
query GetOverduePOAMs($projectId: ID!) {
  project(id: $projectId) {
    overduePOAMs {
      id
      title
      scheduledCompletionDate
      daysOverdue
      vulnerability {
        cveId
        severity
      }
    }
  }
}
```

## Update POA&M Status

```graphql
mutation UpdatePOAMStatus($id: ID!, $status: POAMStatus!, $notes: String) {
  updatePOAM(id: $id, input: { status: $status, notes: $notes }) {
    id
    status
    actualCompletionDate
  }
}
```

## POA&M Dashboard

The POA&M dashboard displays:

- **Open POA&Ms**: Count and list
- **Overdue POA&Ms**: Highlighted in red
- **Upcoming Deadlines**: Next 7 days
- **Completion Rate**: Percentage of closed POA&Ms
- **Mean Time to Remediate**: Average days from discovery to fix

Example dashboard:

```
POA&M Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 27         Overdue: 3
Open: 15          In Progress: 8
Completed: 4

Upcoming Deadlines (Next 7 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dec 18  CVE-2024-47076 (CRITICAL)
Dec 19  CVE-2024-45321 (CRITICAL)
Dec 22  CVE-2024-12345 (HIGH)

Overdue POA&Ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CVE-2024-98765 (HIGH) - 5 days overdue
CVE-2024-54321 (MEDIUM) - 12 days overdue
CVE-2024-11111 (HIGH) - 23 days overdue
```

## Export POA&Ms

Generate compliance reports:

```graphql
mutation ExportPOAMs($projectId: ID!, $format: ExportFormat!) {
  exportPOAMs(projectId: $projectId, format: $format) {
    url
    expiresAt
  }
}
```

Supported formats:

- **OSCAL JSON**: NIST standard format
- **OSCAL XML**: Alternative NIST format
- **PDF**: Human-readable report
- **CSV**: Spreadsheet format for tracking

## Best Practices

### 1. Assign Ownership

Assign POA&Ms to specific teams:

```typescript
await updatePOAM(poamId, {
  remediationPlan: {
    assignedTo: 'platform-team',
    estimatedEffort: 'MEDIUM',
  },
});
```

### 2. Track Progress

Update status as work progresses:

```typescript
// Start remediation
await updatePOAM(poamId, { status: 'IN_PROGRESS' });

// Complete remediation
await updatePOAM(poamId, {
  status: 'COMPLETED',
  actualCompletionDate: new Date(),
});
```

### 3. Monitor Deadlines

Set up alerts for upcoming deadlines:

```typescript
// Alert 7 days before deadline
cron.schedule('0 9 * * *', async () => {
  const upcomingDeadlines = await getUpcomingDeadlines(7);

  for (const poam of upcomingDeadlines) {
    await sendNotification({
      type: 'DEADLINE_APPROACHING',
      poam,
      daysRemaining: getDaysUntilDeadline(poam),
    });
  }
});
```

### 4. Document Risk Acceptance

When accepting risk, provide detailed justification:

```typescript
await updatePOAM(poamId, {
  status: 'RISK_ACCEPTED',
  riskAcceptance: {
    reason: 'Component is internal-only and not exposed to internet',
    mitigatingControls: [
      'Network segmentation',
      'Access control lists',
      'Monitoring and alerting',
    ],
    approvedBy: 'CISO',
    approvalDate: new Date(),
    expirationDate: addMonths(new Date(), 6),
  },
});
```

## Next Steps

- **[Compliance Mapping](compliance.md)** - Learn about NIST control mapping
- **[Managing POA&Ms Guide](../guides/managing-poams.md)** - Detailed POA&M management
- **[Compliance Reports Guide](../guides/compliance-reports.md)** - Generate audit reports
