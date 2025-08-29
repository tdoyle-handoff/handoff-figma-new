import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useTaskContext, Task } from '../TaskContext';
import InsuranceCalculator from '../vendor/InsuranceCalculator';
import { Calculator as CalcIcon, FileText, Upload, Plus, Trash2, Calendar, DollarSign } from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  provider: string;
  policyNumber: string;
  coverage: string;
  premium: number;
  deductible: number;
  startDate: string;
  endDate: string;
  notes: string;
  documentUrl?: string;
}

interface Props {
  onNavigate?: (page: string) => void;
  selectedTask?: Task | null;
}
export default function ChecklistInsuranceTabs({ onNavigate, selectedTask }: Props) {
  const [tab, setTab] = React.useState<'calculator' | 'policies'>('policies');

  // Auto-switch to relevant tab based on selected task
  React.useEffect(() => {
    if (selectedTask?.subcategory === 'insurance') {
      // Map task titles to appropriate tabs
      if (selectedTask.title.toLowerCase().includes('homeowners') || selectedTask.title.toLowerCase().includes('secure')) {
        setTab('policies');
      } else if (selectedTask.title.toLowerCase().includes('calculat') || selectedTask.title.toLowerCase().includes('quote')) {
        setTab('calculator');
      } else {
        setTab('policies');
      }
    }
  }, [selectedTask]);
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newPolicy, setNewPolicy] = React.useState<Omit<Policy, 'id'>>({
    name: '',
    provider: '',
    policyNumber: '',
    coverage: '',
    premium: 0,
    deductible: 0,
    startDate: '',
    endDate: '',
    notes: '',
    documentUrl: ''
  });
  const taskContext = useTaskContext();
  const insuranceTasks = taskContext.tasks.filter(t => t.category === 'insurance' || t.subcategory === 'insurance');
  const completed = insuranceTasks.filter(t => t.status === 'completed').length;
  const total = insuranceTasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const sections = [
    { key: 'policies', label: 'Policies', icon: FileText },
    { key: 'calculator', label: 'Calculator', icon: CalcIcon },
  ] as const;

  const handleAddPolicy = () => {
    const policy: Policy = {
      ...newPolicy,
      id: Date.now().toString()
    };
    setPolicies([...policies, policy]);
    setNewPolicy({
      name: '',
      provider: '',
      policyNumber: '',
      coverage: '',
      premium: 0,
      deductible: 0,
      startDate: '',
      endDate: '',
      notes: '',
      documentUrl: ''
    });
    setShowAddForm(false);
  };

  const handleDeletePolicy = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you'd upload to a server
      // For now, we'll just store the filename
      setNewPolicy({ ...newPolicy, documentUrl: file.name });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Sidebar */}
      <div className="lg:col-span-3 space-y-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Insurance Overall Completion</CardTitle>
                <p className="text-xs text-muted-foreground">{completed} / {total} Completed</p>
              </div>
              <div className="text-lg font-semibold">{Math.round(progress)}%</div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = tab === s.key;
            return (
              <div
                key={s.key}
                className={`border rounded-lg bg-white transition-colors ${active ? 'ring-2 ring-primary border-l-4 border-l-primary' : ''}`}
              >
                <button
                  onClick={() => setTab(s.key as typeof tab)}
                  className="w-full text-left p-3.5 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100">
                      <Icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm leading-5">{s.label}</div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Content */}
      <div className="lg:col-span-9 space-y-3">
        {tab === 'calculator' && <InsuranceCalculator />}
        {tab === 'policies' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Current Policies</CardTitle>
                <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Policy
                </Button>
              </CardHeader>
              <CardContent>
                {policies.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No policies added yet. Add your insurance policies to keep track of coverage and renewals.
                    </p>
                    <Button onClick={() => setShowAddForm(true)} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Policy
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policies.map(policy => (
                      <Card key={policy.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-lg">{policy.name}</h4>
                              <p className="text-sm text-muted-foreground">{policy.provider}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{policy.coverage}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePolicy(policy.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Policy #:</span>
                              <p className="font-medium">{policy.policyNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Premium:</span>
                              <p className="font-medium">${policy.premium.toLocaleString()}/year</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Deductible:</span>
                              <p className="font-medium">${policy.deductible.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expires:</span>
                              <p className="font-medium">{new Date(policy.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {policy.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm">{policy.notes}</p>
                            </div>
                          )}
                          {policy.documentUrl && (
                            <div className="mt-3">
                              <p className="text-sm text-blue-600">📄 {policy.documentUrl}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Policy Form */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Policy Name</Label>
                        <Input
                          id="name"
                          value={newPolicy.name}
                          onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                          placeholder="e.g., Homeowner's Insurance"
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider">Provider</Label>
                        <Input
                          id="provider"
                          value={newPolicy.provider}
                          onChange={(e) => setNewPolicy({ ...newPolicy, provider: e.target.value })}
                          placeholder="e.g., State Farm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="policyNumber">Policy Number</Label>
                        <Input
                          id="policyNumber"
                          value={newPolicy.policyNumber}
                          onChange={(e) => setNewPolicy({ ...newPolicy, policyNumber: e.target.value })}
                          placeholder="Policy number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="coverage">Coverage Type</Label>
                        <Input
                          id="coverage"
                          value={newPolicy.coverage}
                          onChange={(e) => setNewPolicy({ ...newPolicy, coverage: e.target.value })}
                          placeholder="e.g., Comprehensive"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="premium">Annual Premium ($)</Label>
                        <Input
                          id="premium"
                          type="number"
                          value={newPolicy.premium}
                          onChange={(e) => setNewPolicy({ ...newPolicy, premium: Number(e.target.value) })}
                          placeholder="2400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deductible">Deductible ($)</Label>
                        <Input
                          id="deductible"
                          type="number"
                          value={newPolicy.deductible}
                          onChange={(e) => setNewPolicy({ ...newPolicy, deductible: Number(e.target.value) })}
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newPolicy.startDate}
                          onChange={(e) => setNewPolicy({ ...newPolicy, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newPolicy.endDate}
                          onChange={(e) => setNewPolicy({ ...newPolicy, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={newPolicy.notes}
                        onChange={(e) => setNewPolicy({ ...newPolicy, notes: e.target.value })}
                        placeholder="Additional notes about this policy..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="document">Upload Policy Document (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="document"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('document')?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </Button>
                        {newPolicy.documentUrl && (
                          <span className="text-sm text-green-600">✓ {newPolicy.documentUrl}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleAddPolicy} disabled={!newPolicy.name || !newPolicy.provider}>
                        Add Policy
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
