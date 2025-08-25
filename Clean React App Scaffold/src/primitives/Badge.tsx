import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

export function Badge({ 
  variant = 'default', 
  children, 
  className = '', 
  ...props 
}: BadgeProps) {
  const classes = [
    'adsm-badge',
    `adsm-badge--${variant}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}