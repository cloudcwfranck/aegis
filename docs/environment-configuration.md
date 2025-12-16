# Environment Configuration Guide

This guide covers environment configuration for the Aegis DevSecOps Platform across different deployment scenarios.

## Table of Contents

- [Development (Local)](#development-local)
- [Azure Government Cloud](#azure-government-cloud)
- [Production Deployment](#production-deployment)
- [Vercel Frontend Deployment](#vercel-frontend-deployment)

---

## Development (Local)

For local development, Aegis uses MinIO for S3-compatible storage and PostgreSQL with Redis for queue management.

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or pnpm

### 1. Start Infrastructure Services

```bash
docker-compose up -d postgres redis minio
```

This starts:

- PostgreSQL 15 on port 5432
- Redis 7 on port 6379
- MinIO on ports 9000 (API) and 9001 (Console)

### 2. API Environment Variables

Create `packages/api/.env`:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=aegis_dev
DATABASE_USER=aegis
DATABASE_PASSWORD=aegis_dev_password
DATABASE_SSL=false

# Storage Configuration (MinIO for local dev)
STORAGE_PROVIDER=s3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET=aegis-evidence
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# Redis Configuration (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# API Configuration
PORT=4000
NODE_ENV=development
LOG_LEVEL=debug

# Multi-tenancy (for testing)
DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000000
```

### 3. Web Frontend Environment Variables

Create `packages/web/.env`:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Database Migrations

```bash
# Run migrations
npm run db:migrate

# Seed development data (optional)
npm run db:seed
```

### 5. Start Development Servers

```bash
# Start API server (includes BullMQ workers)
npm run dev --workspace=@aegis/api

# In another terminal, start web frontend
npm run dev --workspace=@aegis/web
```

### Access Points

- **Web UI**: http://localhost:5173
- **API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

---

## Azure Government Cloud

Aegis supports deployment to Azure Government Cloud for FedRAMP compliance.

### Prerequisites

- Azure Government subscription
- Azure CLI configured for Azure Gov Cloud
- Kubernetes cluster (AKS Gov) or Azure Container Apps

### 1. Azure Resources Setup

#### Create Resource Group

```bash
az cloud set --name AzureUSGovernment
az login
az account set --subscription "<your-subscription-id>"

az group create \
  --name aegis-prod-rg \
  --location usgovvirginia
```

#### Create Azure Database for PostgreSQL

```bash
az postgres flexible-server create \
  --resource-group aegis-prod-rg \
  --name aegis-db-prod \
  --location usgovvirginia \
  --admin-user aegis_admin \
  --admin-password '<strong-password>' \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose \
  --version 15 \
  --storage-size 128 \
  --public-access None

az postgres flexible-server db create \
  --resource-group aegis-prod-rg \
  --server-name aegis-db-prod \
  --database-name aegis_production
```

#### Create Azure Cache for Redis

```bash
az redis create \
  --resource-group aegis-prod-rg \
  --name aegis-redis-prod \
  --location usgovvirginia \
  --sku Standard \
  --vm-size c1 \
  --enable-non-ssl-port false
```

#### Create Azure Blob Storage Account

```bash
az storage account create \
  --name aegisblobprod \
  --resource-group aegis-prod-rg \
  --location usgovvirginia \
  --sku Standard_GRS \
  --kind StorageV2 \
  --access-tier Hot \
  --https-only true \
  --min-tls-version TLS1_2

az storage container create \
  --account-name aegisblobprod \
  --name evidence \
  --auth-mode login
```

### 2. API Environment Variables (Azure Gov)

Create Kubernetes Secret or Azure Key Vault entries:

```yaml
# k8s-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: aegis-api-secrets
  namespace: aegis
type: Opaque
stringData:
  # Database Configuration
  DATABASE_HOST: 'aegis-db-prod.postgres.database.usgovcloudapi.net'
  DATABASE_PORT: '5432'
  DATABASE_NAME: 'aegis_production'
  DATABASE_USER: 'aegis_admin'
  DATABASE_PASSWORD: '<postgres-password>'
  DATABASE_SSL: 'true'

  # Storage Configuration (Azure Blob)
  STORAGE_PROVIDER: 'azure'
  AZURE_STORAGE_ACCOUNT_NAME: 'aegisblobprod'
  AZURE_STORAGE_ACCOUNT_KEY: '<storage-account-key>'
  AZURE_STORAGE_CONTAINER: 'evidence'
  AZURE_STORAGE_ENDPOINT: 'https://aegisblobprod.blob.core.usgovcloudapi.net'

  # Redis Configuration
  REDIS_HOST: 'aegis-redis-prod.redis.cache.usgovcloudapi.net'
  REDIS_PORT: '6380'
  REDIS_PASSWORD: '<redis-access-key>'
  REDIS_TLS: 'true'

  # API Configuration
  PORT: '4000'
  NODE_ENV: 'production'
  LOG_LEVEL: 'info'
```

Apply the secret:

```bash
kubectl apply -f k8s-secrets.yaml
```

### 3. Alternative: Azure Key Vault Integration

```bash
# Create Key Vault
az keyvault create \
  --name aegis-kv-prod \
  --resource-group aegis-prod-rg \
  --location usgovvirginia

# Add secrets
az keyvault secret set --vault-name aegis-kv-prod --name DATABASE-PASSWORD --value '<password>'
az keyvault secret set --vault-name aegis-kv-prod --name AZURE-STORAGE-KEY --value '<storage-key>'
az keyvault secret set --vault-name aegis-kv-prod --name REDIS-PASSWORD --value '<redis-key>'
```

Then use Azure Key Vault CSI driver in Kubernetes or Azure App Service configuration.

### 4. Managed Identity (Recommended)

For production, use Azure Managed Identity instead of storage account keys:

```bash
# Enable system-assigned managed identity on AKS or Container App
az aks update \
  --resource-group aegis-prod-rg \
  --name aegis-aks-cluster \
  --enable-managed-identity

# Grant identity access to storage
az role assignment create \
  --assignee <managed-identity-principal-id> \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/<sub-id>/resourceGroups/aegis-prod-rg/providers/Microsoft.Storage/storageAccounts/aegisblobprod
```

Update API environment to use managed identity:

```env
STORAGE_PROVIDER=azure
AZURE_STORAGE_ACCOUNT_NAME=aegisblobprod
AZURE_STORAGE_CONTAINER=evidence
AZURE_STORAGE_ENDPOINT=https://aegisblobprod.blob.core.usgovcloudapi.net
AZURE_USE_MANAGED_IDENTITY=true
# No need for AZURE_STORAGE_ACCOUNT_KEY when using managed identity
```

---

## Production Deployment

### API Deployment (Kubernetes)

Example deployment manifest:

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegis-api
  namespace: aegis
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aegis-api
  template:
    metadata:
      labels:
        app: aegis-api
    spec:
      containers:
        - name: api
          image: aegis-api:latest
          ports:
            - containerPort: 4000
          envFrom:
            - secretRef:
                name: aegis-api-secrets
          resources:
            requests:
              memory: '512Mi'
              cpu: '500m'
            limits:
              memory: '1Gi'
              cpu: '1000m'
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: aegis-api-service
  namespace: aegis
spec:
  selector:
    app: aegis-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 4000
  type: ClusterIP
```

### BullMQ Workers (Separate Deployment)

For high-scale deployments, run workers separately:

```yaml
# workers-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegis-workers
  namespace: aegis
spec:
  replicas: 5
  selector:
    matchLabels:
      app: aegis-workers
  template:
    metadata:
      labels:
        app: aegis-workers
    spec:
      containers:
        - name: workers
          image: aegis-api:latest
          command: ['node', 'dist/queues/worker-manager.js']
          envFrom:
            - secretRef:
                name: aegis-api-secrets
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

---

## Vercel Frontend Deployment

### 1. Connect Repository to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Select `packages/web` as the root directory

### 2. Configure Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables

Add in Vercel Project Settings → Environment Variables:

#### Production

| Name           | Value                              | Environment |
| -------------- | ---------------------------------- | ----------- |
| `VITE_API_URL` | `https://api.aegis.yourdomain.gov` | Production  |

#### Preview/Development

| Name           | Value                                  | Environment |
| -------------- | -------------------------------------- | ----------- |
| `VITE_API_URL` | `https://api-dev.aegis.yourdomain.gov` | Preview     |
| `VITE_API_URL` | `http://localhost:4000`                | Development |

### 4. Custom Domain (Optional)

Configure custom domain in Vercel:

1. Go to Project Settings → Domains
2. Add your domain: `aegis.yourdomain.gov`
3. Configure DNS records as instructed by Vercel

### 5. Deploy

Vercel will automatically deploy on:

- **Main branch**: Production deployment
- **Feature branches**: Preview deployments
- **Pull requests**: Preview deployments

---

## Environment Variable Reference

### API Server

| Variable                     | Required | Default     | Description                                       |
| ---------------------------- | -------- | ----------- | ------------------------------------------------- |
| `DATABASE_HOST`              | Yes      | -           | PostgreSQL host                                   |
| `DATABASE_PORT`              | Yes      | 5432        | PostgreSQL port                                   |
| `DATABASE_NAME`              | Yes      | -           | Database name                                     |
| `DATABASE_USER`              | Yes      | -           | Database user                                     |
| `DATABASE_PASSWORD`          | Yes      | -           | Database password                                 |
| `DATABASE_SSL`               | No       | false       | Enable SSL for database                           |
| `STORAGE_PROVIDER`           | Yes      | s3          | Storage provider: `s3` or `azure`                 |
| `S3_ENDPOINT`                | If S3    | -           | S3 endpoint (MinIO: http://localhost:9000)        |
| `S3_ACCESS_KEY_ID`           | If S3    | -           | S3 access key                                     |
| `S3_SECRET_ACCESS_KEY`       | If S3    | -           | S3 secret key                                     |
| `S3_BUCKET`                  | If S3    | -           | S3 bucket name                                    |
| `S3_REGION`                  | If S3    | us-east-1   | S3 region                                         |
| `AZURE_STORAGE_ACCOUNT_NAME` | If Azure | -           | Azure storage account name                        |
| `AZURE_STORAGE_ACCOUNT_KEY`  | If Azure | -           | Azure storage account key                         |
| `AZURE_STORAGE_CONTAINER`    | If Azure | -           | Azure blob container name                         |
| `AZURE_STORAGE_ENDPOINT`     | If Azure | -           | Azure blob endpoint (Gov: core.usgovcloudapi.net) |
| `AZURE_USE_MANAGED_IDENTITY` | No       | false       | Use Azure Managed Identity                        |
| `REDIS_HOST`                 | Yes      | localhost   | Redis host                                        |
| `REDIS_PORT`                 | Yes      | 6379        | Redis port                                        |
| `REDIS_PASSWORD`             | No       | -           | Redis password                                    |
| `REDIS_TLS`                  | No       | false       | Enable TLS for Redis                              |
| `PORT`                       | No       | 4000        | API server port                                   |
| `NODE_ENV`                   | No       | development | Environment: development/production               |
| `LOG_LEVEL`                  | No       | info        | Log level: debug/info/warn/error                  |

### Web Frontend

| Variable       | Required | Default | Description  |
| -------------- | -------- | ------- | ------------ |
| `VITE_API_URL` | Yes      | -       | API base URL |

---

## Verification

### Health Check

```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### GraphQL Playground

Visit `http://localhost:4000/graphql` and run:

```graphql
query {
  listEvidence(page: 1, limit: 10) {
    items {
      id
      projectName
      buildId
      createdAt
    }
    total
  }
}
```

### Upload Test

```bash
curl -X POST http://localhost:4000/api/v1/scans/upload \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000000" \
  -d @test-data/upload-sample.json
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U aegis -d aegis_dev

# Check if database exists
\l

# Check if tables exist
\dt
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping
# Expected: PONG

# List BullMQ queues
redis-cli KEYS bull:*
```

### MinIO/Azure Storage Issues

```bash
# Test MinIO connection (local)
mc alias set local http://localhost:9000 minioadmin minioadmin
mc ls local/aegis-evidence

# Test Azure Blob Storage (production)
az storage blob list \
  --account-name aegisblobprod \
  --container-name evidence \
  --auth-mode login
```

### BullMQ Worker Issues

Check logs for worker startup:

```bash
# Check API logs for worker initialization
kubectl logs -f deployment/aegis-api -n aegis | grep "worker"

# Expected output:
# SBOM parser worker started
# Vulnerability indexer worker started
# POA&M generator worker started
```

---

## Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use Kubernetes Secrets or Azure Key Vault for production**
3. **Enable TLS for all external connections (Redis, PostgreSQL)**
4. **Use Managed Identity in Azure Gov Cloud instead of access keys**
5. **Rotate secrets regularly (90 days for FedRAMP compliance)**
6. **Enable audit logging for storage account access**
7. **Use network policies to restrict pod-to-pod communication**
8. **Enable Azure Private Link for database and Redis**

---

## Next Steps

- Configure monitoring with Azure Monitor or Prometheus
- Set up log aggregation with Azure Log Analytics
- Implement backup and disaster recovery
- Configure auto-scaling for API and workers
- Set up CI/CD pipelines with GitHub Actions
