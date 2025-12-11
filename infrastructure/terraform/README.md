# Aegis Infrastructure - Terraform Modules

This directory contains Terraform Infrastructure as Code (IaC) for deploying Aegis on government cloud platforms (Azure Government and AWS GovCloud).

## Structure

- `modules/` - Reusable Terraform modules
  - `aks-gov/` - Azure Kubernetes Service (Government Cloud)
  - `eks-gov/` - AWS Elastic Kubernetes Service (GovCloud)
  - `kms/` - Key Management Service (Azure Key Vault Gov / AWS KMS)
  - `storage/` - S3-Gov / Azure Blob Storage for evidence blobs
  - `networking/` - VPC, subnets, security groups

- `environments/` - Environment-specific configurations
  - `dev/` - Development environment (IL2 sandbox)
  - `staging/` - Staging environment
  - `prod-gov/` - Production government cloud (IL4/IL5)

## Prerequisites

### Azure Government
1. Azure Government subscription approved
2. Azure CLI configured for Azure Government
3. Service Principal with appropriate permissions

### AWS GovCloud
1. AWS GovCloud account approved
2. AWS CLI configured for GovCloud region
3. IAM user/role with appropriate permissions

## Usage

```bash
# Initialize Terraform
cd environments/dev
terraform init

# Plan changes
terraform plan

# Apply infrastructure
terraform apply

# Destroy (when needed)
terraform destroy
```

## Compliance

All modules are configured to meet:
- NIST 800-53 Rev 5 controls
- FedRAMP Moderate baseline
- DISA STIGs (where applicable)
- Impact Levels: IL2, IL4, IL5

## Government Cloud Regions

**Azure Government:**
- Primary: `usgovvirginia`
- Secondary: `usgovtexas`
- DoD IL4/IL5: `usdodeast`, `usdodcentral`

**AWS GovCloud:**
- Primary: `us-gov-west-1`
- Secondary: `us-gov-east-1`
