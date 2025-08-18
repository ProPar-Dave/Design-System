import * as React from 'react';

export type PropKind = 'text' | 'number' | 'boolean' | 'select';
export type PropOption = { label: string; value: any };
export type PropSpec = { kind: PropKind; label?: string; options?: PropOption[]; min?: number; max?: number; step?: number };

export function PropsEditor({
  id,
  schema = {},
  defaults = {},
  value,
  onChange,
}: {
  id?: string;
  schema?: Record<string, PropSpec>;
  defaults?: Record<string, any>;
  value?: Record<string, any>;
  onChange?: (next: Record<string, any>) => void;
}) {
  const [local, setLocal] = React.useState<Record<string, any>>({ ...defaults, ...value });

  React.useEffect(() => {
    setLocal(prev => ({ ...prev, ...value }));
  }, [JSON.stringify(value)]);

  const set = (k: string, v: any) => {
    const next = { ...local, [k]: v };
    setLocal(next);
    onChange?.(next);
  };

  const reset = () => {
    const next = { ...defaults };
    setLocal(next);
    onChange?.(next);
  };

  const entries = Object.entries(schema as Record<string, PropSpec>);
  if (!entries.length) return <div className="adsm-props-empty">No editable props.</div>;

  return (
    <div className="adsm-props">
      {entries.map(([k, spec]) => {
        const label = spec.label ?? k;
        const val = local[k] ?? defaults[k] ?? '';
        switch (spec.kind) {
          case 'text':
            return (
              <label key={k} className="adsm-row">
                <span>{label}</span>
                <input className="adsm-input" value={val} onChange={(e) => set(k, e.target.value)} />
              </label>
            );
          case 'number':
            return (
              <label key={k} className="adsm-row">
                <span>{label}</span>
                <input
                  className="adsm-input"
                  type="number"
                  value={Number(val) || 0}
                  min={spec.min}
                  max={spec.max}
                  step={spec.step}
                  onChange={(e) => set(k, Number(e.target.value))}
                />
              </label>
            );
          case 'boolean':
            return (
              <label key={k} className="adsm-row">
                <span>{label}</span>
                <input type="checkbox" checked={!!val} onChange={(e) => set(k, e.target.checked)} />
              </label>
            );
          case 'select':
            return (
              <label key={k} className="adsm-row">
                <span>{label}</span>
                <select
                  className="adsm-select"
                  value={val}
                  onChange={(e) => set(k, e.target.value)}
                >
                  {(spec.options || []).map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          default:
            return (
              <label key={k} className="adsm-row">
                <span>{label}</span>
                <input className="adsm-input" value={String(val ?? '')} onChange={(e) => set(k, e.target.value)} />
              </label>
            );
        }
      })}

      <div className="adsm-actions">
        <button className="adsm-btn" type="button" onClick={reset}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}