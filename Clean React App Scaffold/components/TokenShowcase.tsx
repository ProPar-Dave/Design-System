import React from 'react';

// Component to showcase all semantic tokens in action
export function TokenShowcase() {
  const [inputValue, setInputValue] = React.useState('Sample input');
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('preview');
  const [showStatus, setShowStatus] = React.useState<'success' | 'warning' | 'error' | 'info' | null>(null);

  return (
    <div style={{
      display: 'grid',
      gap: '24px',
      padding: '16px',
      background: 'var(--color-bg)',
      color: 'var(--color-text)'
    }}>
      <div>
        <h2 style={{ marginBottom: '16px' }}>Semantic Token Showcase</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
          This component demonstrates all semantic tokens in action. Changes to token values will reflect immediately.
        </p>
      </div>

      {/* Buttons */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Buttons</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="adsm-button-primary">Primary Button</button>
          <button className="adsm-button-primary" disabled>Primary Disabled</button>
          <button className="adsm-button-secondary">Secondary Button</button>
          <button className="adsm-button-secondary" disabled>Secondary Disabled</button>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            <input 
              type="checkbox" 
              checked={isDisabled} 
              onChange={(e) => setIsDisabled(e.target.checked)}
            />
            Show disabled states
          </label>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Form Controls</h3>
        <div style={{ display: 'grid', gap: '12px', maxWidth: '400px' }}>
          <input 
            className="adsm-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter some text..."
            disabled={isDisabled}
          />
          
          <select className="adsm-select" disabled={isDisabled}>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
          
          <textarea 
            className="adsm-input" 
            placeholder="Multi-line text input..."
            rows={3}
            disabled={isDisabled}
            style={{ resize: 'vertical' }}
          />
        </div>
      </section>

      {/* Tabs */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Tabs</h3>
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--color-border)' }}>
          {['preview', 'code', 'props'].map((tab) => (
            <button
              key={tab}
              className={`adsm-tab ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ 
          padding: '16px', 
          background: 'var(--color-panel)', 
          border: '1px solid var(--color-border)',
          borderTop: 'none'
        }}>
          Content for {selectedTab} tab
        </div>
      </section>

      {/* Chips */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Chips</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="adsm-chip">Design System</span>
          <span className="adsm-chip">React</span>
          <span className="adsm-chip">TypeScript</span>
          <span className="adsm-chip">Tokens</span>
          <span className="adsm-chip">Interactive</span>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Cards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div className="adsm-card">
            <h4 style={{ margin: '0 0 8px' }}>Sample Card</h4>
            <p style={{ margin: '0', color: 'var(--color-muted)', fontSize: '14px' }}>
              This card uses semantic tokens for background, border, and hover states.
            </p>
          </div>
          
          <div className="adsm-card">
            <h4 style={{ margin: '0 0 8px' }}>Another Card</h4>
            <p style={{ margin: '0', color: 'var(--color-muted)', fontSize: '14px' }}>
              Hover over cards to see the hover state in action.
            </p>
          </div>
        </div>
      </section>

      {/* Links */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Links</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a href="#" onClick={(e) => e.preventDefault()}>Primary Link</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Secondary Link</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Tertiary Link</a>
        </div>
      </section>

      {/* Status Messages */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Status Messages</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            className="adsm-button-secondary"
            onClick={() => setShowStatus('success')}
          >
            Success
          </button>
          <button 
            className="adsm-button-secondary"
            onClick={() => setShowStatus('warning')}
          >
            Warning
          </button>
          <button 
            className="adsm-button-secondary"
            onClick={() => setShowStatus('error')}
          >
            Error
          </button>
          <button 
            className="adsm-button-secondary"
            onClick={() => setShowStatus('info')}
          >
            Info
          </button>
          <button 
            className="adsm-button-secondary"
            onClick={() => setShowStatus(null)}
          >
            Clear
          </button>
        </div>
        
        {showStatus && (
          <div className={`adsm-${showStatus}`}>
            <strong>{showStatus.charAt(0).toUpperCase() + showStatus.slice(1)}:</strong> This is a {showStatus} message using semantic tokens for styling.
          </div>
        )}
      </section>

      {/* Interactive States Demo */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Interactive States</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ 
            background: 'var(--color-hover-bg)',
            color: 'var(--color-text)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            Hover Background Color (--color-hover-bg)
          </div>
          
          <div style={{ 
            background: 'var(--color-active-bg)',
            color: 'var(--color-text)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            Active Background Color (--color-active-bg)
          </div>
          
          <div style={{ 
            background: 'var(--color-disabled-bg)',
            color: 'var(--color-disabled-text)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            Disabled State (--color-disabled-bg, --color-disabled-text)
          </div>
          
          <div style={{ 
            background: 'var(--color-panel)',
            color: 'var(--color-text)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-focus-ring)'
          }}>
            Focus Ring Color (--color-focus-ring)
          </div>
        </div>
      </section>

      {/* Token Values Display */}
      <section>
        <h3 style={{ marginBottom: '12px' }}>Live Token Values</h3>
        <div style={{ 
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--color-muted)' }}>
            These values update in real-time when you modify tokens:
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '8px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div>--chip-bg: <span style={{ color: 'var(--chip-bg)' }}>████</span></div>
            <div>--tab-active-fg: <span style={{ color: 'var(--tab-active-fg)' }}>████</span></div>
            <div>--button-primary-bg: <span style={{ color: 'var(--button-primary-bg)' }}>████</span></div>
            <div>--input-border: <span style={{ color: 'var(--input-border)' }}>████</span></div>
            <div>--success-bg: <span style={{ color: 'var(--success-bg)' }}>████</span></div>
            <div>--error-text: <span style={{ color: 'var(--error-text)' }}>████</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}