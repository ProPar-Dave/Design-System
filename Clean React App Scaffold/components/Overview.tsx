import React from 'react';

export function Overview() { 
  return (
    <div role="region" aria-labelledby="overview-title">
      <h1 id="overview-title" style={{marginBottom: '16px'}}>
        Welcome to Atomic DS Manager
      </h1>
      <p style={{lineHeight: 1.6, marginBottom: '16px'}}>
        A comprehensive design system management tool for organizing components, tokens, and guidelines.
      </p>
      <p style={{lineHeight: 1.6, color: 'var(--color-muted-foreground)'}}>
        Use the navigation menu to explore components, manage design tokens, and access system guidelines.
      </p>
    </div>
  );
}

export default Overview;