# Local Development

Set up Aegis for local development in under 5 minutes.

## Prerequisites

- Node.js 18.x or higher
- Docker and Docker Compose
- Git
- npm or pnpm

## Quick Start

```bash
# Clone repository
git clone https://github.com/cloudcwfranck/aegis.git
cd aegis

# Install dependencies
npm install

# Start infrastructure (PostgreSQL, Redis, Azurite)
docker-compose up -d

# Run database migrations
npm run migrate

# Start development servers
npm run dev
```

Access the application:

- **Web UI**: http://localhost:5173
- **API**: http://localhost:3001
- **GraphQL Playground**: http://localhost:3001/graphql

For detailed setup instructions, see the [Quickstart Guide](../introduction/quickstart.md).
