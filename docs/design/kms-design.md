# Key Management Service (KMS) Design

**Document Version**: 1.0
**Date**: 2024-12-11
**Status**: Approved

## Executive Summary

This document describes the cryptographic key management architecture for the Aegis DevSecOps Platform. The design supports multi-cloud government deployments (Azure Government, AWS GovCloud) with FIPS 140-2 validated encryption modules.

**Compliance Requirements**:

- NIST 800-53 Rev 5: SC-12 (Cryptographic Key Establishment), SC-13 (Cryptographic Protection)
- FIPS 140-2 Level 2 (minimum for FedRAMP Moderate)
- FIPS 140-3 Level 3 (preferred for IL4/IL5)
- FedRAMP Rev 5 Cryptographic Module Requirements

## Architecture Overview

### Key Hierarchy

```
Root Key (HSM-protected)
    ├─> Database Encryption Key (DEK)
    │   └─> PostgreSQL Transparent Data Encryption (TDE)
    │
    ├─> Blob Storage Encryption Key (BEK)
    │   └─> S3/Azure Blob Server-Side Encryption
    │
    ├─> Application Secrets Key (ASK)
    │   ├─> JWT Signing Key
    │   ├─> API Tokens
    │   └─> Service Account Credentials
    │
    ├─> Evidence Signing Key (ESK)
    │   └─> SBOM/POA&M Document Signatures
    │
    └─> Backup Encryption Key (BEK)
        └─> Database Backup Encryption
```

### Encryption Standards

| Data Type        | Algorithm | Key Size     | Mode  | Purpose                        |
| ---------------- | --------- | ------------ | ----- | ------------------------------ |
| Data at rest     | AES-256   | 256-bit      | GCM   | Database, S3 objects           |
| Data in transit  | TLS 1.3   | 256-bit      | ECDHE | HTTPS, PostgreSQL connections  |
| JWT tokens       | RS256     | 2048-bit RSA | -     | User authentication            |
| Document signing | ECDSA     | P-256        | -     | SBOM/POA&M integrity           |
| Password hashing | Argon2id  | -            | -     | User passwords (if local auth) |

## Cloud-Specific Implementations

### Azure Government (Azure Key Vault)

**Architecture**:

```
Azure Key Vault (usgovvirginia)
    ├─> Managed HSM (FIPS 140-3 Level 3)
    ├─> Keys
    │   ├─> aegis-prod-dek (Database Encryption Key)
    │   ├─> aegis-prod-bek (Blob Storage Encryption Key)
    │   └─> aegis-prod-ask (Application Secrets Key)
    │
    ├─> Secrets
    │   ├─> jwt-signing-key
    │   ├─> postgres-password
    │   └─> redis-password
    │
    └─> Certificates
        └─> aegis-tls-cert (IL4+ DoD PKI)
```

**Terraform Configuration**:

```hcl
# Azure Key Vault (Government Cloud)
resource "azurerm_key_vault" "aegis" {
  name                = "aegis-kv-prod-usgovva"
  location            = "usgovvirginia"
  resource_group_name = azurerm_resource_group.aegis.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "premium" # Required for HSM-backed keys

  # NIST 800-53 AC-3: RBAC for key access
  enable_rbac_authorization = true

  # NIST 800-53 AU-2: Enable logging
  enabled_for_deployment          = false
  enabled_for_disk_encryption     = true
  enabled_for_template_deployment = false

  # FIPS 140-2 requirement
  purge_protection_enabled   = true
  soft_delete_retention_days = 90

  network_acls {
    bypass         = "AzureServices"
    default_action = "Deny"

    # Only allow access from AKS nodes
    ip_rules = var.aks_node_public_ips

    # VNet integration
    virtual_network_subnet_ids = [
      azurerm_subnet.aks.id
    ]
  }

  tags = {
    Compliance = "NIST-800-53"
    FIPS       = "140-2"
    Environment = "prod-gov"
  }
}

# Managed HSM (FIPS 140-3 Level 3)
resource "azurerm_key_vault_managed_hardware_security_module" "aegis" {
  name                = "aegis-hsm-prod"
  resource_group_name = azurerm_resource_group.aegis.name
  location            = "usgovvirginia"
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "Standard_B1"

  admin_object_ids = var.hsm_admin_object_ids

  purge_protection_enabled   = true
  soft_delete_retention_days = 90

  tags = {
    Compliance = "FIPS-140-3-Level-3"
    Purpose    = "Aegis-Root-Keys"
  }
}

# Database Encryption Key (DEK)
resource "azurerm_key_vault_key" "database_encryption" {
  name         = "aegis-prod-dek"
  key_vault_id = azurerm_key_vault.aegis.id
  key_type     = "RSA-HSM" # HSM-backed
  key_size     = 2048

  key_opts = [
    "encrypt",
    "decrypt",
  ]

  rotation_policy {
    automatic {
      time_before_expiry = "P30D"
    }

    expire_after         = "P90D"
    notify_before_expiry = "P29D"
  }
}

# Blob Storage Encryption Key (BEK)
resource "azurerm_key_vault_key" "blob_encryption" {
  name         = "aegis-prod-bek"
  key_vault_id = azurerm_key_vault.aegis.id
  key_type     = "RSA-HSM"
  key_size     = 2048

  key_opts = [
    "encrypt",
    "decrypt",
    "wrapKey",
    "unwrapKey",
  ]

  rotation_policy {
    automatic {
      time_before_expiry = "P30D"
    }

    expire_after         = "P90D"
    notify_before_expiry = "P29D"
  }
}

# Application Secrets Key (ASK)
resource "azurerm_key_vault_secret" "jwt_signing_key" {
  name         = "jwt-signing-key"
  value        = random_password.jwt_key.result
  key_vault_id = azurerm_key_vault.aegis.id

  expiration_date = timeadd(timestamp(), "2160h") # 90 days

  tags = {
    Purpose = "JWT-Token-Signing"
  }
}

# PostgreSQL Password
resource "azurerm_key_vault_secret" "postgres_password" {
  name         = "postgres-password"
  value        = random_password.postgres.result
  key_vault_id = azurerm_key_vault.aegis.id

  tags = {
    Purpose = "PostgreSQL-Admin-Password"
  }
}
```

**AKS Integration** (CSI Driver):

```yaml
apiVersion: v1
kind: SecretProviderClass
metadata:
  name: aegis-secrets
  namespace: aegis-system
spec:
  provider: azure
  secretObjects:
    - secretName: aegis-app-secrets
      type: Opaque
      data:
        - objectName: jwt-signing-key
          key: JWT_SECRET
        - objectName: postgres-password
          key: DB_PASSWORD
  parameters:
    usePodIdentity: 'false'
    useVMManagedIdentity: 'true'
    userAssignedIdentityID: '550e8400-e29b-41d4-a716-446655440000'
    keyvaultName: 'aegis-kv-prod-usgovva'
    tenantId: '12345678-1234-1234-1234-123456789012'
    objects: |
      array:
        - |
          objectName: jwt-signing-key
          objectType: secret
        - |
          objectName: postgres-password
          objectType: secret
```

### AWS GovCloud (AWS KMS)

**Architecture**:

```
AWS KMS (us-gov-west-1)
    ├─> Customer Managed Keys (CMKs)
    │   ├─> alias/aegis-prod-dek (Database Encryption)
    │   ├─> alias/aegis-prod-bek (S3 Encryption)
    │   └─> alias/aegis-prod-ask (Secrets Manager)
    │
    └─> AWS Secrets Manager
        ├─> aegis/prod/jwt-signing-key
        ├─> aegis/prod/postgres-password
        └─> aegis/prod/redis-password
```

**Terraform Configuration**:

```hcl
# AWS KMS Key (GovCloud)
resource "aws_kms_key" "aegis_dek" {
  description             = "Aegis Database Encryption Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  # FIPS 140-2 validated CloudHSM
  custom_key_store_id = aws_cloudhsm_v2_cluster.aegis.cluster_id

  tags = {
    Name        = "aegis-prod-dek"
    Compliance  = "NIST-800-53"
    FIPS        = "140-2"
    Environment = "prod-gov"
  }
}

resource "aws_kms_alias" "aegis_dek" {
  name          = "alias/aegis-prod-dek"
  target_key_id = aws_kms_key.aegis_dek.key_id
}

# S3 Encryption Key
resource "aws_kms_key" "aegis_bek" {
  description             = "Aegis S3 Blob Encryption Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws-us-gov:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow S3 to use the key"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name       = "aegis-prod-bek"
    Compliance = "NIST-800-53"
  }
}

# CloudHSM Cluster (FIPS 140-2 Level 3)
resource "aws_cloudhsm_v2_cluster" "aegis" {
  hsm_type   = "hsm1.medium"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name       = "aegis-hsm-cluster"
    Compliance = "FIPS-140-2-Level-3"
  }
}

resource "aws_cloudhsm_v2_hsm" "aegis" {
  count       = 2 # High availability
  subnet_id   = aws_subnet.private[count.index].id
  cluster_id  = aws_cloudhsm_v2_cluster.aegis.cluster_id
  availability_zone = data.aws_availability_zones.available.names[count.index]
}

# Secrets Manager
resource "aws_secretsmanager_secret" "jwt_key" {
  name                    = "aegis/prod/jwt-signing-key"
  kms_key_id              = aws_kms_key.aegis_dek.arn
  recovery_window_in_days = 30

  rotation_rules {
    automatically_after_days = 90
  }

  tags = {
    Purpose = "JWT-Token-Signing"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_key" {
  secret_id     = aws_secretsmanager_secret.jwt_key.id
  secret_string = jsonencode({
    key = random_password.jwt_key.result
  })
}

resource "aws_secretsmanager_secret" "postgres_password" {
  name                    = "aegis/prod/postgres-password"
  kms_key_id              = aws_kms_key.aegis_dek.arn
  recovery_window_in_days = 30

  tags = {
    Purpose = "PostgreSQL-Admin-Password"
  }
}

resource "aws_secretsmanager_secret_version" "postgres_password" {
  secret_id     = aws_secretsmanager_secret.postgres_password.id
  secret_string = jsonencode({
    password = random_password.postgres.result
  })
}
```

**EKS Integration** (Secrets Store CSI Driver):

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: aegis-secrets-aws
  namespace: aegis-system
spec:
  provider: aws
  secretObjects:
    - secretName: aegis-app-secrets
      type: Opaque
      data:
        - objectName: jwt-signing-key
          key: JWT_SECRET
        - objectName: postgres-password
          key: DB_PASSWORD
  parameters:
    objects: |
      - objectName: "aegis/prod/jwt-signing-key"
        objectType: "secretsmanager"
        jmesPath:
          - path: key
            objectAlias: jwt-signing-key
      - objectName: "aegis/prod/postgres-password"
        objectType: "secretsmanager"
        jmesPath:
          - path: password
            objectAlias: postgres-password
```

## Key Rotation Strategy

### Automatic Rotation

| Key Type                | Rotation Frequency | Method                            | Downtime               |
| ----------------------- | ------------------ | --------------------------------- | ---------------------- |
| Database Encryption Key | 90 days            | Azure KV / AWS KMS auto-rotation  | Zero (transparent)     |
| Blob Storage Key        | 90 days            | Azure KV / AWS KMS auto-rotation  | Zero                   |
| JWT Signing Key         | 90 days            | Manual rotation with grace period | Zero (dual-key period) |
| TLS Certificates        | 365 days           | cert-manager automation           | Zero (rolling update)  |
| Application Secrets     | On-demand          | Manual via Terraform              | Requires restart       |

### JWT Key Rotation Process

```typescript
// Dual-key JWT verification during rotation
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const currentKey = await getSecretFromKMS('jwt-signing-key');
  const previousKey = await getSecretFromKMS('jwt-signing-key-previous');

  try {
    // Try current key first
    return jwt.verify(token, currentKey);
  } catch (error) {
    // Fallback to previous key (grace period)
    try {
      return jwt.verify(token, previousKey);
    } catch (fallbackError) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// Rotation procedure (manual trigger)
export async function rotateJWTKey(): Promise<void> {
  const currentKey = await getSecretFromKMS('jwt-signing-key');

  // 1. Save current key as previous
  await setSecretInKMS('jwt-signing-key-previous', currentKey);

  // 2. Generate new key
  const newKey = crypto.randomBytes(64).toString('hex');

  // 3. Update current key
  await setSecretInKMS('jwt-signing-key', newKey);

  // 4. Notify all API instances to reload (via Redis pub/sub)
  await redis.publish('aegis:key-rotation', { key: 'jwt-signing-key' });

  // 5. Grace period: 24 hours
  // 6. After 24 hours, delete previous key
}
```

## Encryption at Rest

### PostgreSQL Transparent Data Encryption (TDE)

**Azure PostgreSQL**:

```hcl
resource "azurerm_postgresql_flexible_server" "aegis" {
  name                = "aegis-postgres-prod"
  location            = "usgovvirginia"
  resource_group_name = azurerm_resource_group.aegis.name

  sku_name   = "GP_Standard_D4s_v3"
  version    = "15"
  storage_mb = 65536

  # Customer-managed key encryption
  customer_managed_key {
    key_vault_key_id                  = azurerm_key_vault_key.database_encryption.id
    primary_user_assigned_identity_id = azurerm_user_assigned_identity.aegis.id
  }

  # FIPS 140-2 SSL enforcement
  ssl_enforcement_enabled          = true
  ssl_minimal_tls_version_enforced = "TLS1_2"

  backup_retention_days        = 35
  geo_redundant_backup_enabled = true

  tags = {
    Encryption = "Customer-Managed-Key"
    FIPS       = "140-2"
  }
}
```

**AWS RDS PostgreSQL**:

```hcl
resource "aws_db_instance" "aegis" {
  identifier     = "aegis-postgres-prod"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.xlarge"

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp3"

  # KMS encryption
  storage_encrypted = true
  kms_key_id        = aws_kms_key.aegis_dek.arn

  # SSL/TLS enforcement
  ca_cert_identifier = "rds-ca-rsa2048-g1"

  # Backups
  backup_retention_period = 35
  backup_window           = "03:00-04:00"

  # Multi-AZ for HA
  multi_az = true

  tags = {
    Encryption = "AWS-KMS"
    FIPS       = "140-2"
  }
}
```

## Access Control & Audit

### RBAC for Key Access

**Azure RBAC Roles**:

```hcl
# Grant AKS cluster access to Key Vault
resource "azurerm_role_assignment" "aks_kv_secrets_user" {
  scope                = azurerm_key_vault.aegis.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_kubernetes_cluster.aegis.kubelet_identity[0].object_id
}

resource "azurerm_role_assignment" "aks_kv_crypto_user" {
  scope                = azurerm_key_vault.aegis.id
  role_definition_name = "Key Vault Crypto User"
  principal_id         = azurerm_kubernetes_cluster.aegis.kubelet_identity[0].object_id
}
```

**AWS IAM Policy**:

```hcl
resource "aws_iam_policy" "eks_kms_policy" {
  name = "aegis-eks-kms-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = [
          aws_kms_key.aegis_dek.arn,
          aws_kms_key.aegis_bek.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.jwt_key.arn,
          aws_secretsmanager_secret.postgres_password.arn
        ]
      }
    ]
  })
}
```

### Audit Logging (NIST 800-53 AU-2)

**Azure Monitor**:

- All Key Vault access logged to Log Analytics
- Alerts on key access from unknown IPs
- 90-day retention minimum (365 days for prod)

**AWS CloudTrail**:

- All KMS API calls logged to CloudWatch
- Alerts on key deletion attempts
- 90-day retention in S3-Gov

## Disaster Recovery

### Key Backup Strategy

1. **Azure Key Vault**: Geo-redundant by default (usgovvirginia → usgovtexas)
2. **AWS KMS**: Multi-region key replication (us-gov-west-1 → us-gov-east-1)
3. **Manual backup**: Export wrapped keys to S3-Gov (encrypted with separate key)

### Recovery Time Objective (RTO)

- **Key Vault outage**: RTO < 1 hour (automatic failover to secondary region)
- **KMS outage**: RTO < 30 minutes (AWS multi-region keys)
- **Total platform failure**: RTO < 4 hours (restore from encrypted backups)

## Compliance Validation

### FIPS 140-2 Verification

```bash
# Azure Key Vault HSM validation
az keyvault key show \
  --vault-name aegis-kv-prod-usgovva \
  --name aegis-prod-dek \
  --query "key.kty"
# Output: "RSA-HSM"

# AWS KMS FIPS validation
aws kms describe-key \
  --key-id alias/aegis-prod-dek \
  --region us-gov-west-1 \
  --query "KeyMetadata.CustomKeyStoreId"
# Output: CloudHSM cluster ID (FIPS 140-2 Level 3)
```

### Annual Key Audit

1. Review key access logs (who accessed keys, when, from where)
2. Verify key rotation compliance (all keys rotated within 90 days)
3. Test key recovery procedure (simulate disaster)
4. Update key inventory spreadsheet (FedRAMP requirement)

## References

- [NIST 800-53 Rev 5: SC-12 (Cryptographic Key Establishment)](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=SC-12)
- [NIST 800-57: Recommendation for Key Management](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
- [FIPS 140-2 Standard](https://csrc.nist.gov/publications/detail/fips/140/2/final)
- [Azure Key Vault FIPS 140-2 Compliance](https://learn.microsoft.com/en-us/azure/key-vault/general/fips-compliance)
- [AWS KMS FIPS 140-2 Compliance](https://aws.amazon.com/compliance/fips/)
