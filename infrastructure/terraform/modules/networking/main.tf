# Networking Module - VPC/VNet Configuration
# Creates network infrastructure with NIST 800-53 SC-7 compliance

terraform {
  required_version = ">= 1.5.0"
}

# This module creates:
# - VPC/VNet with proper segmentation
# - Public/private subnets
# - Network security groups
# - Route tables
# - NAT Gateway/Instance
# - VPN/ExpressRoute connections to DoD networks

# Implementation will be cloud-specific (Azure vs AWS)
