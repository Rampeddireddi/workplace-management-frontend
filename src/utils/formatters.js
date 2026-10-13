/**
 * formatters.js
 * Centralized formatting utilities for consistent display across the application.
 */

export function formatHours(hours) {
  if (hours == null || isNaN(hours)) return '—';
  return `${Number(hours).toFixed(1)}h`;
}

export function formatPercent(val, decimals = 1) {
  if (val == null || isNaN(val)) return '—';
  return `${Number(val).toFixed(decimals)}%`;
}

export function formatNumber(val) {
  if (val == null || isNaN(val)) return '—';
  return Number(val).toLocaleString();
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function formatWeekLabel(weekStr) {
  if (!weekStr) return '—';
  // weekStr: YYYY-MM-DD (Monday of week)
  const d = new Date(weekStr + 'T00:00:00');
  return `Wk ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
}

export function formatTime(timeStr) {
  if (!timeStr) return '—';
  return timeStr; // Already in HH:MM
}

export function formatScore(score, total = 5) {
  if (score == null || isNaN(score)) return '—';
  return `${Number(score).toFixed(1)} / ${total}`;
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

export function getRoleColor(role) {
  const colors = {
    hr: 'badge-purple',
    manager: 'badge-blue',
    employee: 'badge-gray',
  };
  return colors[role] || 'badge-gray';
}

export function getStatusColor(status) {
  const colors = {
    completed: 'badge-green',
    'in-progress': 'badge-blue',
    enrolled: 'badge-yellow',
    present: 'badge-green',
    absent: 'badge-red',
    leave: 'badge-yellow',
  };
  return colors[status] || 'badge-gray';
}

export function getWorkModeColor(mode) {
  return mode === 'office' ? 'badge-blue' : 'badge-purple';
}

// Chart color palette
export const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#0ea5e9',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  office: '#2563eb',
  wfh: '#7c3aed',
  series: ['#2563eb', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
};
