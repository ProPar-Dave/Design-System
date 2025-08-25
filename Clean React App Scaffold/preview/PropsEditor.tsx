import React from 'react';
import { registry } from './registry';

export interface PropSpec {
  name: string;
  label?: string;
  kind: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'textarea';
  description?: string;
  default?: any;
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

interface PropsEditorProps {
  id: string;
  value?: Record<string, any>;
  onChange?: (v: Record<string, any>) => void;
  onPropsChange?: (props: Record<string, any>) => void;
  specs?: PropSpec[];
}

// Mock component specs registry - in a real app this would come from component definitions
const componentSpecs: Record<string, PropSpec[]> = {
  'button': [
    {
      name: 'variant',
      label: 'Variant',
      kind: 'select',
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost'],
      default: 'primary',
      description: 'The visual style variant of the button'
    },
    {
      name: 'size',
      label: 'Size',
      kind: 'select',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'The size of the button'
    },
    {
      name: 'disabled',
      label: 'Disabled',
      kind: 'boolean',
      default: false,
      description: 'Whether the button is disabled'
    },
    {
      name: 'children',
      label: 'Text',
      kind: 'text',
      default: 'Button',
      description: 'The text content of the button'
    }
  ],
  'input': [
    {
      name: 'type',
      label: 'Type',
      kind: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
      default: 'text',
      description: 'The input type'
    },
    {
      name: 'placeholder',
      label: 'Placeholder',
      kind: 'text',
      default: 'Enter text...',
      description: 'Placeholder text'
    },
    {
      name: 'disabled',
      label: 'Disabled',
      kind: 'boolean',
      default: false,
      description: 'Whether the input is disabled'
    },
    {
      name: 'required',
      label: 'Required',
      kind: 'boolean',
      default: false,
      description: 'Whether the input is required'
    }
  ],
  'badge': [
    {
      name: 'variant',
      label: 'Variant',
      kind: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      default: 'default',
      description: 'The visual style variant'
    },
    {
      name: 'children',
      label: 'Text',
      kind: 'text',
      default: 'Badge',
      description: 'The badge content'
    }
  ],
  'card': [
    {
      name: 'title',
      label: 'Title',
      kind: 'text',
      default: 'Card Title',
      description: 'The card title'
    },
    {
      name: 'description',
      label: 'Description',
      kind: 'textarea',
      default: 'Card description goes here...',
      description: 'The card description'
    },
    {
      name: 'showFooter',
      label: 'Show Footer',
      kind: 'boolean',
      default: true,
      description: 'Whether to show the card footer'
    }
  ],
  'avatar': [
    {
      name: 'size',
      label: 'Size',
      kind: 'select',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'The size of the avatar'
    },
    {
      name: 'fallback',
      label: 'Fallback Text',
      kind: 'text',
      default: 'AB',
      description: 'Fallback text when no image is available'
    },
    {
      name: 'src',
      label: 'Image URL',
      kind: 'text',
      default: '',
      description: 'The avatar image URL'
    }
  ]
};

export function PropsEditor({ id, value, onChange, onPropsChange, specs }: PropsEditorProps) {
  const entry = registry[id];
  const schema = entry?.schema ?? {};
  const defaults = entry?.defaults ?? {};
  const hasFields = !!Object.keys(schema as any).length;

  if (!hasFields) {
    return <div className="adsm-empty">No props available for this component.</div>;
  }

  // Convert registry schema to PropSpec format for compatibility
  const propSpecs: PropSpec[] = specs || Object.entries(schema).map(([name, schemaValue]) => {
    if (Array.isArray(schemaValue)) {
      return {
        name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        kind: 'select',
        options: schemaValue,
        default: defaults[name]
      };
    } else if (schemaValue === 'boolean') {
      return {
        name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        kind: 'boolean',
        default: defaults[name]
      };
    } else if (schemaValue === 'text') {
      return {
        name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        kind: 'text',
        default: defaults[name]
      };
    }
    return {
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      kind: 'text',
      default: defaults[name]
    };
  }) || [];

  // Use fallback to componentSpecs if no registry entry
  if (propSpecs.length === 0) {
    const fallbackSpecs = componentSpecs[id] || [];
    if (!Array.isArray(fallbackSpecs)) {
      console.warn('[PropsEditor] Invalid prop specs for component:', id);
      return (
        <div className="adsm-empty">No props available for this component.</div>
      );
    }
    propSpecs.push(...fallbackSpecs);
  }
  
  // Initialize props state with default values
  const [props, setProps] = React.useState<Record<string, any>>(() => {
    const initialProps: Record<string, any> = {};
    propSpecs.forEach(spec => {
      if (spec.default !== undefined) {
        initialProps[spec.name] = spec.default;
      }
    });
    return initialProps;
  });

  // Update parent when props change
  React.useEffect(() => {
    if (onPropsChange) {
      onPropsChange(props);
    }
    if (onChange) {
      onChange(props);
    }
  }, [props, onPropsChange, onChange]);

  // Handle prop value changes
  const handlePropChange = React.useCallback((name: string, value: any) => {
    setProps(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Reset to defaults
  const handleReset = React.useCallback(() => {
    const defaultProps: Record<string, any> = {};
    propSpecs.forEach(spec => {
      if (spec.default !== undefined) {
        defaultProps[spec.name] = spec.default;
      }
    });
    setProps(defaultProps);
  }, [propSpecs]);

  if (propSpecs.length === 0) {
    return (
      <div className="adsm-field-group">
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          /* Enhanced contrast for empty state */
          color: 'var(--info-text)',
          background: 'var(--info-bg)',
          border: '2px solid var(--info-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          lineHeight: '1.4',
          fontWeight: '500'
        }}>
          📋 No properties available for this component.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Reset button with enhanced accessibility */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: 'var(--color-text)',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Properties
        </h4>
        <button 
          onClick={handleReset}
          className="adsm-button-secondary"
          style={{
            background: 'var(--button-secondary-bg)',
            color: 'var(--button-secondary-text)',
            border: '2px solid var(--button-secondary-border)',
            padding: '6px 12px',
            fontSize: '12px',
            minHeight: '32px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--button-secondary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--button-secondary-bg)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '3px solid var(--color-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
            e.currentTarget.style.outlineOffset = '0';
          }}
        >
          Reset
        </button>
      </div>

      {/* Property controls */}
      {propSpecs.map((spec) => (
        <div key={spec.name} className="adsm-field-group">
          <label htmlFor={`prop-${spec.name}`} className="adsm-field-label">
            {spec.label || spec.name}
            {spec.required && (
            <span style={{ 
              color: 'var(--color-destructive)', 
              fontWeight: '700',
              fontSize: '16px',
              marginLeft: '2px' 
            }}>
              {' *'}
            </span>
          )}
          </label>

          {spec.kind === 'text' && (
            <input
              id={`prop-${spec.name}`}
              type="text"
              className="adsm-input"
              value={props[spec.name] || ''}
              onChange={(e) => handlePropChange(spec.name, e.target.value)}
              placeholder={spec.description}
            />
          )}

          {spec.kind === 'number' && (
            <input
              id={`prop-${spec.name}`}
              type="number"
              className="adsm-input"
              value={props[spec.name] || ''}
              onChange={(e) => handlePropChange(spec.name, parseFloat(e.target.value) || 0)}
              min={spec.min}
              max={spec.max}
              step={spec.step}
              placeholder={spec.description}
            />
          )}

          {spec.kind === 'boolean' && (
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              padding: '8px 12px',
              background: 'var(--info-bg)',
              border: '1px solid var(--info-border)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease'
            }}>
              <input
                id={`prop-${spec.name}`}
                type="checkbox"
                checked={props[spec.name] || false}
                onChange={(e) => handlePropChange(spec.name, e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer',
                  /* Ensure minimum touch target */
                  minWidth: '18px',
                  minHeight: '18px'
                }}
              />
              <span style={{ 
                fontSize: '14px', 
                color: 'var(--info-text)', /* Use info text token for better contrast */
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                {spec.description || `Enable ${spec.label || spec.name}`}
              </span>
            </label>
          )}

          {spec.kind === 'select' && spec.options && (
            <select
              id={`prop-${spec.name}`}
              className="adsm-select"
              value={props[spec.name] || ''}
              onChange={(e) => handlePropChange(spec.name, e.target.value)}
            >
              {spec.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {spec.kind === 'color' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                id={`prop-${spec.name}`}
                type="color"
                value={props[spec.name] || '#000000'}
                onChange={(e) => handlePropChange(spec.name, e.target.value)}
                style={{
                  width: '48px',
                  height: '44px',
                  border: '2px solid var(--input-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--input-bg)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid var(--color-ring)';
                  e.currentTarget.style.outlineOffset = '2px';
                  e.currentTarget.style.borderColor = 'var(--input-focus-border)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                  e.currentTarget.style.outlineOffset = '0';
                  e.currentTarget.style.borderColor = 'var(--input-border)';
                }}
              />
              <input
                type="text"
                className="adsm-input"
                value={props[spec.name] || ''}
                onChange={(e) => handlePropChange(spec.name, e.target.value)}
                placeholder="Enter color value"
                style={{ 
                  flex: 1,
                  /* Enhanced accessibility for color inputs */
                  background: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  border: '2px solid var(--input-border)',
                  fontSize: '14px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
                }}
              />
            </div>
          )}

          {spec.kind === 'textarea' && (
            <textarea
              id={`prop-${spec.name}`}
              className="adsm-textarea"
              value={props[spec.name] || ''}
              onChange={(e) => handlePropChange(spec.name, e.target.value)}
              placeholder={spec.description}
              rows={3}
            />
          )}

          {spec.description && (
            <div 
              className="adsm-field-hint"
              style={{
                /* Enhanced contrast for field hints */
                color: 'var(--color-text)',
                opacity: '0.75',
                fontSize: '13px',
                lineHeight: '1.4',
                background: 'var(--info-bg)',
                padding: '6px 8px',
                border: '1px solid var(--info-border)',
                borderRadius: '4px',
                marginTop: '6px'
              }}
            >
              {spec.description}
            </div>
          )}
        </div>
      ))}

      {/* Current props display for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{ 
            cursor: 'pointer', 
            color: 'var(--color-muted-foreground)',
            fontSize: '12px'
          }}>
            Debug: Current Props
          </summary>
          <pre style={{ 
            fontSize: '11px', 
            background: 'var(--color-muted)', 
            padding: '8px', 
            borderRadius: '4px',
            marginTop: '8px',
            overflow: 'auto',
            color: 'var(--color-text)'
          }}>
            {JSON.stringify(props, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// Hook for using current props in components
export function useCurrentProps() {
  const [currentProps, setCurrentProps] = React.useState<Record<string, any>>({});
  
  React.useEffect(() => {
    const handlePropsChange = (event: CustomEvent<Record<string, any>>) => {
      setCurrentProps(event.detail);
    };
    
    window.addEventListener('adsm:props:change', handlePropsChange as EventListener);
    return () => {
      window.removeEventListener('adsm:props:change', handlePropsChange as EventListener);
    };
  }, []);
  
  return currentProps;
}

// Export as default for lazy loading
export default PropsEditor;