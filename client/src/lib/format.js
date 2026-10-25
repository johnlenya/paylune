const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function usd(cents) {
  return currency.format((Number(cents) || 0) / 100);
}

export function usdWhole(cents) {
  return currency.format((Number(cents) || 0) / 100).replace('.00', '');
}

export function usdAbs(cents) {
  return currency.format(Math.abs(Number(cents) || 0) / 100);
}

export function usdCompact(cents) {
  return currencyCompact.format((Number(cents) || 0) / 100);
}

export function parseAmountToCents(value) {
  if (typeof value !== 'string' || !/^\d*(\.\d{0,2})?$/.test(value.trim())) {
    return null;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

export function cx(...values) {
  return values.filter(Boolean).join(' ');
}

export function initials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || '?'
  );
}

const AVATAR_STYLES = [
  'bg-[#DBF5B9] text-[#2C481B]',
  'bg-[#D8E7FF] text-[#24406B]',
  'bg-[#FCE2D5] text-[#6B3520]',
  'bg-[#E9DFFF] text-[#46326F]',
  'bg-[#D2F2EA] text-[#1C5042]',
  'bg-[#FBE3EC] text-[#6B2B42]',
];

export function avatarStyle(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return AVATAR_STYLES[hash % AVATAR_STYLES.length];
}

const dateFull = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateShort = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const timeFull = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(iso) {
  return dateFull.format(new Date(iso));
}

export function formatDateTime(iso) {
  return timeFull.format(new Date(iso));
}

export function relativeDay(iso) {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday - startOfDate) / 86_400_000);

  if (diffDays === 0) {
    return `Today, ${new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)}`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  }
  return dateShort.format(date);
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function monthKey(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(iso) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(iso),
  );
}
