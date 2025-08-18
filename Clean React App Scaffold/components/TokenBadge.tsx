import * as React from 'react';

function readVars(){
  const root = (document.getElementById('adsm-root') as HTMLElement) || document.documentElement;
  const cs = getComputedStyle(root);
  const val = (v:string)=>cs.getPropertyValue(v).trim();
  return { bg: val('--color-bg'), panel: val('--color-panel'), accent: val('--color-accent') };
}

export function TokenBadge(){
  const [vals,setVals] = React.useState(readVars());
  React.useEffect(()=>{
    const h = ()=> setVals(readVars());
    window.addEventListener('adsm:tokens-ready', h);
    document.addEventListener('adsm:tokens:updated', h);
    const id = window.setInterval(h, 1500); // cheap keep-in-sync
    return ()=>{ 
      window.removeEventListener('adsm:tokens-ready', h); 
      document.removeEventListener('adsm:tokens:updated', h);
      clearInterval(id); 
    };
  },[]);
  return (
    <div style={{
      padding:'6px 10px', border:'1px solid var(--color-border)', borderRadius:12,
      background:'var(--color-panel)', color:'var(--color-text)', whiteSpace:'nowrap',
      pointerEvents:'none' // display-only; never blocks clicks
    }}>
      {`bg:${vals.bg} panel:${vals.panel} accent:${vals.accent}`}
    </div>
  );
}