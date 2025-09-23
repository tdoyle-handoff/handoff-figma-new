import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useTaskContext, Task } from './TaskContext';
import { addDays, format, isSameDay, isSameWeek, parseISO, startOfWeek } from 'date-fns';
import { FileText, ExternalLink, CalendarDays, DollarSign, Clock, Search as SearchIcon } from 'lucide-react';

function parseDate(d?: string): Date | null {
  if (!d) return null;
  try {
    // Accept YYYY-MM-DD or ISO strings
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d + 'T00:00:00');
    return parseISO(d);
  } catch {
    return null;
  }
}

export default function DashboardHome() {
  const taskCtx = useTaskContext();
  const tasks: Task[] = taskCtx?.tasks || [] as Task[];
  const today = new Date();

  const withDue = tasks.filter(t => !!t.dueDate);
  const dueToday = withDue.filter(t => {
    const dt = parseDate(t.dueDate);
    return dt ? isSameDay(dt, today) : false;
  });

  const upcoming = withDue
    .filter(t => {
      const dt = parseDate(t.dueDate);
      if (!dt) return false;
      // upcoming = later in this week (after today)
      return isSameWeek(dt, today, { weekStartsOn: 1 }) && dt > today;
    })
    .sort((a,b) => (parseDate(a.dueDate)!.getTime() - parseDate(b.dueDate)!.getTime()))
    .slice(0, 5);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Contract & quick insight data
  const contractTask = tasks.find(t => t.id === 'task-submit-offer');
  const contractUrl: string | undefined = (contractTask as any)?.customFields?.contractPdfUrl || (contractTask as any)?.customFields?.attachments?.find?.((a: any) => a?.url)?.url;
  const cd: any = (contractTask as any)?.customFields?.contractDetails || {};
  const acceptance = parseDate(cd?.acceptanceDate || (taskCtx?.scheduleAnchors?.offerAcceptedDate as any));
  const closing = parseDate(cd?.closingDate || (taskCtx?.scheduleAnchors?.closingDate as any));
  const inspectionDeadline = acceptance && cd?.inspectionDays ? addDays(acceptance, parseInt(cd.inspectionDays, 10) || 0) : null;
  const financingDeadline = acceptance && cd?.financingDays ? addDays(acceptance, parseInt(cd.financingDays, 10) || 0) : null;

  // Property search quick widget
  const [qLocation, setQLocation] = React.useState('');
  const [qPriceMax, setQPriceMax] = React.useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current tasks */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-lg">Current tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-2">Today</h4>
              {dueToday.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due today.</p>
              ) : (
                <ul className="space-y-2">
                  {dueToday.map(t => (
                    <li key={t.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.status === 'completed'}
                        onChange={(e) => taskCtx.updateTaskStatus && taskCtx.updateTaskStatus(t.id, e.target.checked ? 'completed' : 'active')}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        aria-label="Mark complete"
                      />
                      <button className="text-sm text-left text-gray-900 hover:underline truncate" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: t.linkedPage || 'tasks' } }))}>
                        {t.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Upcoming</h4>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming tasks this week.</p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.map(t => (
                    <li key={t.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.status === 'completed'}
                        onChange={(e) => taskCtx.updateTaskStatus && taskCtx.updateTaskStatus(t.id, e.target.checked ? 'completed' : 'active')}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        aria-label="Mark complete"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{t.title}</div>
                        <div className="text-xs text-muted-foreground">Due {format(parseDate(t.dueDate)!, 'EEE, MMM d')}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="modern-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Calendar</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'calendar' } }))}>Month</Button>
            <Button variant="secondary" size="sm" className="h-8 px-2" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'calendar' } }))}>Week</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week strip */}
          <div className="flex items-center justify-between text-sm mb-4">
            {weekDays.map((d, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${isSameDay(d, today) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                {format(d, 'd')}
              </div>
            ))}
          </div>

          {/* Day list for today */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground">{format(today, 'd LLLL')}</div>
            {dueToday.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events for today.</p>
            ) : (
              <div className="space-y-3">
                {dueToday.map((t, idx) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-12 text-right text-sm text-muted-foreground">All day</div>
                    <div className={`flex-1 rounded-lg ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'} px-3 py-2`}>
                      <div className="text-sm font-medium truncate">{t.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract & Quick Insights */}
      <Card className="modern-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Contract & insights</CardTitle>
          <div className="flex items-center gap-2">
            {contractUrl ? (
              <Button size="sm" variant="secondary" className="h-8 px-3" onClick={() => window.open(contractUrl, '_blank')}>
                <FileText className="w-4 h-4 mr-1" /> View contract <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="h-8 px-3" onClick={() => window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'tasks' } }))}>
                Upload in checklist
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Offer accepted</div>
              <div className="font-medium">{acceptance ? format(acceptance, 'EEE, MMM d') : '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Inspection deadline</div>
              <div className="font-medium">{inspectionDeadline ? format(inspectionDeadline, 'EEE, MMM d') : '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Financing deadline</div>
              <div className="font-medium">{financingDeadline ? format(financingDeadline, 'EEE, MMM d') : '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Closing</div>
              <div className="font-medium">{closing ? format(closing, 'EEE, MMM d') : '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Purchase price</div>
              <div className="font-medium">{cd?.purchasePrice ? `$${Number(cd.purchasePrice).toLocaleString()}` : '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Earnest money</div>
              <div className="font-medium">{cd?.earnestAmount ? `$${Number(cd.earnestAmount).toLocaleString()}` : '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property search (quick) */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-lg">Property search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 h-9 px-3 rounded-md border border-gray-300 text-sm"
              placeholder="City, ZIP, or address"
              value={qLocation}
              onChange={(e) => setQLocation(e.target.value)}
            />
            <input
              className="w-40 h-9 px-3 rounded-md border border-gray-300 text-sm"
              placeholder="Max price"
              value={qPriceMax}
              onChange={(e) => setQPriceMax(e.target.value)}
            />
            <Button
              className="h-9"
              onClick={() => {
                try {
                  localStorage.setItem('handoff-quick-search', JSON.stringify({ location: qLocation, priceMax: qPriceMax }));
                } catch {}
                window.dispatchEvent(new MessageEvent('message', { data: { type: 'navigate', page: 'property' } }));
              }}
            >
              <SearchIcon className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Your inputs save locally to prefill filters on the search page.</div>
        </CardContent>
      </Card>
    </div>
  );
}
