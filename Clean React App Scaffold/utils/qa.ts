// utils/qa.ts
export type RGB = { r:number; g:number; b:number };
export const clamp = (n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const hex = (n:number)=>n.toString(16).padStart(2,'0');

export function parseColor(input:string): RGB | null {
  if (!input) return null;
  
  try {
    const s = input.trim();
    
    // Simple hex parsing first
    const h = s.replace('#','');
    if (/^[0-9a-fA-F]{6}$/.test(h)) {
      return { 
        r: parseInt(h.slice(0,2), 16), 
        g: parseInt(h.slice(2,4), 16), 
        b: parseInt(h.slice(4,6), 16) 
      };
    }
    
    // Simple rgb/rgba parsing
    const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s);
    if (rgbMatch) {
      return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
    }

    // Fallback: use canvas for complex color resolution (with error handling)
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    
    ctx.fillStyle = s;
    const norm = ctx.fillStyle as string;
    const normMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(norm);
    if (normMatch) return { r: +normMatch[1], g: +normMatch[2], b: +normMatch[3] };
    
    return null;
  } catch {
    return null;
  }
}

export const rgbToHex = ({r,g,b}:RGB)=>`#${hex(r)}${hex(g)}${hex(b)}`;

export function relLuminance({r,g,b}:RGB){
  try {
    const toLin=(v:number)=>{ const c=v/255; return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4); };
    const [R,G,B]=[toLin(r),toLin(g),toLin(b)];
    return 0.2126*R+0.7152*G+0.0722*B;
  } catch {
    return 0;
  }
}

export function contrast(a:RGB,b:RGB){
  try {
    const L1 = relLuminance(a), L2 = relLuminance(b);
    const [hi,lo] = L1>=L2 ? [L1,L2] : [L2,L1];
    return (hi+0.05)/(lo+0.05);
  } catch {
    return 1;
  }
}

export function bytesUsed(): number {
  try {
    let sum = 0; 
    for (let i = 0; i < Math.min(localStorage.length, 100); i++) { // Limit iterations
      const k = localStorage.key(i);
      if (k) {
        sum += k.length + (localStorage.getItem(k)?.length || 0);
      }
    } 
    return sum;
  } catch {
    return 0;
  }
}

export function getVar(name:string){
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch {
    return '';
  }
}

export function getViewport(){ 
  try {
    return `${window.innerWidth}x${window.innerHeight}`; 
  } catch {
    return '0x0';
  }
}

// Simplified checks to prevent performance issues
export function checkFocusVisible(): boolean {
  try {
    document.querySelector(':focus-visible');
    return true;
  } catch {
    return false;
  }
}

export function checkAriaCurrentExists(): boolean {
  try {
    return !!document.querySelector('[aria-current="page"]');
  } catch {
    return false;
  }
}

export function checkScrollBackground(): { belowFoldBg: string; matchesBg: boolean } {
  try {
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
    return { 
      belowFoldBg: bodyBg, 
      matchesBg: bodyBg === htmlBg || bodyBg.includes('rgba(0, 0, 0, 0)') 
    };
  } catch {
    return { belowFoldBg: '', matchesBg: true };
  }
}

export function lintNestedButtons(): boolean {
  try {
    const nested = document.querySelectorAll('button button, a button, button a');
    return nested.length > 0;
  } catch {
    return false;
  }
}

export function contrastCheck(bgVar: string, textVar: string): boolean {
  try {
    const bg = parseColor(getVar(bgVar));
    const tx = parseColor(getVar(textVar));
    if (!bg || !tx) return false;
    return contrast(bg, tx) >= 4.5;
  } catch {
    return false;
  }
}