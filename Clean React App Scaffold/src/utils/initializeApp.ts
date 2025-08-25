import { devLog } from './log';
import { initializeApp as originalInitializeApp } from '../../utils/appInitialization';

export async function initializeApp(): Promise<{ ms: number }> {
  const t0 = performance.now();
  
  devLog('[boot] Starting application initialization...');
  
  try {
    // Run the existing initialization logic
    await originalInitializeApp();
    
    const ms = performance.now() - t0;
    devLog('[boot] complete in', Math.round(ms), 'ms');
    
    return { ms };
  } catch (error) {
    const ms = performance.now() - t0;
    devLog('[boot] failed after', Math.round(ms), 'ms:', error);
    throw error;
  }
}