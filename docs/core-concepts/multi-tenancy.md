# Multi-Tenancy

Aegis provides enterprise-grade multi-tenant isolation using PostgreSQL Row-Level Security (RLS), ensuring complete data separation between organizations.

## Overview

Multi-tenancy enables a single Aegis instance to serve multiple organizations securely:

- **Complete data isolation** between tenants
- **Shared infrastructure** for cost efficiency
- **Independent configuration** per tenant
- **FedRAMP-compliant** tenant separation

## Tenant Entity

Each organization is represented as a tenant:

```typescript
@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string; // e.g., "acme-corp"

  @Column()
  name: string; // e.g., "Acme Corporation"

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    fedrampLevel?: 'Low' | 'Moderate' | 'High';
    retentionPolicy?: number; // days
    notificationEmails?: string[];
    customDomain?: string;
  };

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => User, user => user.tenant)
  users: User[];

  @OneToMany(() => Project, project => project.tenant)
  projects: Project[];
}
```

## Row-Level Security (RLS)

PostgreSQL RLS enforces tenant isolation at the database level:

### Enable RLS

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE poams ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
```

### Create Policies

```sql
-- Evidence table policy
CREATE POLICY tenant_isolation_evidence ON evidence
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Vulnerabilities table policy
CREATE POLICY tenant_isolation_vulnerabilities ON vulnerabilities
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- POA&Ms table policy
CREATE POLICY tenant_isolation_poams ON poams
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Set Tenant Context

Before executing queries, set the tenant context:

```typescript
// Middleware to set tenant context
export async function setTenantContext(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.user.tenantId; // From JWT token

  // Set tenant ID in PostgreSQL session
  await dataSource.query('SET app.tenant_id = $1', [tenantId]);

  next();
}
```

## Authentication & Authorization

### JWT Token Structure

JWT tokens include tenant information:

```json
{
  "sub": "user-id",
  "tenantId": "tenant-uuid",
  "roles": ["user", "admin"],
  "email": "user@example.com",
  "iat": 1702310000,
  "exp": 1702396400
}
```

### Token Validation

```typescript
export function validateToken(token: string): JWTPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  // Ensure tenant ID is present
  if (!payload.tenantId) {
    throw new Error('Invalid token: missing tenant ID');
  }

  return payload;
}
```

### Request Flow

```
1. Client sends request with JWT token
   │
   ▼
2. Middleware validates token and extracts tenantId
   │
   ▼
3. Set PostgreSQL session variable: app.tenant_id
   │
   ▼
4. Execute query (RLS automatically filters by tenant)
   │
   ▼
5. Return results (only tenant's data)
```

## Storage Isolation

### Azure Blob Storage

Each tenant has a dedicated container:

```
azure-blob-storage/
  ├── tenant-{uuid-1}/
  │     ├── evidence/
  │     ├── reports/
  │     └── exports/
  ├── tenant-{uuid-2}/
  │     ├── evidence/
  │     ├── reports/
  │     └── exports/
  └── tenant-{uuid-3}/
        ├── evidence/
        ├── reports/
        └── exports/
```

### SAS Token Scoping

Shared Access Signatures are scoped to tenant containers:

```typescript
export async function generateSASToken(tenantId: string, blobPath: string): Promise<string> {
  const containerName = `tenant-${tenantId}`;

  const sasOptions: BlobSASSignatureValues = {
    containerName,
    blobName: blobPath,
    permissions: BlobSASPermissions.parse('r'), // Read-only
    expiresOn: new Date(Date.now() + 3600 * 1000) // 1 hour
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, credential).toString();

  return `${blobServiceClient.url}/${containerName}/${blobPath}?${sasToken}`;
}
```

## Tenant Configuration

### Settings

Tenants can configure:

- **FedRAMP Level**: Low, Moderate, High
- **Retention Policy**: Evidence retention duration
- **Notifications**: Email addresses for alerts
- **Custom Domain**: Branded tenant URLs
- **SSO**: SAML/OIDC integration

Example:

```typescript
await updateTenant(tenantId, {
  settings: {
    fedrampLevel: 'Moderate',
    retentionPolicy: 1095, // 3 years
    notificationEmails: [
      'security@acme-corp.com',
      'compliance@acme-corp.com'
    ],
    customDomain: 'aegis.acme-corp.com',
    sso: {
      enabled: true,
      provider: 'SAML',
      idpMetadataUrl: 'https://idp.acme-corp.com/metadata.xml'
    }
  }
});
```

### Custom Branding

Tenants can customize the UI:

```typescript
{
  branding: {
    logo: 'https://cdn.acme-corp.com/logo.png',
    primaryColor: '#1a73e8',
    companyName: 'Acme Corporation',
    supportEmail: 'support@acme-corp.com'
  }
}
```

## User Management

### Invite Users

```graphql
mutation InviteUser($input: InviteUserInput!) {
  inviteUser(input: $input) {
    id
    email
    role
    invitationSent
  }
}
```

Input:

```json
{
  "email": "newuser@acme-corp.com",
  "role": "USER",
  "projects": ["project-id-1", "project-id-2"]
}
```

### Roles

- **OWNER**: Full access to tenant settings
- **ADMIN**: Manage projects, users, and evidence
- **USER**: View data and upload evidence
- **VIEWER**: Read-only access

## Tenant Quotas

Enforce usage limits per tenant:

```typescript
@Entity()
export class TenantQuota {
  @Column()
  tenantId: string;

  @Column({ default: 1000 })
  maxProjects: number;

  @Column({ default: 10000 })
  maxEvidence: number;

  @Column({ default: 100 * 1024 * 1024 * 1024 }) // 100 GB
  storageLimit: number;

  @Column({ default: 0 })
  storageUsed: number;
}
```

Check quota before upload:

```typescript
export async function checkQuota(tenantId: string, fileSize: number): Promise<boolean> {
  const quota = await getTenantQuota(tenantId);

  if (quota.storageUsed + fileSize > quota.storageLimit) {
    throw new Error('Storage quota exceeded');
  }

  return true;
}
```

## Tenant Metrics

Track usage per tenant:

```graphql
query TenantMetrics($tenantId: ID!) {
  tenant(id: $tenantId) {
    metrics {
      totalProjects
      totalEvidence
      totalVulnerabilities
      storageUsed
      activeUsers
      lastActivityAt
    }
  }
}
```

## Cross-Tenant Operations

### Admin Dashboard

Super-admin users can view all tenants:

```graphql
query AllTenants {
  tenants {
    id
    name
    slug
    active
    metrics {
      totalProjects
      storageUsed
      activeUsers
    }
  }
}
```

### Audit Logs

Cross-tenant audit logs for compliance:

```sql
SELECT
  t.name AS tenant_name,
  al.action,
  al.timestamp,
  u.email AS user_email
FROM audit_logs al
JOIN tenants t ON al.tenant_id = t.id
JOIN users u ON al.user_id = u.id
WHERE al.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY al.timestamp DESC;
```

## Security Considerations

### Tenant Leakage Prevention

- **RLS Enforcement**: PostgreSQL RLS cannot be bypassed
- **Connection Pooling**: Each query sets tenant context
- **API Validation**: Verify tenant ID in JWT matches requested resources
- **Storage Isolation**: Separate Azure containers per tenant

### Testing Isolation

Unit tests verify tenant isolation:

```typescript
describe('Tenant Isolation', () => {
  it('should not return other tenant data', async () => {
    // Create evidence for tenant A
    const evidenceA = await createEvidence({
      tenantId: 'tenant-a',
      fileName: 'sbom-a.json'
    });

    // Query as tenant B
    const query = dataSource
      .getRepository(Evidence)
      .createQueryBuilder('evidence')
      .where('evidence.id = :id', { id: evidenceA.id });

    // Set tenant B context
    await dataSource.query('SET app.tenant_id = $1', ['tenant-b']);

    // Should return no results
    const result = await query.getOne();
    expect(result).toBeNull();
  });
});
```

## Best Practices

### 1. Always Set Tenant Context

Never execute queries without setting tenant context:

```typescript
// ❌ BAD - No tenant context
const evidence = await dataSource.getRepository(Evidence).find();

// ✅ GOOD - Set tenant context first
await dataSource.query('SET app.tenant_id = $1', [tenantId]);
const evidence = await dataSource.getRepository(Evidence).find();
```

### 2. Validate Tenant Ownership

Verify user belongs to tenant:

```typescript
export function validateTenantAccess(user: User, tenantId: string) {
  if (user.tenantId !== tenantId) {
    throw new Error('Access denied: Invalid tenant');
  }
}
```

### 3. Use Tenant-Specific Queues

Separate queue processing per tenant:

```typescript
// Create tenant-specific queue
const queueName = `sbom-parser-${tenantId}`;
const queue = new Queue(queueName, { connection: redisConnection });
```

### 4. Monitor Cross-Tenant Metrics

Track tenant activity for billing and capacity planning:

```typescript
cron.schedule('0 0 * * *', async () => {
  const tenants = await getAllTenants();

  for (const tenant of tenants) {
    const metrics = await calculateTenantMetrics(tenant.id);

    await storeTenantMetrics(tenant.id, metrics);
  }
});
```

## Next Steps

- **[Deployment Guide](../deployment/azure.md)** - Deploy multi-tenant Aegis
- **[Configuration](../deployment/configuration.md)** - Configure tenant settings
- **[API Reference](../api-reference/authentication.md)** - Learn about authentication
