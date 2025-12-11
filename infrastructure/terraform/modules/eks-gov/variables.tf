variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "vpc_id" {
  description = "VPC ID for EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for EKS cluster and nodes"
  type        = list(string)
}

variable "endpoint_public_access" {
  description = "Enable public API endpoint access"
  type        = bool
  default     = false
}

variable "public_access_cidrs" {
  description = "CIDR blocks allowed for public endpoint access"
  type        = list(string)
  default     = []
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 90
}

variable "desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 3
}

variable "min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 3
}

variable "max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 10
}

variable "instance_types" {
  description = "EC2 instance types for nodes"
  type        = list(string)
  default     = ["m5.xlarge"]
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
