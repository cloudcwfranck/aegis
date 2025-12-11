# Azure Kubernetes Service (Government Cloud) Module
# Provisions AKS cluster with NIST 800-53 compliance configurations

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.dns_prefix
  kubernetes_version  = var.kubernetes_version

  # NIST 800-53 AC-2: Private cluster endpoint
  private_cluster_enabled = var.private_cluster_enabled

  # Default node pool
  default_node_pool {
    name                = "system"
    node_count          = var.system_node_count
    vm_size             = var.system_node_size
    enable_auto_scaling = true
    min_count           = var.system_node_min_count
    max_count           = var.system_node_max_count
    vnet_subnet_id      = var.subnet_id

    # NIST 800-53 CM-2: OS hardening
    os_disk_size_gb = 128
    os_disk_type    = "Managed"
    os_sku          = "AzureLinux" # Formerly CBL-Mariner

    # NIST 800-53 CM-6: Kubernetes labels for pod placement
    node_labels = {
      "workload" = "system"
      "tier"     = "control-plane"
    }
  }

  # Service principal or managed identity
  identity {
    type = "SystemAssigned"
  }

  # Network profile
  network_profile {
    network_plugin     = "azure"
    network_policy     = "calico"
    load_balancer_sku  = "standard"
    outbound_type      = "userDefinedRouting"
    service_cidr       = var.service_cidr
    dns_service_ip     = var.dns_service_ip
    docker_bridge_cidr = var.docker_bridge_cidr
  }

  # NIST 800-53 AU-2: Azure Monitor integration
  oms_agent {
    log_analytics_workspace_id = var.log_analytics_workspace_id
  }

  # NIST 800-53 IA-2: Azure AD integration
  azure_active_directory_role_based_access_control {
    managed                = true
    azure_rbac_enabled     = true
    admin_group_object_ids = var.admin_group_object_ids
  }

  # NIST 800-53 SC-8: TLS encryption
  api_server_access_profile {
    authorized_ip_ranges = var.authorized_ip_ranges
  }

  # Key Vault secrets provider (for M6 secret management)
  key_vault_secrets_provider {
    secret_rotation_enabled  = true
    secret_rotation_interval = "2m"
  }

  # NIST 800-53 CM-7: Disable unnecessary features
  local_account_disabled = var.local_account_disabled

  tags = merge(
    var.tags,
    {
      "Compliance" = "NIST-800-53-R5"
      "Environment" = var.environment
      "ManagedBy"   = "Terraform"
    }
  )
}

# Application node pool (separate from system)
resource "azurerm_kubernetes_cluster_node_pool" "app" {
  name                  = "app"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks.id
  vm_size               = var.app_node_size
  enable_auto_scaling   = true
  min_count             = var.app_node_min_count
  max_count             = var.app_node_max_count
  vnet_subnet_id        = var.subnet_id
  os_disk_size_gb       = 256
  os_disk_type          = "Managed"
  os_sku                = "AzureLinux"

  node_labels = {
    "workload" = "application"
    "tier"     = "app"
  }

  node_taints = [
    "workload=application:NoSchedule"
  ]

  tags = merge(
    var.tags,
    {
      "NodePool" = "application"
    }
  )
}
