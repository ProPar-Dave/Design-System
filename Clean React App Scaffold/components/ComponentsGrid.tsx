import React from 'react';
import type { DsComponent } from '../utils/catalog';
import { aaChipColors, getCurrentThemeTokens } from '../utils/ui';
import { loadThumb, generateDevPlaceholder } from '../utils/snapshot';

interface ComponentsGridProps {
  items: DsComponent[];
  onItemClick?: (id: string, buttonRef?: HTMLElement) => void;
}

function ComponentCard({ item, onItemClick }: { 
  item: DsComponent; 
  onItemClick?: (id: string, buttonRef?: HTMLElement) => void; 
}) {
  const buttonRef = React.useRef<HTMLElement>(null);
  
  // Safe item access with fallbacks
  const safeItem = {
    id: item?.id || 'unknown',
    name: item?.name || 'Untitled Component',
    level: item?.level || 'atom',
    version: item?.version || '1.0.0',
    status: item?.status || 'draft',
    tags: Array.isArray(item?.tags) ? item.tags : [],
    dependencies: Array.isArray(item?.dependencies) ? item.dependencies : [],
    propsSpec: Array.isArray(item?.propsSpec) ? item.propsSpec : [],
    notes: item?.notes || '',
    description: item?.description || ''
  };

  // Load thumbnail from localStorage with error handling and development fallback
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    try {
      let thumb = loadThumb(safeItem.id);
      
      // Validate that it's a valid data URL
      if (thumb && thumb.startsWith('data:image/')) {
        setThumbnail(thumb);
      } else {
        // In development, generate a placeholder for better UX
        const isDevelopment = process.env.NODE_ENV === 'development' || 
                             location.hostname === 'localhost' || 
                             location.hostname === '127.0.0.1' ||
                             location.port !== '';
        
        if (isDevelopment) {
          thumb = generateDevPlaceholder(safeItem.id);
          setThumbnail(thumb);
        } else {
          setThumbnail(null);
        }
      }
    } catch (error) {
      console.warn('Failed to load thumbnail for', safeItem.id, error);
      setThumbnail(null);
    }
  }, [safeItem.id]);

  const levelIcons: Record<string, string> = {
    atom: '⚛',
    molecule: 'M',
    organism: 'O'
  };

  const statusColors: Record<string, string> = {
    ready: '#10B981',
    draft: '#F59E0B'
  };

  const handleClick = React.useCallback(() => {
    onItemClick?.(safeItem.id, buttonRef.current || undefined);
  }, [safeItem.id, onItemClick]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <article 
      className="component-card"
      role="button"
      tabIndex={0}
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${safeItem.name} component details`}
      style={{
        width: '100%',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        textAlign: 'left'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.2)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
        {/* Thumbnail Preview */}
        {thumbnail && (
          <div style={{
            width: '100%',
            height: '120px',
            marginBottom: '12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={thumbnail} 
              alt={`Preview of ${safeItem.name}`}
              onError={(e) => {
                // Hide thumbnail if image fails to load
                const container = e.currentTarget.parentElement;
                if (container) {
                  container.style.display = 'none';
                }
              }}
              onLoad={(e) => {
                // Ensure thumbnail container is visible when image loads successfully
                const container = e.currentTarget.parentElement;
                if (container) {
                  container.style.display = 'flex';
                }
              }}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '6px'
              }}
            />
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>
              {levelIcons[safeItem.level] || '⚛'}
            </span>
            <h3 style={{ 
              margin: 0, 
              color: 'var(--color-text)',
              fontSize: '16px',
              fontWeight: 600
            }}>
              {safeItem.name}
            </h3>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusColors[safeItem.status] || statusColors.draft
            }}></span>
            <span style={{
              fontSize: '12px',
              color: 'var(--color-muted)',
              textTransform: 'capitalize'
            }}>
              {safeItem.status}
            </span>
          </div>
        </div>

        {/* Version and metrics */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          fontSize: '12px',
          color: 'var(--color-muted)'
        }}>
          <span>v{safeItem.version}</span>
          {safeItem.dependencies.length > 0 && (
            <span>Deps: {safeItem.dependencies.length}</span>
          )}
          {safeItem.propsSpec.length > 0 && (
            <span>Props: {safeItem.propsSpec.length}</span>
          )}
          <span style={{ textTransform: 'capitalize' }}>
            {safeItem.level}
          </span>
        </div>

        {/* Description/Notes preview */}
        {(safeItem.description || safeItem.notes) && (
          <p style={{
            margin: '0 0 12px',
            color: 'var(--color-muted)',
            fontSize: '14px',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {safeItem.description || safeItem.notes}
          </p>
        )}

        {/* Tags with AA contrast */}
        {safeItem.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            {safeItem.tags.map((tag, index) => {
              const tokens = getCurrentThemeTokens();
              const chipStyle = aaChipColors(tokens.panel, tokens.text);
              
              return (
                <span 
                  key={`${tag}-${index}`} 
                  className={chipStyle.className}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px'
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}
    </article>
  );
}

export function ComponentsGrid({ items, onItemClick }: ComponentsGridProps) {
  // Safe array handling
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (safeItems.length === 0) {
    return (
      <div style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '200px',
        color: 'var(--color-muted)',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>□</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>No components found</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Components will appear here when they're available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="components-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        // Ensure grid doesn't shift when drawer opens
        marginRight: '0',
        transition: 'margin-right 0.2s ease'
      }}
    >
      {safeItems.map((item) => (
        <ComponentCard
          key={item?.id || Math.random()}
          item={item}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}