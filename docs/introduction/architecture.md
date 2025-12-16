# Architecture Overview

Aegis is built on a modern, cloud-native architecture designed for security, scalability, and compliance.

## High-Level Architecture

```
┌─────────────────┐
│   Web Frontend  │ (React + TypeScript)
│   Port: 5173    │
└────────┬────────┘
         │
         │ HTTP/GraphQL
         ▼
┌─────────────────┐
│   API Server    │ (Express + GraphQL)
│   Port: 3001    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐
│ PostgreSQL│ │ Redis│ │ Azure   │ │ Queue    │
│ Database  │ │ Cache│ │ Blob    │ │ Workers  │
│           │ │      │ │ Storage │ │          │
└───────────┘ └──────┘ └─────────┘ └──────────┘
```

## Core Components

### 1. Web Frontend

**Technology**: React, TypeScript, Vite

The web frontend provides:

- Landing page showcasing platform capabilities
- Evidence upload interface
- Compliance dashboard with real-time metrics
- POA&M management interface
- Vulnerability drill-down views

**Key Features**:

- Material-inspired UI design
- Type-safe API client
- Responsive layout for desktop and mobile
- Real-time updates via GraphQL subscriptions

### 2. API Server

**Technology**: Node.js, Express, GraphQL, TypeORM

The API server is the core of Aegis, handling:

- **Evidence Ingestion**: Receives SBOMs and scan results
- **Authentication**: JWT-based authentication with multi-tenant support
- **GraphQL API**: Flexible query interface for frontend
- **REST API**: Traditional REST endpoints for integrations
- **Job Scheduling**: Enqueues background processing tasks

**Endpoints**:

- `POST /api/evidence` - Upload evidence files
- `GET /api/projects` - List projects
- `POST /graphql` - GraphQL API
- `GET /health` - Health check endpoint

### 3. Database (PostgreSQL)

**Version**: PostgreSQL 15+

Aegis uses PostgreSQL for:

- Evidence metadata storage
- Vulnerability records
- POA&M tracking
- User and tenant data
- Audit logs

**Key Features**:

- **Row-Level Security (RLS)**: Multi-tenant data isolation
- **Indexes**: Optimized queries for CVE lookups and vulnerability searches
- **Foreign Keys**: Referential integrity across entities
- **Migrations**: TypeORM migrations for schema versioning

**Entity Relationships**:

```
Tenant
  ├── Project
  │     ├── Build
  │     │     ├── Evidence
  │     │     │     ├── Vulnerability
  │     │     │     │     └── POA&M
  │     │     │     └── Component (from SBOM)
  │     │     └── ScanResult
  │     └── Policy
  └── User
```

### 4. Queue System (BullMQ + Redis)

**Technology**: BullMQ, Redis

The queue system handles asynchronous processing:

- **SBOM Parser Queue**: Parses SPDX and CycloneDX files
- **Vulnerability Indexer Queue**: Scans components for vulnerabilities
- **POA&M Generator Queue**: Creates OSCAL POA&Ms with FedRAMP timelines

**Queue Flow**:

```
Upload Evidence
     │
     ▼
┌────────────────┐
│ SBOM Parser    │ → Extract components
└───────┬────────┘
        │
        ▼
┌──────────────────┐
│ Vuln Indexer     │ → Scan for CVEs
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│ POA&M Generator  │ → Create POA&Ms
└──────────────────┘
```

### 5. Azure Blob Storage

**Technology**: Azure Blob Storage

Stores:

- Original SBOM files
- Scan result artifacts
- Generated compliance reports
- Evidence attachments

**Security**:

- Encryption at rest (Azure Storage Service Encryption)
- Encryption in transit (TLS 1.2+)
- Shared Access Signatures (SAS) for time-limited access
- Tenant-isolated containers

### 6. Queue Workers

**Technology**: Node.js, BullMQ

Background workers process queued jobs:

**SBOM Parser Worker**:

- Parses SPDX 2.3 and CycloneDX formats
- Extracts package components
- Normalizes package identifiers
- Stores components in database

**Vulnerability Indexer Worker**:

- Queries vulnerability databases (NVD, OSV, GitHub Advisory)
- Matches components to known CVEs
- Calculates CVSS scores
- Flags Critical and High severity issues

**POA&M Generator Worker**:

- Creates OSCAL POA&M documents
- Applies FedRAMP deadlines (30 days Critical, 90 days High)
- Maps to NIST 800-53 Rev 5 controls
- Generates compliance reports

## Data Flow

### Evidence Upload Flow

```
1. User uploads SBOM file via Web UI
   │
   ▼
2. API receives file, stores in Azure Blob Storage
   │
   ▼
3. API creates Evidence record in PostgreSQL
   │
   ▼
4. API enqueues SBOM parsing job
   │
   ▼
5. SBOM Parser Worker processes file
   │
   ├─→ Extracts components
   ├─→ Stores in database
   └─→ Enqueues vulnerability scanning
       │
       ▼
6. Vulnerability Indexer Worker scans components
   │
   ├─→ Queries CVE databases
   ├─→ Stores vulnerability records
   └─→ Enqueues POA&M generation
       │
       ▼
7. POA&M Generator Worker creates POA&Ms
   │
   ├─→ Generates OSCAL documents
   ├─→ Applies FedRAMP timelines
   └─→ Updates compliance dashboard
```

### Multi-Tenant Isolation

Aegis enforces strict tenant isolation at multiple layers:

**Database Layer**:

```sql
-- Row-Level Security policy
CREATE POLICY tenant_isolation ON evidence
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

**API Layer**:

- JWT tokens include `tenantId` claim
- Middleware validates tenant access
- All queries filtered by tenant

**Storage Layer**:

- Separate blob containers per tenant
- SAS tokens scoped to tenant containers
- No cross-tenant file access

## Security Architecture

### Authentication Flow

```
1. User logs in with credentials
   │
   ▼
2. API validates against Keycloak (future) or local auth
   │
   ▼
3. API generates JWT token with claims:
   - userId
   - tenantId
   - roles
   │
   ▼
4. Client includes token in Authorization header
   │
   ▼
5. API middleware validates token and sets context
```

### Encryption

- **Data in Transit**: TLS 1.2+ for all API communications
- **Data at Rest**: Azure Storage Service Encryption (SSE)
- **Database**: PostgreSQL SSL connections
- **Secrets**: Azure Key Vault (production) or environment variables (dev)

### Audit Logging

All security-relevant events are logged:

- Evidence uploads
- Vulnerability discoveries
- POA&M creations
- User authentication
- Policy changes

## Deployment Architecture

### Development

```
┌─────────────────────────────────────┐
│        Developer Workstation         │
│                                      │
│  ┌──────────┐  ┌─────────────────┐  │
│  │ Docker   │  │ Local Services  │  │
│  │ Compose  │  │ - PostgreSQL    │  │
│  │          │  │ - Redis         │  │
│  │          │  │ - Azurite       │  │
│  └──────────┘  └─────────────────┘  │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ npm run dev                     │ │
│  │ - API (Port 3001)               │ │
│  │ - Web (Port 5173)               │ │
│  │ - Workers                       │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Production (Azure Government Cloud)

```
┌─────────────────────────────────────────────┐
│         Azure Government Cloud              │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │   Azure App Service                    │ │
│  │   ├── API Container                    │ │
│  │   ├── Web Container                    │ │
│  │   └── Worker Container                 │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Azure Database  │  │ Azure Redis      │ │
│  │ for PostgreSQL  │  │ Cache            │ │
│  └─────────────────┘  └──────────────────┘ │
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Azure Blob      │  │ Azure Key Vault  │ │
│  │ Storage         │  │                  │ │
│  └─────────────────┘  └──────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Azure Application Insights              ││
│  │ (Monitoring & Logging)                  ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## Scalability

### Horizontal Scaling

- **API Server**: Multiple instances behind Azure Load Balancer
- **Queue Workers**: Scale worker count based on queue depth
- **Web Frontend**: Served via Azure CDN

### Performance Optimizations

- **Database Connection Pooling**: TypeORM connection pool (max 20 connections)
- **Redis Caching**: Cache frequent queries (CVE lookups, project lists)
- **Blob Storage CDN**: Serve static assets via Azure CDN
- **GraphQL DataLoader**: Batch and cache database queries

## Monitoring & Observability

- **Application Insights**: APM, distributed tracing
- **Log Analytics**: Centralized logging
- **Metrics**: Custom metrics for queue depth, processing time, error rates
- **Alerts**: Automated alerts for failures, high latency, queue backlogs

## Next Steps

- **[Evidence Ingestion](../core-concepts/evidence.md)** - Learn how evidence is processed
- **[SBOM Processing](../core-concepts/sbom.md)** - Understand SBOM parsing
- **[Deployment Guide](../deployment/azure.md)** - Deploy to Azure Government Cloud
