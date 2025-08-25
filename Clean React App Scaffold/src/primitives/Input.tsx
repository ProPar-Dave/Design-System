import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  const classes = `adsm-input ${className}`.trim();
  
  return <input className={classes} {...props} />;
}