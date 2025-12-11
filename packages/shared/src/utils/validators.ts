import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

export const ImageDigestSchema = z
  .string()
  .regex(/^sha256:[a-f0-9]{64}$/, 'Invalid image digest format');

export const CVEIdSchema = z
  .string()
  .regex(/^CVE-\d{4}-\d{4,}$/, 'Invalid CVE ID format');

export const EmailSchema = z.string().email('Invalid email format');

export const TenantSlugSchema = z
  .string()
  .regex(
    /^[a-z0-9-]+$/,
    'Tenant slug must contain only lowercase letters, numbers, and hyphens'
  )
  .min(3, 'Tenant slug must be at least 3 characters')
  .max(63, 'Tenant slug must be at most 63 characters');

export function validateImageDigest(digest: string): boolean {
  return ImageDigestSchema.safeParse(digest).success;
}

export function validateCVEId(cveId: string): boolean {
  return CVEIdSchema.safeParse(cveId).success;
}

export function validateEmail(email: string): boolean {
  return EmailSchema.safeParse(email).success;
}

export function validateTenantSlug(slug: string): boolean {
  return TenantSlugSchema.safeParse(slug).success;
}
