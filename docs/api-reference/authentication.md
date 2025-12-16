# Authentication

Aegis uses JWT (JSON Web Tokens) for API authentication.

## Obtaining a Token

### Login

```bash
POST /api/auth/login
```

**Request**:

```bash
curl -X POST https://api.aegis.gov/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

**Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "tenantId": "tenant-id",
    "role": "USER"
  }
}
```

## Using the Token

Include the token in the Authorization header:

```bash
curl -X GET https://api.aegis.gov/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Token Structure

JWT tokens include:

```json
{
  "sub": "user-id",
  "tenantId": "tenant-uuid",
  "role": "USER",
  "email": "user@example.com",
  "iat": 1702310000,
  "exp": 1702396400
}
```

## Token Expiration

Tokens expire after 24 hours by default. Refresh tokens before expiration:

```bash
POST /api/auth/refresh
```

**Request**:

```bash
curl -X POST https://api.aegis.gov/api/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:

```json
{
  "token": "new-jwt-token",
  "expiresIn": "24h"
}
```

## Roles

- **OWNER**: Full tenant access
- **ADMIN**: Manage projects and users
- **USER**: Upload evidence and view data
- **VIEWER**: Read-only access

For multi-tenant architecture, see the [Multi-Tenancy Guide](../core-concepts/multi-tenancy.md).
