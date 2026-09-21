/** Indian numbering compact currency: ₹1.25 Cr, ₹85 L, ₹42,000. */
export function formatMoney(value, { compact = true } = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);

  if (compact) {
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
    if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2).replace(/\.?0+$/, '')} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatFullMoney(value) {
  if (value === null || value === undefined) return '—';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export function formatDate(value, opts = {}) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "3 hours ago", "in 2 days" — used throughout the activity timeline. */
export function formatRelativeTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  const diffMs = d.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const abs = Math.abs(diffMin);

  const units = [
    { limit: 60, div: 1, label: 'minute' },
    { limit: 60 * 24, div: 60, label: 'hour' },
    { limit: 60 * 24 * 30, div: 60 * 24, label: 'day' },
    { limit: 60 * 24 * 365, div: 60 * 24 * 30, label: 'month' },
    { limit: Infinity, div: 60 * 24 * 365, label: 'year' },
  ];

  if (abs < 1) return 'just now';
  for (const u of units) {
    if (abs < u.limit) {
      const n = Math.max(1, Math.round(abs / u.div));
      const plural = n === 1 ? u.label : `${u.label}s`;
      return diffMin < 0 ? `${n} ${plural} ago` : `in ${n} ${plural}`;
    }
  }
  return formatDate(value);
}

export function initials(name) {
  // Default params only catch `undefined`, not `null` — and an unassigned
  // lead's assignedToName is null, not missing, so that gap matters here.
  const safeName = name ?? '';
  const parts = safeName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic colour pick for avatars, so the same name always gets the
 * same chip. Gradients rather than flat tints — at 24px an initials chip is
 * one of the few places a little richness reads clearly.
 */
const AVATAR_TONES = [
  'bg-linear-to-br from-brand-400 to-brand-600 text-white',
  'bg-linear-to-br from-accent-400 to-accent-600 text-white',
  'bg-linear-to-br from-success-500 to-success-700 text-white',
  'bg-linear-to-br from-info-500 to-info-700 text-white',
  'bg-linear-to-br from-purple-500 to-purple-700 text-white',
  'bg-linear-to-br from-teal-500 to-teal-700 text-white',
  'bg-linear-to-br from-warning-500 to-warning-700 text-white',
  'bg-linear-to-br from-neutral-400 to-neutral-600 text-white',
];

export function avatarTone(name) {
  const safeName = name ?? '';
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) hash = (hash * 31 + safeName.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function toTitleCase(value = '') {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
