// src/components/TokenPanel.tsx
import * as React from 'react';
import { loadTokens, updateToken, resetTokens, applyTokens, DEFAULT_TOKENS } from '../lib/TokenRuntime';

type Props = { rootSelector?: string };

export default function TokenPanel({ rootSelector = '#adsm-root' }: Props) {
  const [tokens, setTokens] = React.useState(loadTokens());

  React.useEffect(() => { applyTokens(tokens, rootSelector); }, []); // apply on mount

  const onChange = (name: string, value: string) => {
    try {
      const current = tokens[name];
      if (typeof current !== 'string') {
        console.warn('[tokens] creating new token:', name);
      }
      
      // Guard against invalid inputs
      if (!name || typeof value !== 'string') {
        console.warn('[tokens] invalid input for onChange:', { name, value });
        return;
      }
      
      const next = updateToken(name, value, rootSelector);
      if (next) {
        setTokens(next);
        
        // Dispatch custom event for other components to react to token changes
        document.dispatchEvent(new CustomEvent('adsm:tokens:updated', { 
          detail: { name, value, tokens: next } 
        }));
      }
    } catch (error) {
      console.error('[tokens] error updating token:', error);
      // Fallback to current tokens on error
      setTokens(loadTokens());
    }
  };

  const rows = [
    { title: 'Colors', keys: ['--color-bg','--color-panel','--color-text','--color-muted','--color-border','--color-accent'] },
    { title: 'Inputs', keys: ['--input-bg','--input-text','--input-border'] },
    { title: 'Buttons', keys: ['--btn-primary-bg','--btn-primary-text'] },
    { title: 'Layout', keys: ['--space-1','--space-2','--space-3','--space-4','--radius-sm','--radius-md','--radius-lg','--font-size','--focus-ring'] },
  ];

  return (
    <div className="adsm-panel">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
        <h3 style={{margin:0}}>Design Tokens</h3>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="adsm-btn adsm-btn-secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(tokens,null,2)], {type:'application/json'});
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
              a.download = 'adsm-tokens.json'; a.click();
            }}>Export JSON</button>
          <button className="adsm-btn adsm-btn-danger"
            onClick={() => { 
              try {
                const next = resetTokens(rootSelector); 
                setTokens(next);
                document.dispatchEvent(new CustomEvent('adsm:tokens:updated', { 
                  detail: { action: 'reset', tokens: next } 
                }));
              } catch (error) {
                console.error('[tokens] error resetting tokens:', error);
              }
            }}>Reset</button>
        </div>
      </div>

      {rows.map((group) => (
        <section key={group.title} className="adsm-panel" style={{padding:'12px',margin:'12px 0'}}>
          <strong>{group.title}</strong>
          <div style={{display:'grid',gap:'10px',gridTemplateColumns:'max(220px) 1fr'}}>
            {group.keys.map(k=>(
              <React.Fragment key={k}>
                <label style={{color:'var(--color-muted)'}} htmlFor={k}>{k}</label>
                <input 
                  id={k} 
                  className="adsm-input-enhanced" 
                  type="text"
                  value={tokens[k] ?? DEFAULT_TOKENS[k] ?? ''}
                  onChange={(e) => {
                    try {
                      onChange(k, e.target.value);
                    } catch (error) {
                      console.error('[tokens] input error for', k, error);
                    }
                  }}
                  onBlur={(e) => {
                    // Validate on blur and revert if invalid
                    const value = e.target.value;
                    if (value !== (tokens[k] ?? DEFAULT_TOKENS[k] ?? '')) {
                      try {
                        onChange(k, value);
                      } catch (error) {
                        console.error('[tokens] blur validation error for', k, error);
                        // Reset to previous valid value
                        e.target.value = tokens[k] ?? DEFAULT_TOKENS[k] ?? '';
                      }
                    }
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}