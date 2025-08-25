// Minimal test version - step 1: Just basic rendering
import * as React from 'react';
import { devLog } from '../utils/devLog';

export default function ComponentDrawerMinimal() {
  devLog('[Minimal] ComponentDrawerMinimal rendering...');
  
  const [testState, setTestState] = React.useState(false);
  
  React.useEffect(() => {
    devLog('[Minimal] ComponentDrawerMinimal mounted successfully');
    setTestState(true);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        padding: '1rem',
        background: 'var(--color-panel, #1a1a1a)',
        color: 'var(--color-text, #ffffff)',
        border: '1px solid var(--color-border, #333)',
        borderRadius: 'var(--radius-md, 8px)',
        zIndex: 9999,
        fontSize: '0.8rem'
      }}
    >
      <h4 style={{ margin: '0 0 0.5rem 0' }}>ComponentDrawer Test</h4>
      <p>Minimal test: {testState ? '✓ Mounted' : '⏳ Mounting...'}</p>
      <p>React version: {React.version}</p>
      <button 
        onClick={() => devLog('[Minimal] Test button clicked')}
        style={{
          padding: '0.25rem 0.5rem',
          background: 'var(--color-primary, #3b82f6)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Log
      </button>
    </div>
  );
}