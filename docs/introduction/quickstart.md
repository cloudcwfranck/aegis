# Quickstart

Get Aegis running locally in under 5 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **Docker** and Docker Compose
- **Git**
- **npm** or **pnpm**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cloudcwfranck/aegis.git
cd aegis
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo, including:

- API server
- Web frontend
- Database migrations
- Queue workers

### 3. Set Up Environment Variables

Create environment files for each package:

```bash
# API environment
cat > packages/api/.env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://aegis:aegis@localhost:5432/aegis
REDIS_URL=redis://localhost:6379
AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true
JWT_SECRET=your-secret-key-change-in-production
EOF

# Web environment
cat > packages/web/.env << EOF
VITE_API_URL=http://localhost:3001
VITE_GRAPHQL_URL=http://localhost:3001/graphql
EOF
```

### 4. Start Infrastructure Services

Use Docker Compose to start PostgreSQL, Redis, and Azurite (Azure Storage emulator):

```bash
docker-compose up -d
```

This starts:

- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Azurite** on ports 10000-10002

### 5. Run Database Migrations

```bash
npm run migrate
```

This creates all required tables and sets up Row-Level Security policies.

### 6. Start the Development Servers

```bash
# Start all services (API, Web, Workers)
npm run dev
```

Or start services individually:

```bash
# API server only
npm run dev --workspace=@aegis/api

# Web frontend only
npm run dev --workspace=@aegis/web

# Queue workers only
npm run dev --workspace=@aegis/workers
```

## Verify Installation

Once all services are running, you should see:

- **Web UI**: http://localhost:5173
- **API Server**: http://localhost:3001
- **GraphQL Playground**: http://localhost:3001/graphql

## Upload Your First Evidence

### Using the Web Interface

1. Navigate to http://localhost:5173
2. Click **"Upload Evidence"**
3. Select an SBOM file (SPDX or CycloneDX format)
4. Click **"Upload"**

The platform will:

- Parse the SBOM
- Index all components
- Scan for vulnerabilities
- Generate POA&Ms for Critical and High findings
- Display results on the dashboard

### Using the API

```bash
curl -X POST http://localhost:3001/api/evidence \
  -F "file=@sbom.spdx.json" \
  -F "projectId=1" \
  -F "buildId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using GraphQL

```graphql
mutation UploadEvidence($input: EvidenceInput!) {
  createEvidence(input: $input) {
    id
    fileName
    status
    vulnerabilities {
      id
      cveId
      severity
      cvssScore
    }
  }
}
```

## Next Steps

Now that you have Aegis running:

- **[Architecture Overview](architecture.md)** - Understand how Aegis works
- **[Core Concepts](../core-concepts/evidence.md)** - Learn about evidence, SBOMs, and vulnerabilities
- **[Deployment Guide](../deployment/azure.md)** - Deploy to Azure Government Cloud
- **[API Reference](../api-reference/graphql.md)** - Explore the GraphQL and REST APIs

## Troubleshooting

### Database Connection Errors

Ensure PostgreSQL is running:

```bash
docker-compose ps
```

If PostgreSQL is not running:

```bash
docker-compose up -d postgres
```

### Migration Errors

Reset the database:

```bash
docker-compose down -v
docker-compose up -d
npm run migrate
```

### Port Conflicts

If ports 3001, 5173, 5432, or 6379 are in use, modify the `docker-compose.yml` and `.env` files to use different ports.

## Development Tips

### Hot Reload

All services support hot reload during development:

- **API**: Changes to `packages/api/src/**` trigger restart
- **Web**: Changes to `packages/web/src/**` trigger HMR (Hot Module Replacement)
- **Database**: Use `npm run migrate` after schema changes

### Database Inspection

Connect to PostgreSQL:

```bash
docker exec -it aegis-postgres psql -U aegis -d aegis
```

View tables:

```sql
\dt
```

### Queue Monitoring

View Redis queue status:

```bash
docker exec -it aegis-redis redis-cli
KEYS bull:*
```

### Logs

View service logs:

```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# PostgreSQL only
docker-compose logs -f postgres
```
