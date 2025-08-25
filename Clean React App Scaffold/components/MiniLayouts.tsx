import React, { useState, useRef, useEffect } from 'react';
import devLog from '../src/utils/devLog';
import { Card } from './molecules/Card';
import { FormGroup } from './molecules/FormGroup';
import { FieldRow } from './molecules/FieldRow';
import { Toolbar } from './molecules/Toolbar';
import { Alert } from './molecules/Alert';
import { Pagination } from './molecules/Pagination';
import { Tabset } from './molecules/Tabset';
import { Button } from './atoms/Button';
import { Input } from './atoms/Input';
import { Select } from './atoms/Select';
import { Switch } from './atoms/Switch';
import { Label } from './atoms/Label';
import { Badge } from './atoms/Badge';
import { auditLayout, exportAuditResults, type LayoutAuditResult } from '../utils/layoutAudit';

function MiniLayouts() {
  devLog('[MiniLayouts] mounted');
  const [auditResults, setAuditResults] = useState<LayoutAuditResult[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    username: 'john.doe',
    role: 'admin',
    notifications: true,
    theme: 'dark'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [auditInProgress, setAuditInProgress] = useState(false);
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Run comprehensive audits
  const runAudits = () => {
    setAuditInProgress(true);
    
    setTimeout(() => {
      const results: LayoutAuditResult[] = [];
      
      if (settingsRef.current) {
        results.push(auditLayout('Settings Form', settingsRef.current));
      }
      if (toolbarRef.current) {
        results.push(auditLayout('Data Table Toolbar', toolbarRef.current));
      }
      if (tabsRef.current) {
        results.push(auditLayout('Tabbed Details', tabsRef.current));
      }
      
      setAuditResults(results);
      setAuditInProgress(false);
    }, 1000);
  };

  // Export audit results
  const handleExportAudit = () => {
    if (auditResults.length === 0) return;
    
    const exportData = exportAuditResults(auditResults);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Auto-run audits on mount
  useEffect(() => {
    const timer = setTimeout(runAudits, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveSettings = () => {
    console.log('Saving settings:', formData);
  };

  const handleDataExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      console.log('Data export completed');
    }, 2000);
  };

  const tabContent = {
    overview: (
      <div className="space-y-4">
        <h3>Project Overview</h3>
        <p>This project contains 45 components with 89% test coverage.</p>
        <div className="flex gap-2">
          <Badge tone="success">Active</Badge>
          <Badge tone="info">Production</Badge>
        </div>
      </div>
    ),
    activity: (
      <div className="space-y-4">
        <h3>Recent Activity</h3>
        <div className="space-y-2">
          <div className="text-sm">Updated Button component - 2 hours ago</div>
          <div className="text-sm">Added new TextField variant - 1 day ago</div>
          <div className="text-sm">Released v2.1.0 - 3 days ago</div>
        </div>
      </div>
    ),
    settings: (
      <div className="space-y-4">
        <h3>Project Settings</h3>
        <FormGroup title="Configuration" description="Manage project configuration settings">
          <FieldRow
            label="Project Name"
            control="input"
            controlProps={{
              id: "project-name",
              value: "Design System v2",
              onChange: () => {}
            }}
          />
          <FieldRow
            label="Build Target"
            control="select"
            controlProps={{
              id: "build-target",
              value: "production",
              onChange: () => {},
              options: [
                { value: 'development', label: 'Development' },
                { value: 'staging', label: 'Staging' },
                { value: 'production', label: 'Production' }
              ]
            }}
          />
          <FieldRow
            label="Auto Deploy"
            control="switch"
            controlProps={{
              id: "auto-deploy",
              checked: true,
              onChange: () => {}
            }}
          />
        </FormGroup>
      </div>
    )
  };

  return (
    <div className="content space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Mini Layouts Demo</h1>
          <p>Demonstrating realistic atom→molecule composition patterns with comprehensive accessibility and contrast auditing.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={runAudits}
            disabled={auditInProgress}
          >
            {auditInProgress ? 'Auditing...' : 'Run Audit'}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleExportAudit}
            disabled={auditResults.length === 0}
          >
            Export Results
          </Button>
        </div>
      </div>

      {/* Audit Results Dashboard */}
      {auditResults.length > 0 && (
        <section className="space-y-4">
          <h2>Audit Results Dashboard</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center p-4">
                <div className="text-2xl font-bold">
                  {(auditResults.reduce((sum, r) => sum + r.score, 0) / auditResults.length).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
            </Card>
            <Card>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">
                  {auditResults.filter(r => r.contrastResults.every(c => c.aa)).length}
                </div>
                <div className="text-sm text-muted-foreground">AA Compliant</div>
              </div>
            </Card>
            <Card>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {auditResults.filter(r => r.contrastResults.every(c => c.aaa)).length}
                </div>
                <div className="text-sm text-muted-foreground">AAA Compliant</div>
              </div>
            </Card>
            <Card>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {auditResults.reduce((sum, r) => sum + r.violations.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Issues</div>
              </div>
            </Card>
          </div>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {auditResults.map((result) => (
              <Card key={result.name}>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{result.name}</h3>
                    <Badge tone={result.score >= 90 ? 'success' : result.score >= 70 ? 'warning' : 'danger'}>
                      {result.score}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Elements:</span>
                      <span>{result.schema.elements}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interactive:</span>
                      <span>{result.schema.interactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pattern:</span>
                      <span className="text-right">{result.schema.composition.pattern}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Contrast Results</div>
                    {result.contrastResults.map((contrast, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <Badge tone={contrast.aa ? 'success' : 'danger'} size="sm">
                          {contrast.aa ? 'AA ✓' : 'AA ✗'}
                        </Badge>
                        <Badge tone={contrast.aaa ? 'success' : 'warning'} size="sm">
                          {contrast.aaa ? 'AAA ✓' : 'AAA ?'}
                        </Badge>
                        <span className="text-muted-foreground">{contrast.ratio.toFixed(1)}:1</span>
                      </div>
                    ))}
                  </div>

                  {result.violations.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-destructive">Issues</div>
                      <ul className="text-xs space-y-1">
                        {result.violations.map((violation, index) => (
                          <li key={index} className="text-muted-foreground">• {violation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Layout 1: Settings Form */}
      <section ref={settingsRef} className="space-y-4">
        <h2>1. Settings Form Layout</h2>
        <p className="text-muted-foreground">
          Composition: Card → FormGroup → FieldRows → (Input, Select, Switch) + Toolbar → Buttons
        </p>
        <Card>
          <div className="space-y-6">
            <FormGroup 
              title="User Settings" 
              description="Manage your account preferences and notification settings"
            >
              <FieldRow
                label="Username"
                control="input"
                controlProps={{
                  id: "username",
                  value: formData.username,
                  onChange: (e) => setFormData(prev => ({ ...prev, username: e.target.value })),
                  placeholder: "Enter username"
                }}
              />
              
              <FieldRow
                label="Role"
                control="select"
                controlProps={{
                  id: "role",
                  value: formData.role,
                  onChange: (value) => setFormData(prev => ({ ...prev, role: value })),
                  options: [
                    { value: 'viewer', label: 'Viewer' },
                    { value: 'editor', label: 'Editor' },
                    { value: 'admin', label: 'Administrator' }
                  ]
                }}
              />
              
              <FieldRow
                label="Email Notifications"
                control="switch"
                controlProps={{
                  id: "notifications",
                  checked: formData.notifications,
                  onChange: (checked) => setFormData(prev => ({ ...prev, notifications: checked }))
                }}
              />
              
              <FieldRow
                label="Theme Preference"
                control="select"
                controlProps={{
                  id: "theme-select",
                  value: formData.theme,
                  onChange: (value) => setFormData(prev => ({ ...prev, theme: value })),
                  options: [
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'System' }
                  ]
                }}
              />
            </FormGroup>
            
            <Toolbar>
              <Button variant="primary" onClick={handleSaveSettings}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => console.log('Cancel')}>
                Cancel
              </Button>
            </Toolbar>
          </div>
        </Card>
      </section>

      {/* Layout 2: Data Table Toolbar */}
      <section ref={toolbarRef} className="space-y-4">
        <h2>2. Data Table Toolbar Layout</h2>
        <p className="text-muted-foreground">
          Composition: Toolbar → Buttons + Alert (info variant) + Pagination
        </p>
        <div className="space-y-4">
          <Toolbar>
            <Button variant="secondary" onClick={() => console.log('Filter')}>
              Filter
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleDataExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </Toolbar>
          
          <Alert 
            variant="info" 
            title="Data Status"
            description="Showing 127 records from the last 30 days. Data is updated every 5 minutes."
          />
          
          <Pagination 
            currentPage={currentPage}
            totalPages={12}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>

      {/* Layout 3: Tabbed Details */}
      <section ref={tabsRef} className="space-y-4">
        <h2>3. Tabbed Details Layout</h2>
        <p className="text-muted-foreground">
          Composition: Card → Tabset → FormGroup → FieldRows (nested composition)
        </p>
        <Card>
          <Tabset
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: 'Activity' },
              { id: 'settings', label: 'Settings' }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {tabContent[activeTab as keyof typeof tabContent]}
          </Tabset>
        </Card>
      </section>

      {/* Technical Documentation */}
      <section className="space-y-4">
        <h2>Technical Implementation</h2>
        <Card>
          <div className="p-6 space-y-6">
            <div>
              <h3>Composition Patterns Demonstrated</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li>• <strong>Settings Form:</strong> Hierarchical composition with Card containing FormGroup containing multiple FieldRows, each with atomic components (Input, Select, Switch) paired with Labels, plus a Toolbar with action Buttons</li>
                <li>• <strong>Data Toolbar:</strong> Flat composition with Toolbar containing Buttons, standalone Alert for status messaging, and Pagination for navigation</li>
                <li>• <strong>Tabbed Details:</strong> Nested composition with Card containing Tabset, where tab content includes recursive FormGroup patterns</li>
              </ul>
            </div>
            
            <div>
              <h3>Accessibility Features Implemented</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li>• <strong>Keyboard Navigation:</strong> All interactive elements are keyboard accessible with visible focus indicators</li>
                <li>• <strong>Screen Reader Support:</strong> Proper ARIA labels, descriptions, and semantic HTML structure</li>
                <li>• <strong>Form Associations:</strong> Labels properly associated with form controls using htmlFor/id relationships</li>
                <li>• <strong>Status Announcements:</strong> Loading states and dynamic changes announced to assistive technology</li>
                <li>• <strong>Focus Management:</strong> Logical tab order and focus restoration in dynamic content</li>
              </ul>
            </div>
            
            <div>
              <h3>Design Token Integration</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li>• <strong>Color System:</strong> All components use semantic color tokens (primary, secondary, muted, etc.)</li>
                <li>• <strong>Spacing Scale:</strong> Consistent spacing using token-based gap, padding, and margin utilities</li>
                <li>• <strong>Typography:</strong> Font sizes, weights, and line heights from the token system</li>
                <li>• <strong>Theme Support:</strong> Automatic light/dark theme switching through CSS custom properties</li>
                <li>• <strong>Interactive States:</strong> Hover, focus, active, and disabled states use token-based styling</li>
              </ul>
            </div>

            <div>
              <h3>Quality Metrics</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li>• <strong>Contrast Compliance:</strong> All text meets WCAG AA standards (4.5:1 ratio minimum)</li>
                <li>• <strong>Touch Targets:</strong> Interactive elements meet 44px minimum size requirement</li>
                <li>• <strong>Component Reuse:</strong> Zero custom CSS - all styling through atomic components and tokens</li>
                <li>• <strong>Performance:</strong> Lightweight composition with minimal DOM overhead</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default MiniLayouts;