import React from 'react';
import { loadCatalog } from '../catalog/loader';
import { openDrawer } from '../drawer/controller';

export default function ComponentsCatalog() {
  const [items, setItems] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loadResult, setLoadResult] = React.useState<any>(null);
  const [level, setLevel] = React.useState<'all'|'atom'|'molecule'|'organism'>('atom');

  React.useEffect(() => {
    loadCatalog()
      .then((result) => {
        setItems(result.components);
        setLoadResult(result);
        if (result.error) {
          setError(result.error);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load catalog');
        setItems([]);
      });
  }, []);

  if (error && (!items || items.length === 0)) {
    return (
      <section className="adsm-section">
        <h1>Components</h1>
        <div className="adsm-error" style={{ margin: '20px 0' }}>
          <strong>Error loading catalog:</strong> {error}
          <br />
          <small>Try "Reload Starter Catalog" in Diagnostics to reset.</small>
        </div>
      </section>
    );
  }

  if (!items) {
    return (
      <section className="adsm-section">
        <h1>Components</h1>
        <div className="adsm-info" style={{ margin: '20px 0' }}>
          Loading catalog…
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="adsm-section">
        <h1>Components</h1>
        <div className="adsm-info" style={{ margin: '20px 0' }}>
          No components found. Try "Reload Starter Catalog" in Diagnostics.
        </div>
      </section>
    );
  }

  const filtered = items.filter(it => level==='all' ? true : it.level===level);

  return (
    <section className="adsm-section">
      <h1>Components</h1>
      
      {/* Filter Controls */}
      <div style={{ margin: '16px 0', display: 'flex', gap: '8px' }}>
        {(['all', 'atom', 'molecule', 'organism'] as const).map(filterLevel => (
          <button
            key={filterLevel}
            onClick={() => setLevel(filterLevel)}
            className={level === filterLevel ? 'adsm-btn adsm-btn-primary' : 'adsm-btn adsm-btn-secondary'}
            style={{ textTransform: 'capitalize' }}
          >
            {filterLevel}
          </button>
        ))}
      </div>
      
      {/* Load info for development */}
      {process.env.NODE_ENV === 'development' && loadResult && (
        <div className="adsm-info" style={{ margin: '16px 0', fontSize: '14px' }}>
          <strong>Loaded from:</strong> {loadResult.loadedFrom} | 
          <strong> Count:</strong> {loadResult.count} | 
          {loadResult.url && <><strong> URL:</strong> {loadResult.url}</>}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        margin: '20px 0' 
      }}>
        {filtered.map(item => {
          const onActivate = (e: React.KeyboardEvent | React.MouseEvent) => {
            if ('key' in e) { if (e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault(); }
            openDrawer(item);
          };
          return (
          <article
            key={item.id}
            className="adsm-card"
            role="button"
            tabIndex={0}
            aria-label={`Open ${item.name}`}
            onClick={onActivate}
            onKeyDown={onActivate}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{item.name}</h3>
              <span className="adsm-chip" style={{ fontSize: '12px' }}>
                {item.level}
              </span>
              {item.status && (
                <span 
                  className="adsm-chip" 
                  style={{ 
                    fontSize: '12px',
                    background: item.status === 'ready' ? 'var(--chip-success-bg)' : 'var(--chip-warning-bg)',
                    color: item.status === 'ready' ? 'var(--chip-success-text)' : 'var(--chip-warning-text)',
                    border: `1px solid ${item.status === 'ready' ? 'var(--chip-success-border)' : 'var(--chip-warning-border)'}`
                  }}
                >
                  {item.status}
                </span>
              )}
            </div>
            
            {item.description && (
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: 'var(--color-muted-foreground)',
                lineHeight: '1.4'
              }}>
                {item.description}
              </p>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {item.tags.map((tag: string) => (
                  <span 
                    key={tag}
                    style={{
                      padding: '2px 6px',
                      fontSize: '11px',
                      background: 'var(--color-accent)',
                      color: 'var(--color-text)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--color-muted-foreground)',
              marginTop: 'auto'
            }}>
              ID: {item.id}
              {item.version && ` • v${item.version}`}
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}