export type AppRole = 'operador' | 'supervisor' | '';

export function normalizeRole(role?: string | null): AppRole {
  if (!role) return '';
  const normalized = role.trim().toLowerCase();
  if (normalized === 'operador') return 'operador';
  if (normalized === 'supervisor') return 'supervisor';
  return '';
}

export function isSupervisorRole(role?: string | null): boolean {
  return normalizeRole(role) === 'supervisor';
}

export function isOperadorRole(role?: string | null): boolean {
  return normalizeRole(role) === 'operador';
}
