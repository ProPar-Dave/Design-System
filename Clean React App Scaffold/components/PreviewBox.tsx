import React from 'react';

export function PreviewBox({ id }: { id: string }) {
  switch (id) {
    case 'btn':
    case 'button':
      return (
        <div className="preview-canvas">
          <button className="btn btn--primary">Primary</button>
        </div>
      );
    
    case 'input':
    case 'textfield':
      return (
        <div className="preview-canvas">
          <input 
            className="input" 
            placeholder="Enter text..." 
            defaultValue="Sample input"
          />
        </div>
      );
    
    case 'searchbar':
    case 'search':
      return (
        <div className="preview-canvas">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              className="input" 
              placeholder="Search components..." 
              style={{ flex: 1 }}
            />
            <button className="btn btn--secondary">🔍</button>
          </div>
        </div>
      );

    // Add more safe stubs over time
    default:
      return (
        <div className="preview-canvas preview--empty">
          <span style={{ 
            color: 'color-mix(in oklab, var(--color-text), var(--color-panel) 40%)',
            fontStyle: 'italic'
          }}>
            No preview available for "{id}"
          </span>
        </div>
      );
  }
}