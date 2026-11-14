export function formatPersianCount(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '۰';
  return new Intl.NumberFormat('fa-IR').format(Math.max(0, Math.round(value)));
}

/**
 * Converts raw minute durations (e.g. 1346) into natural readable Persian strings
 * such as "۲۲ ساعت و ۲۶ دقیقه" or "۴۵ دقیقه".
 */
export function formatReadingDuration(totalMinutes?: number | null): string {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes) || totalMinutes <= 0) {
    return '';
  }

  const mins = Math.round(totalMinutes);
  if (mins < 60) {
    return `${formatPersianCount(mins)} دقیقه`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMinutes = mins % 60;

  if (remainingMinutes === 0) {
    return `${formatPersianCount(hours)} ساعت`;
  }

  return `${formatPersianCount(hours)} ساعت و ${formatPersianCount(remainingMinutes)} دقیقه`;
}

/**
 * Resolves a stored CMS media key or path into an image URL renderable in the browser.
 */
export function resolvePublicMediaUrl(storageKey?: string | null): string | null {
  if (!storageKey || typeof storageKey !== 'string') return null;
  const trimmed = storageKey.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/api/v1/public/media/${trimmed}`;
}
