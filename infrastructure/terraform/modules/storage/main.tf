# Storage Module - Evidence Blob Storage
# S3-Gov (AWS) or Azure Blob Storage (Azure Government)

terraform {
  required_version = ">= 1.5.0"
}

# This module provides encrypted storage for:
# - SBOM documents (SPDX JSON)
# - Vulnerability scan results (Grype JSON)
# - Cosign signature bundles
# - POA&M exports (OSCAL JSON, CSV, DOCX)
# - Audit logs

# Implementation will be cloud-specific
# See design documentation for encryption requirements (AES-256, FIPS 140-2)
