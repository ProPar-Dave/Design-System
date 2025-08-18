export function score(target: string, query: string): number {
  if (!query) return 0;
  target = target.toLowerCase();
  query  = query.toLowerCase();
  let ti = 0, qi = 0, run = 0, pts = 0;
  while (ti < target.length && qi < query.length) {
    if (target[ti] === query[qi]) { 
      run++; 
      pts += 2 + (target[ti] === query[0] ? 1 : 0); 
      qi++; 
    } else { 
      run = 0; 
    }
    ti++;
  }
  return qi === query.length ? pts + run : -1;
}

export function rank<T>(items: T[], pick: (x:T)=>string, q: string, limit=12): T[] {
  const scored = items.map(i=>({i, s: score(pick(i), q)})).filter(x=>x.s>=0).sort((a,b)=>b.s-a.s);
  return (q?scored:items.map(i=>({i,s:0}))).slice(0,limit).map(x=>x.i);
}