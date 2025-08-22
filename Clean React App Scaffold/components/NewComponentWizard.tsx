import * as React from 'react';
import type { DsComponent, Level, Status } from '../utils/catalog';
import { safeLogEvent } from '../diagnostics/logger';

interface NewComponentWizardProps {
  onClose: () => void;
  onCreate: (component: DsComponent) => void;
}

export function NewComponentWizard({ onClose, onCreate }: NewComponentWizardProps) {
  const [form, setForm] = React.useState({
    id: '',
    name: '',
    level: 'atom' as Level,
    version: '0.1.0',
    status: 'draft' as Status,
    tags: '',
    dependencies: '',
    description: '',
    notes: ''
  });
  const [err, setErr] = React.useState('');

  const onChange = (field: string, value: string) => {
    const previousValue = form[field as keyof typeof form];
    setForm(prev => ({ ...prev, [field]: value }));
    if (err) setErr(''); // Clear error when user starts typing
    
    // Enhanced logging for component field changes, especially tags
    if (field === 'tags') {
      const previousTags = typeof previousValue === 'string' ? previousValue.split(',').map(t => t.trim()).filter(Boolean) : [];
      const newTags = value.split(',').map(t => t.trim()).filter(Boolean);
      
      const tagsChangeData = {
        event: 'component_tags_change',
        component: {
          id: form.id || 'new-component',
          name: form.name || 'untitled'
        },
        tags: {
          previous: previousTags,
          new: newTags,
          added: newTags.filter(tag => !previousTags.includes(tag)),
          removed: previousTags.filter(tag => !newTags.includes(tag))
        },
        context: {
          wizard: 'create-component',
          timestamp: Date.now(),
          sessionId: sessionStorage.getItem('adsm:session-id') || 'unknown'
        }
      };
      
      safeLogEvent('info', 'components/tags-change', tagsChangeData);
    }
    
    // Log other significant field changes
    if (['level', 'status', 'dependencies'].includes(field)) {
      safeLogEvent('info', 'components/field-change', {
        event: 'component_field_change',
        component: {
          id: form.id || 'new-component',
          name: form.name || 'untitled'
        },
        field,
        previousValue,
        newValue: value,
        context: {
          wizard: 'create-component',
          timestamp: Date.now()
        }
      });
    }
  };

  const handleSubmit = () => {
    try {
      // Validation
      if (!form.id.trim()) throw new Error('ID is required');
      if (!form.id.match(/^[a-z][a-z0-9-]*$/)) throw new Error('ID must be kebab-case (a-z, 0-9, -)');
      if (!form.name.trim()) throw new Error('Name is required');

      // Create component object
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const dependencies = form.dependencies.split(',').map(d => d.trim()).filter(Boolean);
      
      const component: DsComponent = {
        id: form.id.trim(),
        name: form.name.trim(),
        level: form.level,
        version: form.version,
        status: form.status,
        tags,
        dependencies,
        description: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined
      };

      // Enhanced component creation logging
      const creationData = {
        event: 'component_created',
        component: {
          id: component.id,
          name: component.name,
          level: component.level,
          status: component.status,
          version: component.version,
          tagCount: tags.length,
          dependencyCount: dependencies.length,
          hasDescription: !!component.description,
          hasNotes: !!component.notes
        },
        tags: {
          list: tags,
          categories: tags.map(tag => {
            // Categorize common tag types
            if (['action', 'interactive', 'clickable'].includes(tag)) return 'interaction';
            if (['form', 'input', 'field'].includes(tag)) return 'form';
            if (['layout', 'grid', 'flex'].includes(tag)) return 'layout';
            if (['navigation', 'nav', 'menu'].includes(tag)) return 'navigation';
            return 'general';
          })
        },
        dependencies: {
          list: dependencies,
          count: dependencies.length
        },
        context: {
          wizard: 'create-component',
          timestamp: Date.now(),
          sessionId: sessionStorage.getItem('adsm:session-id') || 'unknown',
          userAgent: navigator.userAgent
        },
        validation: {
          passed: true,
          idFormat: 'kebab-case',
          requiredFields: ['id', 'name']
        }
      };
      
      safeLogEvent('info', 'components/create', creationData);

      onCreate(component);
    } catch (e: any) {
      // Log creation errors
      safeLogEvent('error', 'components/create-error', {
        event: 'component_creation_failed',
        error: e.message || String(e),
        form: {
          id: form.id,
          name: form.name,
          level: form.level,
          status: form.status
        },
        timestamp: Date.now()
      });
      
      setErr(e.message || String(e));
    }
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="wizard-title" 
      onClick={onClose}
      className="adsm-modal-overlay"
    >
      <div 
        onClick={e => e.stopPropagation()} 
        className="adsm-modal-content"
        style={{
          width: 'min(580px, 90vw)',
          maxHeight: '90vh',
          background: 'var(--modal-content-bg)',
          border: '2px solid var(--modal-content-border)',
          padding: 0,
          overflow: 'auto'
        }}
      >
        <div className="adsm-modal-header">
          <h2 id="wizard-title" className="adsm-modal-title">
            Create New Component
          </h2>
          <p className="adsm-modal-description">
            Add a new component to your design system catalog
          </p>
        </div>
        
        <div className="adsm-modal-body">
          {err && (
            <div className="adsm-modal-error">
              <div className="adsm-modal-error-title">Validation Error</div>
              <div className="adsm-modal-error-text">{err}</div>
            </div>
          )}

          <div style={{ display: 'grid', gap: '20px' }}>
            <div className="adsm-modal-field">
              <label className="adsm-modal-label" htmlFor="component-id">
                ID *
              </label>
              <input
                id="component-id"
                value={form.id}
                onChange={e => onChange('id', e.target.value)}
                placeholder="search-bar"
                className="adsm-modal-input"
                aria-describedby="id-help"
                aria-required="true"
              />
              <div id="id-help" className="adsm-modal-field-help">
                Use kebab-case: lowercase letters, numbers, and hyphens only
              </div>
            </div>

            <div className="adsm-modal-field">
              <label className="adsm-modal-label" htmlFor="component-name">
                Name *
              </label>
              <input
                id="component-name"
                value={form.name}
                onChange={e => onChange('name', e.target.value)}
                placeholder="Search Bar"
                className="adsm-modal-input"
                aria-required="true"
              />
            </div>

            <div className="adsm-modal-field">
              <label className="adsm-modal-label" htmlFor="component-level">
                Level
              </label>
              <select
                id="component-level"
                value={form.level}
                onChange={e => onChange('level', e.target.value)}
                className="adsm-modal-select"
                aria-describedby="level-help"
              >
                <option value="atom">Atom</option>
                <option value="molecule">Molecule</option>
                <option value="organism">Organism</option>
              </select>
              <div id="level-help" className="adsm-modal-field-help">
                Atomic design hierarchy: Atoms → Molecules → Organisms
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div className="adsm-modal-field">
                <label className="adsm-modal-label" htmlFor="component-version">
                  Version
                </label>
                <input
                  id="component-version"
                  value={form.version}
                  onChange={e => onChange('version', e.target.value)}
                  placeholder="0.1.0"
                  className="adsm-modal-input"
                  aria-describedby="version-help"
                />
                <div id="version-help" className="adsm-modal-field-help">
                  Semantic versioning (e.g. 1.0.0)
                </div>
              </div>

              <div className="adsm-modal-field">
                <label className="adsm-modal-label" htmlFor="component-status">
                  Status
                </label>
                <select
                  id="component-status"
                  value={form.status}
                  onChange={e => onChange('status', e.target.value)}
                  className="adsm-modal-select"
                >
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                </select>
              </div>
            </div>

            <div className="adsm-modal-field">
              <label className="adsm-modal-label" htmlFor="component-tags">
                Tags
              </label>
              <input
                id="component-tags"
                value={form.tags}
                onChange={e => onChange('tags', e.target.value)}
                placeholder="search, form, input"
                className="adsm-modal-input"
                aria-describedby="tags-help"
              />
              <div id="tags-help" className="adsm-modal-field-help">
                Comma-separated keywords for categorization and search
              </div>
            </div>

            <div className="adsm-modal-field">
              <label className="adsm-modal-label" htmlFor="component-dependencies">
                Dependencies
              </label>
              <input
                id="component-dependencies"
                value={form.dependencies}
                onChange={e => onChange('dependencies', e.target.value)}
                placeholder="button, input"
                className="adsm-modal-input"
                aria-describedby="dependencies-help"
              />
              <div id="dependencies-help" className="adsm-modal-field-help">
                Comma-separated component IDs that this component depends on
              </div>
            </div>

            <div className="adsm-modal-field">
              <label className="adsm-modal-label" htmlFor="component-description">
                Description
              </label>
              <textarea
                id="component-description"
                value={form.description}
                onChange={e => onChange('description', e.target.value)}
                placeholder="Brief description of the component..."
                rows={3}
                className="adsm-modal-textarea"
                aria-describedby="description-help"
              />
              <div id="description-help" className="adsm-modal-field-help">
                Optional brief description of what this component does
              </div>
            </div>

            <div className="adsm-modal-field">
              <label className="adsm-modal-label" htmlFor="component-notes">
                Notes
              </label>
              <textarea
                id="component-notes"
                value={form.notes}
                onChange={e => onChange('notes', e.target.value)}
                placeholder="Additional notes, implementation details..."
                rows={2}
                className="adsm-modal-textarea"
                aria-describedby="notes-help"
              />
              <div id="notes-help" className="adsm-modal-field-help">
                Optional implementation notes or additional details
              </div>
            </div>
          </div>
        </div>

        <div className="adsm-modal-footer">
          <button onClick={onClose} className="adsm-modal-button-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="adsm-modal-button-primary">
            Create Component
          </button>
        </div>
      </div>
    </div>
  );
}

