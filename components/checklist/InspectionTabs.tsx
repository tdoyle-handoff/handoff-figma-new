import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Search, ClipboardCheck, AlertTriangle, FileText, Home } from 'lucide-react';
import { useTaskContext } from '../TaskContext';
import { useInspectionStore } from '../InspectionContext';

interface Props { onNavigate?: (page: string) => void }
export default function ChecklistInspectionTabs({ onNavigate }: Props) {
  const [tab, setTab] = React.useState<'scheduled' | 'results' | 'negotiations' | 'reports'>('scheduled');
  const taskContext = useTaskContext();
  const inspTasks = taskContext.getActiveTasksByCategory('inspections');
  const total = taskContext.tasks.filter(t => t.category === 'inspections').length;
  const completed = taskContext.tasks.filter(t => t.category === 'inspections' && t.status === 'completed').length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const { inspections } = useInspectionStore();

  const sections = [
    { key: 'scheduled', label: 'Scheduled', icon: ClipboardCheck },
    { key: 'results', label: 'Results', icon: AlertTriangle },
    { key: 'negotiations', label: 'Negotiations', icon: Home },
    { key: 'reports', label: 'Reports', icon: FileText },
  ] as const;

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
            <CardContent className="p-6 space-y-4">
              {inspections.map((inspection) => (
                <div key={inspection.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{inspection.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {inspection.date ? new Date(inspection.date).toLocaleDateString() : 'TBD'} {inspection.time && `at ${inspection.time}`}
                    </div>
                    <div className="text-xs text-muted-foreground">{inspection.inspector} • {inspection.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs">{inspection.status}</div>
                    <div className="text-xs">{inspection.cost}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {tab === 'results' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Inspection Results Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inspections[0]?.issues?.map((issue: any) => (
                <div key={issue.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{issue.issue}</div>
                    <span className="text-xs text-muted-foreground">{issue.cost}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{issue.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>
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
        {tab === 'reports' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Inspection Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inspections.filter(i => i.status === 'completed').map((i) => (
                <div key={i.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{i.title} Report</div>
                    <div className="text-xs text-muted-foreground">Completed on {new Date(i.date).toLocaleDateString()}</div>
                  </div>
                  <Button size="sm" variant="outline">Download</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
}

