import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Code, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  FileText,
  MessageSquare,
  Users,
  ShoppingCart,
  Share,
  PenTool,
  Wrench,
  Info,
  AlertTriangle
} from 'lucide-react';

interface UIToggleConfig {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'documents' | 'communication' | 'other';
  enabled: boolean;
  icon: React.ElementType;
  affectedComponents: string[];
  devOnly?: boolean;
}

interface ConfigCategory {
  name: string;
  description: string;
  icon: React.ElementType;
}

const categories: Record<string, ConfigCategory> = {
  navigation: {
    name: 'Navigation',
    description: 'Main navigation menu items and sidebar elements',
    icon: Settings
  },
  documents: {
    name: 'Documents',
    description: 'Document tabs, features, and related functionality',
    icon: FileText
  },
  communication: {
    name: 'Communication',
    description: 'Chat, messaging, and collaboration features',
    icon: MessageSquare
  },
  other: {
    name: 'Other Features',
    description: 'Miscellaneous UI elements and features',
    icon: Wrench
  }
};

export default function DeveloperConfig() {
  const [config, setConfig] = useState<UIToggleConfig[]>([
    // Navigation items
    {
      id: 'nav-vendor-marketplace',
      name: 'Vendor Marketplace Tab',
      description: 'Access to vendor marketplace functionality',
      category: 'navigation',
      enabled: false,
      icon: ShoppingCart,
      affectedComponents: ['DashboardLayout.tsx']
    },
    {
      id: 'nav-communications',
      name: 'Communications Tab',
      description: 'Main communications and messaging section',
      category: 'navigation',
      enabled: false,
      icon: MessageSquare,
      affectedComponents: ['DashboardLayout.tsx']
    },
    {
      id: 'nav-my-team',
      name: 'My Team Tab',
      description: 'Team management and collaboration features',
      category: 'navigation',
      enabled: false,
      icon: Users,
      affectedComponents: ['DashboardLayout.tsx']
    },

    // Document features
    {
      id: 'doc-shared-tab',
      name: 'Shared Documents Tab',
      description: 'View and manage documents shared with other parties',
      category: 'documents',
      enabled: false,
      icon: Share,
      affectedComponents: ['Documents.tsx']
    },
    {
      id: 'doc-signatures-tab',
      name: 'Signatures Needed Tab',
      description: 'Documents requiring electronic signatures',
      category: 'documents',
      enabled: false,
      icon: PenTool,
      affectedComponents: ['Documents.tsx']
    },
    {
      id: 'doc-templates-tab',
      name: 'Document Templates Tab',
      description: 'Pre-built document templates for real estate transactions',
      category: 'documents',
      enabled: true,
      icon: FileText,
      affectedComponents: ['Documents.tsx']
    },

    // Communication features
    {
      id: 'comm-new-message-btn',
      name: 'New Message Button',
      description: 'Button to compose new messages in communications',
      category: 'communication',
      enabled: true,
      icon: MessageSquare,
      affectedComponents: ['Communications.tsx']
    },

    // Other features
    {
      id: 'dev-config-access',
      name: 'Developer Configuration Access',
      description: 'Access to this developer configuration panel',
      category: 'other',
      enabled: true,
      icon: Code,
      affectedComponents: ['DashboardLayout.tsx'],
      devOnly: true
    }
  ]);

  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load configuration from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('handoff-dev-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        const savedTime = localStorage.getItem('handoff-dev-config-saved');
        if (savedTime) {
          setLastSaved(new Date(savedTime));
        }
      } catch (error) {
        console.error('Failed to load developer configuration:', error);
      }
    }
  }, []);

  // Handle toggle change
  const handleToggle = (id: string, enabled: boolean) => {
    setConfig(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled } : item
      )
    );
    setHasChanges(true);
  };

  // Save configuration
  const saveConfiguration = () => {
    localStorage.setItem('handoff-dev-config', JSON.stringify(config));
    localStorage.setItem('handoff-dev-config-saved', new Date().toISOString());
    setHasChanges(false);
    setLastSaved(new Date());
    
    // In a real implementation, this would trigger updates to the affected components
    alert('Configuration saved! Refresh the page to see changes.');
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Reset all configurations to default values? This cannot be undone.')) {
      setConfig(prev => 
        prev.map(item => ({
          ...item,
          enabled: item.id === 'doc-templates-tab' || item.id === 'comm-new-message-btn' || item.id === 'dev-config-access'
        }))
      );
      setHasChanges(true);
    }
  };

  // Export configuration
  const exportConfiguration = () => {
    const configData = {
      config,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `handoff-dev-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import configuration
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const imported = JSON.parse(result);
        
        if (imported.config && Array.isArray(imported.config)) {
          setConfig(imported.config);
          setHasChanges(true);
          alert('Configuration imported successfully!');
        } else {
          alert('Invalid configuration file format.');
        }
      } catch (error) {
        alert('Failed to import configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const groupedConfig = config.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, UIToggleConfig[]>);

  const enabledCount = config.filter(item => item.enabled).length;
  const totalCount = config.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-600" />
            Developer Configuration
          </h1>
          <p className="text-gray-600 mt-1">
            Configure UI elements and features visibility
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hasChanges ? "destructive" : "secondary"}>
            {hasChanges ? 'Unsaved Changes' : 'Saved'}
          </Badge>
          <Badge variant="outline">
            {enabledCount}/{totalCount} Features Enabled
          </Badge>
        </div>
      </div>

      {/* Developer Warning */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Developer Mode:</strong> This page is only visible to developers. Changes made here will affect the UI for all users. Use caution when modifying these settings.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={saveConfiguration}
          disabled={!hasChanges}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </Button>
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
        <Button 
          variant="outline" 
          onClick={exportConfiguration}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export Config
        </Button>
        <label>
          <Button variant="outline" asChild className="gap-2">
            <span>
              <Upload className="w-4 h-4" />
              Import Config
            </span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={importConfiguration}
            className="hidden"
          />
        </label>
      </div>

      {lastSaved && (
        <p className="text-sm text-gray-500">
          Last saved: {lastSaved.toLocaleString()}
        </p>
      )}

      {/* Configuration Tabs */}
      <Tabs defaultValue="navigation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon;
            const categoryCount = groupedConfig[key]?.length || 0;
            const enabledInCategory = groupedConfig[key]?.filter(item => item.enabled).length || 0;
            
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <Badge variant="outline" className="text-xs">
                  {enabledInCategory}/{categoryCount}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(categories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {category.description}
            </div>

            <div className="grid gap-4">
              {groupedConfig[key]?.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Card key={item.id} className={`transition-all ${item.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${item.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Icon className={`w-5 h-5 ${item.enabled ? 'text-green-600' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{item.name}</CardTitle>
                              {item.devOnly && (
                                <Badge variant="secondary" className="text-xs">Dev Only</Badge>
                              )}
                              {item.enabled ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              {item.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={(checked) => handleToggle(item.id, checked)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-gray-500">
                        <strong>Affected Files:</strong> {item.affectedComponents.join(', ')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Implementation Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>How it works:</strong> This configuration is stored in localStorage and would need to be integrated with the actual components to take effect.
          </p>
          <p>
            <strong>Production Use:</strong> In a real application, these settings would be stored in a database and synchronized across the application.
          </p>
          <p>
            <strong>Component Integration:</strong> Each component would check these settings and conditionally render UI elements based on the configuration.
          </p>
          <p>
            <strong>Access Control:</strong> This page should only be accessible to users with developer or admin permissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
