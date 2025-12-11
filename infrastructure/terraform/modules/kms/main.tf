# KMS Module - Multi-cloud Key Management
# Supports both Azure Key Vault (Government) and AWS KMS (GovCloud)

terraform {
  required_version = ">= 1.5.0"
}

# This module is designed to be instantiated separately for each cloud provider
# Use cloud-specific variables to determine which resources to create

# Placeholder - actual implementation will depend on cloud provider selection
# See design/kms-design.md for architecture details
