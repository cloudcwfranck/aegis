# Environment Variables

Complete reference for all environment variables.

## API Server Variables

| Variable                          | Required | Default | Description                                     |
| --------------------------------- | -------- | ------- | ----------------------------------------------- |
| `NODE_ENV`                        | Yes      | -       | Environment: `development`, `production`        |
| `PORT`                            | No       | 3001    | API server port                                 |
| `LOG_LEVEL`                       | No       | info    | Logging level: `debug`, `info`, `warn`, `error` |
| `DATABASE_URL`                    | Yes      | -       | PostgreSQL connection string                    |
| `DATABASE_SSL`                    | No       | false   | Enable SSL for database connection              |
| `REDIS_URL`                       | Yes      | -       | Redis connection string                         |
| `AZURE_STORAGE_CONNECTION_STRING` | Yes      | -       | Azure Blob Storage connection string            |
| `JWT_SECRET`                      | Yes      | -       | Secret key for JWT signing                      |
| `JWT_EXPIRATION`                  | No       | 24h     | JWT token expiration time                       |

## Web Frontend Variables

| Variable           | Required | Default | Description          |
| ------------------ | -------- | ------- | -------------------- |
| `VITE_API_URL`     | Yes      | -       | API server URL       |
| `VITE_GRAPHQL_URL` | Yes      | -       | GraphQL endpoint URL |

For deployment-specific configuration, see the [Configuration Guide](configuration.md).
