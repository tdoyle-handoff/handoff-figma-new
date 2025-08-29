import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { LegalProgressTracker, TitleSearch, SettlementReview } from '../Legal';
import ContractAnalysis from '../ContractAnalysis';
import { Scale, FileText, Search, CheckCircle } from 'lucide-react';
import { useTaskContext, Task } from '../TaskContext';

interface Props {
  onNavigate?: (page: string) => void;
  selectedTask?: Task | null;
}
export default function ChecklistLegalTabs({ onNavigate, selectedTask }: Props) {
  const [tab, setTab] = React.useState<'progress' | 'contract' | 'title' | 'settlement'>('progress');

  // Auto-switch to relevant tab based on selected task
  React.useEffect(() => {
    if (selectedTask?.subcategory === 'legal') {
      // Map task titles/categories to appropriate tabs
      if (selectedTask.title.toLowerCase().includes('contract') || selectedTask.title.toLowerCase().includes('review')) {
        setTab('contract');
      } else if (selectedTask.title.toLowerCase().includes('title') || selectedTask.title.toLowerCase().includes('search')) {
        setTab('title');
      } else if (selectedTask.title.toLowerCase().includes('settlement') || selectedTask.title.toLowerCase().includes('closing')) {
        setTab('settlement');
      } else {
        setTab('progress');
      }
    }
  }, [selectedTask]);
  const taskContext = useTaskContext();
  const legalTasks = taskContext.tasks.filter(t => ['legal','contract','offer','closing'].includes(t.category));
  const completed = legalTasks.filter(t => t.status === 'completed').length;
  const total = legalTasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const sections: { key: typeof tab; label: string; icon: any }[] = [
    { key: 'progress', label: 'Progress', icon: Scale },
    { key: 'contract', label: 'Contract', icon: FileText },
    { key: 'title', label: 'Title', icon: Search },
    { key: 'settlement', label: 'Settlement', icon: CheckCircle },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Sidebar */}
      <div className="lg:col-span-3 space-y-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Legal Overall Completion</CardTitle>
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

      {/* Center Content */}
      <div className="lg:col-span-9 space-y-3">
        {tab === 'progress' && <LegalProgressTracker />}
        {tab === 'contract' && <ContractAnalysis />}
        {tab === 'title' && <TitleSearch />}
        {tab === 'settlement' && <SettlementReview />}
      </div>

    </div>
  );
}
