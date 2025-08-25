import React from 'react';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'panel' | 'accent' | 'elevated';
  children: React.ReactNode;
}

export function Surface({ 
  variant = 'default', 
  children, 
  className = '', 
  ...props 
}: SurfaceProps) {
  const variantClass = variant !== 'default' ? `adsm-surface--${variant}` : '';
  const classes = `adsm-surface ${variantClass} ${className}`.trim();
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}