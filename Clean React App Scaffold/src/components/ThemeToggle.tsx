import React from 'react';

export default function ThemeToggle(){
  const getRoot = ()=> document.querySelector('.adsm-ui') as HTMLElement;
  const current = ()=> (getRoot()?.getAttribute('data-theme') || 'dark') as ('light'|'dark');
  const setTheme = (t:'light'|'dark')=> getRoot()?.setAttribute('data-theme', t);
  const [t,setT] = React.useState(current());
  return (
    <button className="adsm-btn adsm-btn-secondary"
      onClick={()=>{ const n = t==='dark'?'light':'dark'; setTheme(n); setT(n); }}>
      {t==='dark' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}