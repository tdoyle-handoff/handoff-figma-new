import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Search, ClipboardCheck, AlertTriangle, FileText, Home, Plus, Upload, Download, Calendar, Clock, Phone, DollarSign } from 'lucide-react';
import { DownloadButton } from '../ui/download-button';
import { useTaskContext, Task } from '../TaskContext';
import { useInspectionStore, Inspection } from '../InspectionContext';

interface Props {
  onNavigate?: (page: string) => void;
  selectedTask?: Task | null;
}
export default function ChecklistInspectionTabs({ onNavigate, selectedTask }: Props) {
  const [tab, setTab] = useState<'scheduled' | 'results' | 'negotiations'>('scheduled');

  // Auto-switch to relevant tab based on selected task
  useEffect(() => {
    if (selectedTask?.subcategory === 'inspections') {
      // Map task titles to appropriate tabs
      if (selectedTask.title.toLowerCase().includes('schedule') || selectedTask.title.toLowerCase().includes('home inspection')) {
        setTab('scheduled');
      } else if (selectedTask.title.toLowerCase().includes('report') || selectedTask.title.toLowerCase().includes('result')) {
        setTab('results');
      } else if (selectedTask.title.toLowerCase().includes('negotiat') || selectedTask.title.toLowerCase().includes('repair')) {
        setTab('negotiations');
      } else {
        setTab('scheduled');
      }
    }
  }, [selectedTask]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadedReports, setUploadedReports] = useState<{[key: string]: {file: string, summary: string, uploadDate: string}}>({});
  const taskContext = useTaskContext();
  const inspTasks = taskContext.getActiveTasksByCategory('inspections');
  const total = taskContext.tasks.filter(t => t.category === 'inspections').length;
  const completed = taskContext.tasks.filter(t => t.category === 'inspections' && t.status === 'completed').length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const { inspections, setInspections } = useInspectionStore();

  // Form state for new inspection
  const [newInspection, setNewInspection] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    inspector: '',
    company: '',
    phone: '',
    cost: '',
    duration: '',
    description: ''
  });

  const sections = [
    { key: 'scheduled', label: 'Scheduled', icon: ClipboardCheck },
    { key: 'results', label: 'Results & Reports', icon: FileText },
    { key: 'negotiations', label: 'Negotiations', icon: Home },
  ] as const;

  const handleAddInspection = () => {
    if (!newInspection.title || !newInspection.date) return;

    const inspection: Inspection = {
      id: `custom-${Date.now()}`,
      title: newInspection.title,
      type: newInspection.type || 'other',
      status: 'scheduled',
      date: newInspection.date,
      time: newInspection.time,
      inspector: newInspection.inspector,
      company: newInspection.company,
      phone: newInspection.phone,
      cost: newInspection.cost,
      duration: newInspection.duration,
      description: newInspection.description
    };

    setInspections(prev => [...prev, inspection]);
    setNewInspection({
      title: '',
      type: '',
      date: '',
      time: '',
      inspector: '',
      company: '',
      phone: '',
      cost: '',
      duration: '',
      description: ''
    });
    setShowAddDialog(false);
  };

  const handleFileUpload = (inspectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Generate a summary based on the inspection's existing issues or create a default summary
    const inspection = inspections.find(i => i.id === inspectionId);
    let summary = 'Inspection report uploaded. ';
    if (inspection?.issues && inspection.issues.length > 0) {
      const highIssues = inspection.issues.filter(i => i.severity === 'high').length;
      const mediumIssues = inspection.issues.filter(i => i.severity === 'medium').length;
      const lowIssues = inspection.issues.filter(i => i.severity === 'low').length;

      summary += `Found ${inspection.issues.length} total issues: `;
      if (highIssues > 0) summary += `${highIssues} high priority, `;
      if (mediumIssues > 0) summary += `${mediumIssues} medium priority, `;
      if (lowIssues > 0) summary += `${lowIssues} low priority`;
      summary = summary.replace(/, $/, '');
    } else {
      summary += 'No major issues identified.';
    }

    setUploadedReports(prev => ({
      ...prev,
      [inspectionId]: {
        file: file.name,
        summary,
        uploadDate: new Date().toISOString()
      }
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-3 space-y-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Inspections Overall Completion</CardTitle>
                <CardDescription>{completed} / {total} Completed</CardDescription>
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
                  onClick={() => setTab(s.key)}
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

      <div className="lg:col-span-9 space-y-3">
        {tab === 'scheduled' && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Scheduled Inspections</CardTitle>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Inspection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white shadow-xl border border-gray-200">
                    <DialogHeader>
                      <DialogTitle>Schedule New Inspection</DialogTitle>
                      <DialogDescription>
                        Add a new inspection to your schedule
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="col-span-2">
                        <Label htmlFor="title">Inspection Title *</Label>
                        <Input
                          id="title"
                          value={newInspection.title}
                          onChange={(e) => setNewInspection(prev => ({...prev, title: e.target.value}))}
                          placeholder="e.g., Roof Inspection, Pool Inspection"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={newInspection.type} onValueChange={(value) => setNewInspection(prev => ({...prev, type: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Home</SelectItem>
                            <SelectItem value="roof">Roof</SelectItem>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="hvac">HVAC</SelectItem>
                            <SelectItem value="pool">Pool/Spa</SelectItem>
                            <SelectItem value="termite">Termite</SelectItem>
                            <SelectItem value="radon">Radon</SelectItem>
                            <SelectItem value="mold">Mold</SelectItem>
                            <SelectItem value="septic">Septic</SelectItem>
                            <SelectItem value="well">Well Water</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newInspection.date}
                          onChange={(e) => setNewInspection(prev => ({...prev, date: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newInspection.time}
                          onChange={(e) => setNewInspection(prev => ({...prev, time: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={newInspection.duration}
                          onChange={(e) => setNewInspection(prev => ({...prev, duration: e.target.value}))}
                          placeholder="e.g., 2-3 hours"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inspector">Inspector Name</Label>
                        <Input
                          id="inspector"
                          value={newInspection.inspector}
                          onChange={(e) => setNewInspection(prev => ({...prev, inspector: e.target.value}))}
                          placeholder="Inspector's name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={newInspection.company}
                          onChange={(e) => setNewInspection(prev => ({...prev, company: e.target.value}))}
                          placeholder="Inspection company"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newInspection.phone}
                          onChange={(e) => setNewInspection(prev => ({...prev, phone: e.target.value}))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cost">Cost</Label>
                        <Input
                          id="cost"
                          value={newInspection.cost}
                          onChange={(e) => setNewInspection(prev => ({...prev, cost: e.target.value}))}
                          placeholder="$450"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newInspection.description}
                          onChange={(e) => setNewInspection(prev => ({...prev, description: e.target.value}))}
                          placeholder="Brief description of what will be inspected"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddInspection} disabled={!newInspection.title || !newInspection.date}>
                        Schedule Inspection
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {inspections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No inspections scheduled yet</p>
                  <p className="text-sm">Click "Add Inspection" to schedule your first inspection</p>
                </div>
              ) : (
                inspections.map((inspection) => (
                  <div key={inspection.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{inspection.title}</h4>
                          <Badge variant={inspection.status === 'completed' ? 'default' : inspection.status === 'scheduled' ? 'secondary' : 'outline'}>
                            {inspection.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {inspection.date ? new Date(inspection.date).toLocaleDateString() : 'TBD'}
                          </div>
                          {inspection.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {inspection.time}
                            </div>
                          )}
                          {inspection.duration && (
                            <div>Duration: {inspection.duration}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div>{inspection.inspector} • {inspection.company}</div>
                          {inspection.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {inspection.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {inspection.cost && (
                          <div className="text-sm font-medium">
                            {inspection.cost.startsWith('$') ? inspection.cost : `$${inspection.cost}`}
                          </div>
                        )}
                      </div>
                    </div>
                    {inspection.description && (
                      <p className="text-sm text-muted-foreground border-t pt-3">
                        {inspection.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
        {tab === 'results' && (
          <div className="space-y-4">
            {/* Inspection Reports */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Inspection Reports</CardTitle>
                <CardDescription>Upload and view inspection reports with automated summaries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inspections.filter(i => i.status === 'completed' || i.status === 'scheduled').map((inspection) => (
                  <div key={inspection.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{inspection.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {inspection.status === 'completed' ? 'Completed' : 'Scheduled'} on {new Date(inspection.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!uploadedReports[inspection.id] ? (
                          <>
                            <input
                              type="file"
                              id={`file-${inspection.id}`}
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => handleFileUpload(inspection.id, e)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => document.getElementById(`file-${inspection.id}`)?.click()}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Upload Report
                            </Button>
                          </>
                        ) : (
                          <DownloadButton
                            size="sm"
                            variant="dark-rect"
                            onDownload={() => {
                              console.log('Downloading report:', uploadedReports[inspection.id].file);
                            }}
                          >
                            {uploadedReports[inspection.id].file}
                          </DownloadButton>
                        )}
                      </div>
                    </div>

                    {uploadedReports[inspection.id] && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <h5 className="font-medium text-sm text-blue-900 mb-1">Report Summary</h5>
                        <p className="text-sm text-blue-800">{uploadedReports[inspection.id].summary}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Uploaded on {new Date(uploadedReports[inspection.id].uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {inspection.issues && inspection.issues.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Issues Found ({inspection.issues.length})</h5>
                        <div className="space-y-2">
                          {inspection.issues.map((issue) => (
                            <div key={issue.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{issue.issue}</span>
                                  <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                                    {issue.severity}
                                  </Badge>
                                  <Badge variant="outline">{issue.category}</Badge>
                                </div>
                                <span className="text-sm font-medium">{issue.cost}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                              <p className="text-sm text-blue-700"><strong>Recommendation:</strong> {issue.recommendation}</p>
                              {issue.resolution && (
                                <p className="text-sm text-green-700 mt-1"><strong>Resolution:</strong> {issue.resolution}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!inspection.issues || inspection.issues.length === 0) && inspection.status === 'completed' && (
                      <div className="text-center py-4 text-green-600">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          ✓
                        </div>
                        <p className="text-sm font-medium">No issues found</p>
                        <p className="text-xs text-muted-foreground">This inspection passed without any concerns</p>
                      </div>
                    )}
                  </div>
                ))}

                {inspections.filter(i => i.status === 'completed' || i.status === 'scheduled').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No inspection reports available</p>
                    <p className="text-sm">Complete inspections will appear here for report upload</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {tab === 'negotiations' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Issue Negotiations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(inspections[0]?.issues || []).map((issue: any) => (
                <div key={issue.id} className="p-3 border rounded-lg flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{issue.issue}</div>
                    <div className="text-xs text-muted-foreground">{issue.recommendation}</div>
                  </div>
                  <span className="text-xs capitalize">{issue.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
}
