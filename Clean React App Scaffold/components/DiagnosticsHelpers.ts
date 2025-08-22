export function getScoreColor(score: number): string {
  if (score >= 90) return 'var(--success-text)';
  if (score >= 70) return 'var(--warning-text)';
  return 'var(--error-text)';
}

export function getScoreBadgeStyle(score: number): React.CSSProperties {
  return {
    background: score >= 90 ? 'var(--success-bg)' : score >= 70 ? 'var(--warning-bg)' : 'var(--error-bg)',
    color: score >= 90 ? 'var(--success-text)' : score >= 70 ? 'var(--warning-text)' : 'var(--error-text)',
    border: `2px solid ${score >= 90 ? 'var(--success-border)' : score >= 70 ? 'var(--warning-border)' : 'var(--error-border)'}`,
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  };
}

export const DIAGNOSTIC_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'form-fields', label: 'Form Fields' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'atoms', label: 'Atoms' },
  { id: 'regression', label: 'Regression Tests' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'performance', label: 'Performance' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'logs', label: 'Logs' }
];

export const TAB_STYLES = {
  container: {
    display: 'flex', 
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-background)',
    overflowX: 'auto' as const
  },
  tab: (isSelected: boolean) => ({
    flex: '0 0 auto',
    padding: '12px 16px',
    border: 'none',
    background: isSelected ? 'var(--tab-active-bg)' : 'transparent',
    color: isSelected ? 'var(--tab-active-fg)' : 'var(--tab-inactive-fg)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minHeight: '44px',
    whiteSpace: 'nowrap' as const
  })
};

export function createScreenReaderAnnouncement(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = message;
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export function formatPercentage(value: number, total: number): string {
  return total > 0 ? (value / total * 100).toFixed(1) : '0';
}

export function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical': return '🚨';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📝';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'var(--chip-danger-text)';
    case 'error': return 'var(--chip-danger-text)';
    case 'warning': return 'var(--chip-warning-text)';
    case 'info': return 'var(--chip-info-text)';
    default: return 'var(--chip-neutral-text)';
  }
}