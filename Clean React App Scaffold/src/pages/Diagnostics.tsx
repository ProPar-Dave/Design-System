import React from 'react';
import { runAudits, QUICK_AUDIT_KEYS, generateAuditConfigSummary } from '../../diagnostics/audits';
import { getCatalogDiagnostics } from '../catalog/loader';

function contrastRatio(hex1: string, hex2: string): number {
  const parseColor = (color: string) => {
    color = color.replace('#', '');
    if (color.length === 3) {
      color = color.split('').map(char => char + char).join('');
    }
    if (color.length === 6) {
      const r = parseInt(color.substr(0, 2), 16);
      const g = parseInt(color.substr(2, 2), 16);
      const b = parseInt(color.substr(4, 2), 16);
      return { r, g, b };
    }
    return null;
  };
  
  const getLuminance = (r: number, g: number, b: number) => {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };
  
  const c1 = parseColor(hex1);
  const c2 = parseColor(hex2);
  if (!c1 || !c2) return 1;
  
  const l1 = getLuminance(c1.r, c1.g, c1.b);
  const l2 = getLuminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function readVar(name:string){ return getComputedStyle(document.querySelector('.adsm-ui') as HTMLElement).getPropertyValue(name).trim(); }
function px(n:string){ const m=n.match(/([\d.]+)/); return m? parseFloat(m[1]): NaN; }
function exportJSON(obj:any){ const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='adsm-theme-check.json'; a.click(); }
function checkContrast(fg:string,bg:string){ return contrastRatio(fg, bg); }

function exportState(obj: any) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'adsm-theme-audit.json';
  a.click();
}

export default function Diagnostics() {
  const [auditResults, setAuditResults] = React.useState(null);
  const [isAuditing, setIsAuditing] = React.useState(false);

  const runQuickAudit = async () => {
    setIsAuditing(true);
    try {
      const results = await runAudits(QUICK_AUDIT_KEYS, []);
      const auditData = {
        timestamp: new Date().toISOString(),
        type: 'quick-audit',
        results: results,
        summary: generateAuditConfigSummary(results),
        catalogInfo: getCatalogDiagnostics()
      };
      setAuditResults(auditData);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const exportJSON = () => {
    if (!auditResults) return;
    const blob = new Blob([JSON.stringify(auditResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adsm-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Quick Audit & Export</h2>
      
      <div className="flex gap-3">
        <button 
          onClick={runQuickAudit} 
          disabled={isAuditing}
          className="adsm-button-primary"
        >
          {isAuditing ? '🔄 Running...' : '⚡ Quick Audit'}
        </button>
        {auditResults && (
          <button onClick={exportJSON} className="adsm-button-secondary">
            💾 Export JSON
          </button>
        )}
        <button className="adsm-button-primary" onClick={()=>{
          const report:any = { ok:true, issues:[] as string[], tokens:{} as Record<string,string> };
          const t = ['--color-bg','--color-text','--color-panel','--color-border','--color-accent','--space-1','--space-2','--space-3','--space-4','--radius-sm','--radius-md','--radius-lg'];
          t.forEach(k=>report.tokens[k]=readVar(k));
          const cr = checkContrast(report.tokens['--color-text'], report.tokens['--color-bg']);
          if (cr < 4.5){ report.ok=false; report.issues.push(`Body contrast too low: ${cr}`); }
          const s = ['--space-1','--space-2','--space-3','--space-4'].map(k=>px(report.tokens[k]));
          if (!(s[0] < s[1] && s[1] < s[2] && s[2] < s[3])){ report.ok=false; report.issues.push(`Spacing scale not strictly increasing: ${s.join(',')}`); }
          const r = ['--radius-sm','--radius-md','--radius-lg'].map(k=>px(report.tokens[k]));
          if (r.some(v=>isNaN(v)||v<0)){ report.ok=false; report.issues.push('Radius tokens invalid'); }
          exportJSON(report);
        }}>Quick Theme Check</button>
      </div>
      
      {auditResults && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">✅ Audit completed: {new Date(auditResults.timestamp).toLocaleString()}</p>
          <p className="text-green-600">{auditResults.results.length} checks performed</p>
        </div>
      )}
    </div>
  );
}