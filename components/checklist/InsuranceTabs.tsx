import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useTaskContext } from '../TaskContext';
import InsuranceQuotes from '../vendor/InsuranceQuotes';
import InsuranceProviders from '../vendor/InsuranceProviders';
import InsuranceCalculator from '../vendor/InsuranceCalculator';
import { Shield, DollarSign, Calculator as CalcIcon, FileText } from 'lucide-react';

interface Props { onNavigate?: (page: string) => void }
export default function ChecklistInsuranceTabs({ onNavigate }: Props) {
  const [tab, setTab] = React.useState<'quotes' | 'providers' | 'calculator' | 'policies'>('quotes');
  const taskContext = useTaskContext();
  const insuranceTasks = taskContext.tasks.filter(t => t.category === 'insurance' || t.subcategory === 'insurance');
  const completed = insuranceTasks.filter(t => t.status === 'completed').length;
  const total = insuranceTasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const sections = [
    { key: 'quotes', label: 'Quotes', icon: DollarSign },
    { key: 'providers', label: 'Providers', icon: Shield },
    { key: 'calculator', label: 'Calculator', icon: CalcIcon },
    { key: 'policies', label: 'Policies', icon: FileText },
  ] as const;

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
        {tab === 'quotes' && <InsuranceQuotes />}
        {tab === 'providers' && <InsuranceProviders />}
        {tab === 'calculator' && <InsuranceCalculator />}
        {tab === 'policies' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Policies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You don't have any active policies yet. Once you select and purchase insurance, your policies will appear here.
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
