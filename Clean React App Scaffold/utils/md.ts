export async function loadMarkdown(path: string): Promise<string> {
  // Try real fetch first
  try {
    const res = await fetch(path + (path.includes('?') ? '&' : '?') + 'b=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      const text = await res.text();
      const looksHtml = /<html|<!doctype/i.test(text);
      // Only accept if it looks like markdown/plain text, not an SPA shell
      if (!looksHtml && (/markdown|text\/plain/i.test(ct) || !ct)) return text;
    }
  } catch {}
  // Bundler fallback: ?raw import when fetch is intercepted by SPA
  try {
    // @vite-ignore is safe in Figma Make; returns raw string
    const mod: any = await import(/* @vite-ignore */ path + (path.includes('?') ? '&' : '?') + 'raw');
    const raw = typeof mod === 'string' ? mod : (mod?.default || '');
    if (typeof raw === 'string' && raw.trim()) return raw;
  } catch {}
  return '';
}

export function mdToHtml(md: string): string {
  const esc = (s:string)=>s.replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]!));
  md = md.replace(/```([\s\S]*?)```/g,(_,c)=>`<pre><code>${esc(c)}</code></pre>`)
         .replace(/^###\s+(.+)$/gm,'<h3>$1</h3>')
         .replace(/^##\s+(.+)$/gm,'<h2>$1</h2>')
         .replace(/^#\s+(.+)$/gm,'<h1>$1</h1>')
         .replace(/^(?:- |\* )(.*)(?:\n(?!\n)(?:- |\* ).*)*/gm,b=>`<ul>`+b.split(/\n/).map(l=>l.replace(/^(?:- |\* )/,'')).map(t=>`<li>${esc(t)}</li>`).join('')+`</ul>`)
         .replace(/^(?!<h\d|<ul|<pre)([^\n][^\n]*)$/gm,'<p>$1</p>')
         .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
         .replace(/\*(.+?)\*/g,'<em>$1</em>')
         .replace(/`([^`]+)`/g,'<code>$1</code>');
  return md;
}