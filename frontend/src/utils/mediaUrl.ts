const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;

function getApiOrigin(): string {
  if (!configuredApiUrl || configuredApiUrl.trim().length === 0) {
    return window.location.origin;
  }

  try {
    const parsed = new URL(configuredApiUrl.trim());
    return parsed.origin;
  } catch {
    return window.location.origin;
  }
}

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path || path.trim().length === 0) return undefined;

  const normalized = path.trim();

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  const origin = getApiOrigin();

  if (normalized.startsWith('/')) {
    return `${origin}${normalized}`;
  }

  return `${origin}/${normalized}`;
}
