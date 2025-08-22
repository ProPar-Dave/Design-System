import React from 'react';
import { safeLogEvent, startTimer } from '../diagnostics/logger';
import { announceToScreenReader } from '../utils/appHelpers';

// Enhanced Guidelines component with proper accessibility
export const GuidelinesViewer = React.memo(() => {
  const [html, setHtml] = React.useState('');
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // tiny MD → HTML with memoization
  const mdToHtml = React.useCallback((md: string) => {
    const esc = (s: string) => s.replace(/[&<>]/g, m => ({"&": "&amp;", "<": "&lt;", ">": "&gt;"}[m]!));
    md = md.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${esc(c)}</code></pre>`)
           .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
           .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
           .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
           .replace(/^(?:- |\* )(.*)(?:\n(?!\n)(?:- |\* ).*)*/gm, b => `<ul>` + b.split(/\n/).map(l => l.replace(/^(?:- |\* )/, '')).map(t => `<li>${esc(t)}</li>`).join('') + `</ul>`)
           .replace(/^(?!<h\d|<ul|<pre)([^\n][^\n]*)$/gm, '<p>$1</p>')
           .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
           .replace(/\*(.+?)\*/g, '<em>$1</em>')
           .replace(/`([^`]+)`/g, '<code>$1</code>');
    return md;
  }, []);

  React.useEffect(() => {
    (async () => {
      const timer = startTimer('guidelines-load');
      try {
        setLoading(true);
        // 1) Try multiple relative paths; some hosts rewrite absolute "/..." to index.html
        const candidates = [
          'guidelines.md', './guidelines.md', '/guidelines.md',
          'guidelines/guidelines.md', '/guidelines/guidelines.md'
        ];
        let text = '';
        for (const p of candidates) {
          try {
            const r = await fetch(p + (p.includes('?') ? '' : '?b=' + Date.now()), { cache: 'no-store' });
            if (r.ok) {
              const t = await r.text();
              // Skip HTML fallbacks ("This site requires JavaScript" etc.)
              if (!/^\s*</.test(t) || /<article|<h1|<p>/.test(t) === false) { text = t; break; }
            }
          } catch {}
        }
        // 2) Inline fallback via <script type="text/plain" id="adsm-guidelines">
        if (!text) {
          const s = document.getElementById('adsm-guidelines') as HTMLScriptElement | null;
          if (s) text = s.textContent || '';
        }
        // 3) Final starter content so the page is never empty
        if (!text) {
          text = `# Atomic DS — Starter Guidelines\n\nReplace this file with your documentation.\n\n## Tokens\n- Colors, typography, spacing, radii\n\n## Components\n- Atoms → Molecules → Organisms\n\n## Versioning\n- Semantic versioning; document breaking changes`;
        }
        
        // Publish loaded text for diagnostics
        (window as any).__adsmGuidelinesText = text;
        try { localStorage.setItem('adsm:guidelines:lastText', text); } catch {}
        
        const looksHtml = /^\s*</.test(text.trim());
        setHtml(looksHtml ? text : mdToHtml(text));
        setLoading(false);
        
        // Log successful load
        safeLogEvent('info', 'perf/measure', { 
          metric: 'guidelines-load-success',
          textLength: text.length,
          isHtml: looksHtml
        });
        
        // Announce to screen readers
        announceToScreenReader('Guidelines loaded successfully');
      } catch (e: any) { 
        setErr(e?.message || String(e));
        setLoading(false);
        safeLogEvent('error', 'perf/measure', { 
          metric: 'guidelines-load-error',
          error: e?.message || String(e)
        });
        announceToScreenReader(`Guidelines loading failed: ${e?.message || String(e)}`);
      } finally {
        timer();
      }
    })();
  }, [mdToHtml]);

  if (loading) {
    return (
      <div 
        style={{color:'var(--color-muted-foreground)'}}
        role="status"
        aria-live="polite"
        aria-label="Loading guidelines"
      >
        Loading guidelines…
      </div>
    );
  }

  if (err) {
    return (
      <div 
        style={{color:'var(--color-destructive)'}}
        role="alert"
        aria-live="assertive"
      >
        Failed to load guidelines: {err}
      </div>
    );
  }

  if (!html) {
    return (
      <div 
        style={{color:'var(--color-muted-foreground)'}}
        role="status"
        aria-live="polite"
      >
        No guidelines available
      </div>
    );
  }

  return (
    <article 
      style={{lineHeight: 1.6}} 
      dangerouslySetInnerHTML={{__html: html}}
      role="article"
      aria-label="Design system guidelines"
    />
  );
});

export default GuidelinesViewer;