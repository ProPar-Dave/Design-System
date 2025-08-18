import * as React from 'react';
import type { PropSpec } from '../utils/catalog';

export function Control({ spec, value, onChange }: { 
  spec: PropSpec; 
  value: any; 
  onChange: (v: any) => void;
}) {
  const id = `ctrl-${spec.name}`;
  
  const controlStyles = {
    display: 'grid',
    gap: '6px',
    marginBottom: '12px',
  };

  const labelStyles = {
    fontSize: '14px',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const inputStyles = {
    padding: '8px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-input-background)',
    color: 'var(--color-text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer',
  };

  const checkboxWrapperStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  };

  const checkboxStyles = {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  };

  const descriptionStyles = {
    fontSize: '12px',
    color: 'var(--color-muted-foreground)',
    marginTop: '2px',
  };

  if (spec.kind === 'boolean') {
    return (
      <div style={controlStyles}>
        <label htmlFor={id} style={checkboxWrapperStyles}>
          <input 
            id={id} 
            type="checkbox" 
            checked={!!value} 
            onChange={e => onChange(e.currentTarget.checked)}
            style={checkboxStyles}
          />
          <span style={labelStyles}>
            {spec.label ?? spec.name}
            {spec.required && <span style={{ color: 'var(--color-destructive)' }}>*</span>}
          </span>
        </label>
        {spec.description && <div style={descriptionStyles}>{spec.description}</div>}
      </div>
    );
  }

  if (spec.kind === 'number') {
    return (
      <div style={controlStyles}>
        <label htmlFor={id} style={labelStyles}>
          {spec.label ?? spec.name}
          {spec.required && <span style={{ color: 'var(--color-destructive)' }}>*</span>}
        </label>
        <input 
          id={id} 
          type="number" 
          value={Number(value ?? spec.default ?? 0)} 
          onChange={e => onChange(Number(e.currentTarget.value))}
          style={inputStyles}
          placeholder={spec.default ? String(spec.default) : undefined}
        />
        {spec.description && <div style={descriptionStyles}>{spec.description}</div>}
      </div>
    );
  }

  if (spec.kind === 'select') {
    const options = spec.options ?? [];
    const currentValue = String(value ?? spec.default ?? options[0] ?? '');
    
    return (
      <div style={controlStyles}>
        <label htmlFor={id} style={labelStyles}>
          {spec.label ?? spec.name}
          {spec.required && <span style={{ color: 'var(--color-destructive)' }}>*</span>}
        </label>
        <select 
          id={id} 
          value={currentValue} 
          onChange={e => onChange(e.currentTarget.value)}
          style={selectStyles}
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {spec.description && <div style={descriptionStyles}>{spec.description}</div>}
      </div>
    );
  }

  // Default to text input
  return (
    <div style={controlStyles}>
      <label htmlFor={id} style={labelStyles}>
        {spec.label ?? spec.name}
        {spec.required && <span style={{ color: 'var(--color-destructive)' }}>*</span>}
      </label>
      <input 
        id={id} 
        type="text" 
        value={String(value ?? spec.default ?? '')} 
        onChange={e => onChange(e.currentTarget.value)}
        style={inputStyles}
        placeholder={spec.default ? String(spec.default) : undefined}
      />
      {spec.description && <div style={descriptionStyles}>{spec.description}</div>}
    </div>
  );
}

export function ControlsGroup({ 
  specs, 
  values, 
  onChange,
  onReset 
}: { 
  specs: PropSpec[]; 
  values: Record<string, any>; 
  onChange: (name: string, value: any) => void;
  onReset?: () => void;
}) {
  const containerStyles = {
    display: 'grid',
    gap: '16px',
  };

  const actionsStyles = {
    display: 'flex',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--color-border)',
    marginTop: '8px',
  };

  const buttonStyles = {
    padding: '6px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-panel)',
    color: 'var(--color-text)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={containerStyles}>
      {specs.map((spec) => (
        <Control 
          key={spec.name} 
          spec={spec} 
          value={values[spec.name]} 
          onChange={(value) => onChange(spec.name, value)} 
        />
      ))}
      
      {specs.length > 0 && onReset && (
        <div style={actionsStyles}>
          <button 
            onClick={onReset}
            style={buttonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-panel)';
            }}
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}