/**
 * User and RBAC types
 * Aligned with M3 requirements: Platform One Keycloak, 5 role types
 */

export enum UserRole {
  ORG_ADMIN = 'ORG_ADMIN',
  ISSO = 'ISSO',
  DEVSECOPS = 'DEVSECOPS',
  DEVELOPER = 'DEVELOPER',
  AUDITOR = 'AUDITOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  keycloakId?: string;
  metadata: Record<string, unknown>;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageProjects: boolean;
  canManagePolicies: boolean;
  canViewEvidence: boolean;
  canTriageCVEs: boolean;
  canExportPOAM: boolean;
  canManageDeployments: boolean;
  canViewAuditLogs: boolean;
}
