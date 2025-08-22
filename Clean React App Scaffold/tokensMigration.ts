// tokensMigration.ts
export function migrateTokensToSemanticVars() {
  const root = document.documentElement.style;
  const get = (k: string) => getComputedStyle(document.documentElement).getPropertyValue(k).trim();

  // Define migrations from old token names to new semantic tokens
  const migrations: Array<[string, string]> = [
    // Input field migrations
    ['--adsm-input-bg', '--input-bg'],
    ['--adsm-input-fg', '--input-text'],
    ['--adsm-input-text', '--input-text'],
    ['--adsm-input-border', '--input-border'],
    ['--adsm-input-focus-border', '--input-focus-border'],
    ['--adsm-input-placeholder', '--input-placeholder'],
    ['--adsm-input-disabled-bg', '--input-disabled-bg'],
    ['--adsm-input-disabled-fg', '--input-disabled-text'],
    ['--adsm-input-disabled-text', '--input-disabled-text'],
    
    // Button migrations
    ['--adsm-button-primary-bg', '--button-primary-bg'],
    ['--adsm-button-primary-fg', '--button-primary-text'],
    ['--adsm-button-primary-text', '--button-primary-text'],
    ['--adsm-button-secondary-bg', '--button-secondary-bg'],
    ['--adsm-button-secondary-fg', '--button-secondary-text'],
    ['--adsm-button-secondary-text', '--button-secondary-text'],
    ['--adsm-button-secondary-border', '--button-secondary-border'],
    
    // Chip migrations
    ['--adsm-chip-bg', '--chip-bg'],
    ['--adsm-chip-fg', '--chip-text'],
    ['--adsm-chip-text', '--chip-text'],
    ['--adsm-chip-border', '--chip-border'],
    ['--adsm-chip-hover', '--chip-hover'],
    ['--adsm-chip-active', '--chip-active'],
    
    // Tab migrations
    ['--adsm-tab-active-bg', '--tab-active-bg'],
    ['--adsm-tab-active-fg', '--tab-active-fg'],
    ['--adsm-tab-inactive-bg', '--tab-inactive-bg'],
    ['--adsm-tab-inactive-fg', '--tab-inactive-fg'],
    ['--adsm-tab-hover-bg', '--tab-hover-bg'],
    
    // Card migrations
    ['--adsm-card-bg', '--card-bg'],
    ['--adsm-card-fg', '--card-text'],
    ['--adsm-card-text', '--card-text'],
    ['--adsm-card-border', '--card-border'],
    ['--adsm-card-hover', '--card-hover'],
    
    // Status message migrations
    ['--adsm-success-bg', '--success-bg'],
    ['--adsm-success-fg', '--success-text'],
    ['--adsm-success-text', '--success-text'],
    ['--adsm-success-border', '--success-border'],
    ['--adsm-warning-bg', '--warning-bg'],
    ['--adsm-warning-fg', '--warning-text'],
    ['--adsm-warning-text', '--warning-text'],
    ['--adsm-warning-border', '--warning-border'],
    ['--adsm-error-bg', '--error-bg'],
    ['--adsm-error-fg', '--error-text'],
    ['--adsm-error-text', '--error-text'],
    ['--adsm-error-border', '--error-border'],
    ['--adsm-info-bg', '--info-bg'],
    ['--adsm-info-fg', '--info-text'],
    ['--adsm-info-text', '--info-text'],
    ['--adsm-info-border', '--info-border'],
    
    // Link migrations
    ['--adsm-link-text', '--link-text'],
    ['--adsm-link-hover', '--link-hover'],
    ['--adsm-link-active', '--link-active'],
    
    // Interactive state migrations
    ['--adsm-hover-bg', '--color-hover-bg'],
    ['--adsm-active-bg', '--color-active-bg'],
    ['--adsm-disabled-bg', '--color-disabled-bg'],
    ['--adsm-disabled-text', '--color-disabled-text'],
    ['--adsm-focus-ring', '--color-focus-ring'],
    
    // Legacy core token migrations
    ['--adsm-bg', '--color-bg'],
    ['--adsm-panel', '--color-panel'],
    ['--adsm-text', '--color-text'],
    ['--adsm-muted', '--color-muted'],
    ['--adsm-accent', '--color-accent'],
    ['--adsm-border', '--color-border'],
    ['--adsm-primary', '--color-primary'],
    ['--adsm-secondary', '--color-secondary'],
    
    // Legacy spacing and radius migrations
    ['--adsm-space-4', '--space-4'],
    ['--adsm-radius-md', '--radius-md'],
    ['--adsm-font-size-base', '--font-size-base'],
  ];

  let migratedCount = 0;
  const migratedTokens: Array<{ from: string; to: string; value: string }> = [];

  // Apply migrations
  migrations.forEach(([oldKey, newKey]) => {
    const oldValue = get(oldKey);
    if (oldValue && oldValue !== '') {
      // Check if the new token is already set
      const newValue = get(newKey);
      if (!newValue || newValue === '') {
        // Only migrate if the new token is not already defined
        root.setProperty(newKey, oldValue);
        migratedCount++;
        migratedTokens.push({
          from: oldKey,
          to: newKey,
          value: oldValue
        });
      }
    }
  });

  // Log migration results if any tokens were migrated
  if (migratedCount > 0) {
    console.log(`🔄 Token Migration: Migrated ${migratedCount} legacy tokens to semantic variables:`);
    migratedTokens.forEach(({ from, to, value }) => {
      console.log(`  ${from} → ${to}: ${value}`);
    });
    
    // Dispatch custom event to notify other systems
    document.dispatchEvent(new CustomEvent('adsm:tokens:migrated', {
      detail: { count: migratedCount, migrations: migratedTokens }
    }));
    
    // Store migration info for diagnostics
    try {
      const migrationInfo = {
        timestamp: Date.now(),
        count: migratedCount,
        migrations: migratedTokens,
        version: '1.0.0'
      };
      localStorage.setItem('adsm:migration:last-run', JSON.stringify(migrationInfo));
    } catch (error) {
      console.warn('Failed to store migration info:', error);
    }
  } else {
    console.log('✅ Token Migration: No legacy tokens found, all semantic tokens are up to date');
  }

  return {
    migrated: migratedCount,
    tokens: migratedTokens
  };
}

/**
 * Check if migration has been run and return the results
 */
export function getMigrationInfo(): {
  timestamp: number;
  count: number;
  migrations: Array<{ from: string; to: string; value: string }>;
  version: string;
} | null {
  try {
    const stored = localStorage.getItem('adsm:migration:last-run');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to retrieve migration info:', error);
    return null;
  }
}

/**
 * Clear migration history (useful for testing or manual reset)
 */
export function clearMigrationHistory(): void {
  try {
    localStorage.removeItem('adsm:migration:last-run');
    console.log('🗑️ Token Migration: History cleared');
  } catch (error) {
    console.warn('Failed to clear migration history:', error);
  }
}