import React from 'react';

export type DemoProps = Record<string, any>;

// Enhanced preview widgets mapped by previewKind
function ButtonPreview(props: any) {
  const { label = 'Button', variant = 'primary', disabled = false, size = 'md' } = props;
  const baseStyles = {
    padding: size === 'sm' ? '4px 8px' : size === 'lg' ? '12px 24px' : '8px 16px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    background: variant === 'primary' ? 'var(--color-primary)' : 
                variant === 'secondary' ? 'var(--color-secondary)' : 
                variant === 'destructive' ? 'var(--color-destructive)' : 'var(--color-muted)',
    color: variant === 'primary' ? 'var(--color-primary-foreground)' : 
           variant === 'secondary' ? 'var(--color-secondary-foreground)' : 
           variant === 'destructive' ? 'var(--color-destructive-foreground)' : 'var(--color-text)',
    transition: 'all 0.2s ease',
  };
  
  return (
    <button disabled={disabled} style={baseStyles}>
      {label}
    </button>
  );
}

function BadgePreview(props: any) {
  const { text = 'New', variant = 'default' } = props;
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'var(--radius-md)',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'var(--font-weight-medium)',
    background: variant === 'default' ? 'var(--color-muted)' : 
                variant === 'secondary' ? 'var(--color-secondary)' : 
                variant === 'destructive' ? 'var(--color-destructive)' : 'var(--color-accent)',
    color: variant === 'default' ? 'var(--color-muted-foreground)' : 
           variant === 'secondary' ? 'var(--color-secondary-foreground)' : 
           variant === 'destructive' ? 'var(--color-destructive-foreground)' : 'var(--color-accent-foreground)',
  };
  
  return <span style={baseStyles}>{text}</span>;
}

function ChipPreview(props: any) {
  const { label = 'Chip', selected = false, removable = false } = props;
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: 'var(--font-weight-medium)',
    border: '1px solid var(--color-border)',
    background: selected ? 'var(--color-accent)' : 'var(--color-panel)',
    color: selected ? 'var(--color-accent-foreground)' : 'var(--color-text)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
  
  return (
    <div style={baseStyles}>
      {label}
      {removable && (
        <span style={{ marginLeft: '4px', fontSize: '12px', opacity: 0.7 }}>×</span>
      )}
    </div>
  );
}

function InputPreview(props: any) {
  const { placeholder = 'Enter text...', disabled = false, error = false } = props;
  const baseStyles = {
    padding: '8px 12px',
    border: `1px solid ${error ? 'var(--color-destructive)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    background: disabled ? 'var(--color-muted)' : 'var(--color-input-background)',
    color: disabled ? 'var(--color-muted-foreground)' : 'var(--color-text)',
    fontSize: 'var(--font-size-base)',
    cursor: disabled ? 'not-allowed' : 'text',
    outline: 'none',
    minWidth: '200px',
  };
  
  return (
    <input 
      type="text" 
      placeholder={placeholder} 
      disabled={disabled} 
      style={baseStyles}
      readOnly
    />
  );
}

// New registry with enhanced previews
export const PREVIEWS: Record<string, React.FC<any>> = {
  button: ButtonPreview,
  badge: BadgePreview,
  chip: ChipPreview,
  input: InputPreview,
  btn: ButtonPreview, // Legacy alias
  checkbox: ({ label = 'Label', checked = false, disabled = false }) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input type="checkbox" checked={checked} disabled={disabled} readOnly />
      <span style={{ color: disabled ? 'var(--color-muted-foreground)' : 'var(--color-text)' }}>{label}</span>
    </label>
  ),
  searchbar: ({ placeholder = 'Search…', clearable = true }) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <InputPreview placeholder={placeholder} />
      {clearable && (
        <button style={{
          padding: '4px 8px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'transparent',
          color: 'var(--color-text)',
          fontSize: '12px',
        }}>
          Clear
        </button>
      )}
    </div>
  ),
};

export function PreviewHost({ kind, props }: { kind?: string; props: any }) {
  const Comp = kind ? PREVIEWS[kind] : undefined;
  
  if (!Comp) {
    return (
      <div className="adsm-preview__fallback" style={{
        padding: '24px',
        border: '2px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        color: 'var(--color-muted-foreground)',
        background: 'var(--color-muted)',
        fontSize: '14px',
      }}>
        No preview available
        {kind && (
          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
            Preview kind: {kind}
          </div>
        )}
      </div>
    );
  }
  
  try { 
    return (
      <div className="adsm-preview__container" style={{
        padding: '16px',
        background: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
      }}>
        <Comp {...props} />
      </div>
    );
  } catch (error) { 
    return (
      <div className="adsm-preview__fallback" style={{
        padding: '24px',
        border: '2px solid var(--color-destructive)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        color: 'var(--color-destructive-foreground)',
        background: 'var(--color-destructive)',
        fontSize: '14px',
      }}>
        Preview failed
        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
}

// Legacy registry for backwards compatibility
export const Registry: Record<string, (p: DemoProps) => JSX.Element> = {
  btn: (props) => React.createElement(ButtonPreview, props),
  input: (props) => React.createElement(InputPreview, props),
  checkbox: (props) => React.createElement(PREVIEWS.checkbox, props),
  searchbar: (props) => React.createElement(PREVIEWS.searchbar, props),
  'form-row': ({ label = 'Label', help = '' }) => (
    <div style={{ display: 'grid', gap: 6 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>
      <InputPreview />
      {help && <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{help}</div>}
    </div>
  ),
  'site-header': ({ title = 'Atomic DS' }) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '8px 12px', 
      border: '1px solid var(--color-border)', 
      borderRadius: 'var(--radius-lg)',
      background: 'var(--color-panel)'
    }}>
      <strong>{title}</strong>
      <div style={{ display: 'flex', gap: 8 }}>
        <ButtonPreview label="Sign in" variant="secondary" />
        <ButtonPreview label="Get started" />
      </div>
    </div>
  ),
};