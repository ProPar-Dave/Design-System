import React from 'react';
import '../styles/nav.css'; // ensure nav styles are loaded

type Props = {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
};

export default function AppFrame({ children, theme }: Props) {
  // Keep a stable, top-level wrapper so tokens & theme apply everywhere.
  // The className "adsm-ui" provides the namespace and the data-theme drives tokens.
  const currentTheme = theme ?? (document.documentElement.dataset.theme as
    | 'light'
    | 'dark'
    | undefined) ?? 'dark';

  return (
    <div className="adsm-ui app" data-theme={currentTheme}>
      {children}
    </div>
  );
}