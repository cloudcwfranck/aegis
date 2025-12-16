# Configuration

Configure Aegis for your environment.

## Environment Variables

### API Server

```bash
# Server
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:pass@host:5432/aegis
DATABASE_SSL=true
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_TLS=true

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER=evidence

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# Queue
QUEUE_CONCURRENCY=5
QUEUE_RETRY_ATTEMPTS=3
```

### Web Frontend

```bash
VITE_API_URL=https://api.aegis.gov
VITE_GRAPHQL_URL=https://api.aegis.gov/graphql
```

## Configuration Files

See the [Environment Variables Guide](environment.md) for detailed configuration options.
