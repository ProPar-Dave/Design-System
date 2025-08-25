import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const classes = [
    'adsm-button',
    `adsm-button--${variant}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}