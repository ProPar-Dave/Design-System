import React from 'react';
import { Button } from '../atoms/Button';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
  className?: string;
}

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    page, 
    pageCount, 
    onChange, 
    showFirstLast = true, 
    showPageNumbers = true, 
    maxPageNumbers = 5,
    className = '',
    ...props 
  }, ref) => {
    
    // Layout styles using only tokens
    const containerStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-xs, 8px)',
      padding: 'var(--space-md, 16px)',
      flexWrap: 'wrap' as const,
    };

    const infoStyles = {
      fontSize: 'var(--font-size-sm, 14px)',
      color: 'var(--color-muted-foreground)',
      fontWeight: 'var(--font-weight-normal)',
      margin: '0 var(--space-sm, 12px)',
      whiteSpace: 'nowrap' as const,
    };

    // Calculate page numbers to show
    const getVisiblePages = () => {
      if (pageCount <= maxPageNumbers) {
        return Array.from({ length: pageCount }, (_, i) => i + 1);
      }

      const half = Math.floor(maxPageNumbers / 2);
      let start = Math.max(1, page - half);
      let end = Math.min(pageCount, start + maxPageNumbers - 1);

      if (end - start + 1 < maxPageNumbers) {
        start = Math.max(1, end - maxPageNumbers + 1);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = showPageNumbers ? getVisiblePages() : [];
    const canGoPrevious = page > 1;
    const canGoNext = page < pageCount;

    if (pageCount <= 1) {
      return null;
    }

    return (
      <nav
        ref={ref}
        className={`molecule-pagination ${className}`}
        style={containerStyles}
        data-molecule="pagination"
        data-current-page={page}
        data-page-count={pageCount}
        role="navigation"
        aria-label="Pagination"
        {...props}
      >
        {showFirstLast && (
          <Button
            variant="secondary"
            size="sm"
            disabled={!canGoPrevious}
            onClick={() => onChange(1)}
            aria-label="Go to first page"
          >
            ««
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onChange(page - 1)}
          aria-label="Go to previous page"
        >
          ‹ Previous
        </Button>

        {showPageNumbers && (
          <>
            {visiblePages[0] > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(1)}
                  aria-label="Go to page 1"
                >
                  1
                </Button>
                {visiblePages[0] > 2 && (
                  <span style={infoStyles}>…</span>
                )}
              </>
            )}

            {visiblePages.map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onChange(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                aria-current={pageNum === page ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            ))}

            {visiblePages[visiblePages.length - 1] < pageCount && (
              <>
                {visiblePages[visiblePages.length - 1] < pageCount - 1 && (
                  <span style={infoStyles}>…</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(pageCount)}
                  aria-label={`Go to page ${pageCount}`}
                >
                  {pageCount}
                </Button>
              </>
            )}
          </>
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onChange(page + 1)}
          aria-label="Go to next page"
        >
          Next ›
        </Button>

        {showFirstLast && (
          <Button
            variant="secondary"
            size="sm"
            disabled={!canGoNext}
            onClick={() => onChange(pageCount)}
            aria-label="Go to last page"
          >
            »»
          </Button>
        )}

        <div style={infoStyles} aria-live="polite">
          Page {page} of {pageCount}
        </div>
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

// Component metadata for catalog
export const PaginationMeta = {
  name: 'Pagination',
  category: 'molecules',
  description: 'A navigation component for moving between pages of content',
  composedFrom: ['Button'],
  tokens: {
    layout: ['--space-xs', '--space-sm', '--space-md'],
    colors: ['--color-muted-foreground'],
    typography: ['--font-size-sm', '--font-weight-normal'],
  },
  variants: {
    showFirstLast: {
      type: 'boolean',
      default: true,
    },
    showPageNumbers: {
      type: 'boolean',
      default: true,
    },
    maxPageNumbers: {
      type: 'number',
      default: 5,
    },
  },
  examples: {
    basic: {
      page: 3,
      pageCount: 10,
      onChange: () => {},
    },
    minimal: {
      page: 2,
      pageCount: 5,
      showFirstLast: false,
      onChange: () => {},
    },
    noPageNumbers: {
      page: 1,
      pageCount: 100,
      showPageNumbers: false,
      onChange: () => {},
    },
    manyPages: {
      page: 25,
      pageCount: 100,
      maxPageNumbers: 7,
      onChange: () => {},
    },
  },
};