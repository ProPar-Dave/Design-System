import React from 'react';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'primary' | 'secondary' | 'muted' | 'inverse';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
}

export function Text({ 
  as: Component = 'p',
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  children, 
  className = '', 
  ...props 
}: TextProps) {
  const classes = [
    'adsm-text',
    `adsm-text--${variant}`,
    `adsm-text--${size}`,
    `adsm-text--${weight}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}