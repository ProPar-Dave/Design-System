/**
 * devLog – tiny helper to avoid console noise in production.
 * Usage: devLog('something', data)
 */
export function devLog(...args: unknown[]) {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export default devLog;