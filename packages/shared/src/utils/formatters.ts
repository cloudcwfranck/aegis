import { VulnerabilitySeverity } from '../types';

/**
 * Formatting utilities
 */

export function formatSeverity(severity: VulnerabilitySeverity): string {
  const severityMap: Record<VulnerabilitySeverity, string> = {
    [VulnerabilitySeverity.CRITICAL]: '🔴 Critical',
    [VulnerabilitySeverity.HIGH]: '🟠 High',
    [VulnerabilitySeverity.MEDIUM]: '🟡 Medium',
    [VulnerabilitySeverity.LOW]: '🔵 Low',
    [VulnerabilitySeverity.NEGLIGIBLE]: '⚪ Negligible',
    [VulnerabilitySeverity.UNKNOWN]: '❓ Unknown',
  };
  return severityMap[severity];
}

export function formatImageDigest(digest: string): string {
  if (digest.startsWith('sha256:')) {
    return digest.substring(7, 19);
  }
  return digest.substring(0, 12);
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex] ?? 'B'}`;
}

export function formatDaysUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return 'Due today';
  } else if (days === 1) {
    return '1 day remaining';
  } else {
    return `${days} days remaining`;
  }
}
