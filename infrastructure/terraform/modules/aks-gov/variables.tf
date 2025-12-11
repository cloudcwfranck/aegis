variable "cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
}

variable "location" {
  description = "Azure Government region (e.g., usgovvirginia, usdodeast)"
  type        = string
  default     = "usgovvirginia"
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
}

variable "dns_prefix" {
  description = "DNS prefix for the cluster"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "private_cluster_enabled" {
  description = "Enable private cluster (NIST 800-53 AC-2)"
  type        = bool
  default     = true
}

variable "system_node_count" {
  description = "Initial number of system nodes"
  type        = number
  default     = 3
}

variable "system_node_min_count" {
  description = "Minimum system nodes (autoscaling)"
  type        = number
  default     = 3
}

variable "system_node_max_count" {
  description = "Maximum system nodes (autoscaling)"
  type        = number
  default     = 6
}

variable "system_node_size" {
  description = "VM size for system nodes"
  type        = string
  default     = "Standard_D4s_v3"
}

variable "app_node_min_count" {
  description = "Minimum application nodes"
  type        = number
  default     = 3
}

variable "app_node_max_count" {
  description = "Maximum application nodes"
  type        = number
  default     = 10
}

variable "app_node_size" {
  description = "VM size for application nodes"
  type        = string
  default     = "Standard_D8s_v3"
}

variable "subnet_id" {
  description = "Subnet ID for AKS nodes"
  type        = string
}

variable "service_cidr" {
  description = "Kubernetes service CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "dns_service_ip" {
  description = "Kubernetes DNS service IP"
  type        = string
  default     = "10.0.0.10"
}

variable "docker_bridge_cidr" {
  description = "Docker bridge CIDR"
  type        = string
  default     = "172.17.0.1/16"
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID for monitoring"
  type        = string
}

variable "admin_group_object_ids" {
  description = "Azure AD group object IDs for cluster admins"
  type        = list(string)
  default     = []
}

variable "authorized_ip_ranges" {
  description = "Authorized IP ranges for API server access"
  type        = list(string)
  default     = []
}

variable "local_account_disabled" {
  description = "Disable local accounts (require Azure AD)"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Environment (dev, staging, prod-gov)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
