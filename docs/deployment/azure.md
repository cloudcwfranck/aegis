# Azure Deployment

Deploy Aegis to Azure Government Cloud with FedRAMP Moderate authorization.

## Architecture

```
Azure Government Cloud
│
├── Azure App Service (Linux)
│   ├── API Container
│   ├── Web Container
│   └── Worker Container
│
├── Azure Database for PostgreSQL (Flexible Server)
│
├── Azure Redis Cache
│
├── Azure Blob Storage
│
├── Azure Key Vault
│
└── Azure Application Insights
```

## Prerequisites

- Azure Government Cloud subscription
- Azure CLI with Gov Cloud configuration
- Terraform 1.5+
- Docker

## Infrastructure Setup

### 1. Configure Azure CLI

```bash
# Login to Azure Government
az cloud set --name AzureUSGovernment
az login
```

### 2. Deploy Infrastructure with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review plan
terraform plan \
  -var="environment=production" \
  -var="location=usgovvirginia" \
  -var="subscription_id=$AZURE_SUBSCRIPTION_ID"

# Apply infrastructure
terraform apply
```

### 3. Configure Environment Variables

```bash
# Store secrets in Azure Key Vault
az keyvault secret set \
  --vault-name aegis-vault-prod \
  --name DATABASE-URL \
  --value "postgresql://..."

az keyvault secret set \
  --vault-name aegis-vault-prod \
  --name JWT-SECRET \
  --value "..."
```

### 4. Deploy Containers

```bash
# Build and push containers
az acr build \
  --registry aegisacr \
  --image aegis-api:latest \
  --file packages/api/Dockerfile .

# Deploy to App Service
az webapp config container set \
  --name aegis-api-prod \
  --resource-group aegis-rg-prod \
  --docker-custom-image-name aegisacr.azurecr.io/aegis-api:latest
```

## Monitoring

Configure Application Insights for monitoring:

```bash
az monitor app-insights component create \
  --app aegis-insights \
  --location usgovvirginia \
  --resource-group aegis-rg-prod
```

For complete deployment instructions, see the [Environment Configuration Guide](../deployment/configuration.md).
