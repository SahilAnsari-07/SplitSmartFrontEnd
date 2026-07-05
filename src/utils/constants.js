export const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', emoji: '🍜', color: '#f97316', bg: '#fff7ed' },
  { value: 'groceries', label: 'Groceries', emoji: '🛒', color: '#22c55e', bg: '#f0fdf4' },
  { value: 'transport', label: 'Transport', emoji: '🚌', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'utilities', label: 'Utilities', emoji: '💡', color: '#eab308', bg: '#fefce8' },
  { value: 'rent', label: 'Rent', emoji: '🏠', color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎮', color: '#ec4899', bg: '#fdf2f8' },
  { value: 'health', label: 'Health', emoji: '💊', color: '#14b8a6', bg: '#f0fdfa' },
  { value: 'other', label: 'Other', emoji: '📦', color: '#94a3b8', bg: '#f8fafc' },
];

export const GROUP_EMOJIS = ['🏠', '🏢', '🎓', '✈️', '🍕', '🎉', '💼', '🌟'];

export const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#22c55e', '#14b8a6', '#3b82f6', '#eab308',
];

export function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getCategoryInfo(value) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
