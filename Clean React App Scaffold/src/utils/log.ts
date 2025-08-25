export const __DEV__ = process.env.NODE_ENV !== 'production';

export function devLog(...args: any[]): void {
  if (__DEV__) console.log(...args);
}

export function devWarn(...args: any[]): void {
  if (__DEV__) console.warn(...args);
}

export function devError(...args: any[]): void {
  if (__DEV__) console.error(...args);
}

export function devGroup(label: string): void {
  if (__DEV__) console.group(label);
}

export function devGroupCollapsed(label: string): void {
  if (__DEV__) console.groupCollapsed(label);
}

export function devGroupEnd(): void {
  if (__DEV__) console.groupEnd();
}

export function devTable(data: any): void {
  if (__DEV__) console.table(data);
}

export function devInfo(...args: any[]): void {
  if (__DEV__) console.info(...args);
}

// Conditional logging function for complex scenarios
export function devLogIf(condition: boolean, ...args: any[]): void {
  if (__DEV__ && condition) console.log(...args);
}

// Timer utilities for performance debugging
export function devTime(label: string): void {
  if (__DEV__) console.time(label);
}

export function devTimeEnd(label: string): void {
  if (__DEV__) console.timeEnd(label);
}