import React from 'react';
import { User, Bell, PlugZap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../hooks/useAuth';

interface SettingsProps {
  onSignOut?: () => void;
  setupData?: { buyerEmail: string; buyerName: string } | null;
  onNavigate?: (page: string) => void;
}

export default function Settings({ setupData }: SettingsProps) {
  const { userProfile, isGuestMode, updateUserProfile } = useAuth();
  const [active, setActive] = React.useState<'account'|'notifications'|'integrations'>('account');
  const [savedMessage, setSavedMessage] = React.useState('');

  // Account state
  const [account, setAccount] = React.useState({
    name: setupData?.buyerName || userProfile?.full_name || '',
    email: setupData?.buyerEmail || userProfile?.email || '',
  });

  // Notification preferences (persisted in profile.preferences.notifications)
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: true,
    taskReminders: true,
    deadlineAlerts: true,
    overdueTasks: true,
    financingDeadlines: true,
    contractMilestones: true,
  });

  React.useEffect(() => {
    try {
      const fromProfile = (userProfile as any)?.preferences?.notifications;
      if (fromProfile && typeof fromProfile === 'object') {
        setNotifications(prev => ({ ...prev, ...fromProfile }));
      }
    } catch {}
  }, [userProfile]);

  // Integrations (local persistence only)
  const [integrations, setIntegrations] = React.useState({
    googleCalendar: false,
    slack: true,
    drive: false,
    docusign: true,
  });

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('handoff-integrations');
      if (raw) setIntegrations({ ...integrations, ...JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAccount = async () => {
    try {
      const next = { full_name: account.name, email: account.email } as any;
      if (userProfile && !isGuestMode && typeof updateUserProfile === 'function') {
        await updateUserProfile(next);
      } else {
        const raw = localStorage.getItem('handoff-user-profile');
        const prev = raw ? JSON.parse(raw) : {};
        localStorage.setItem('handoff-user-profile', JSON.stringify({ ...prev, ...next }));
      }
      setSavedMessage('Account saved');
      setTimeout(() => setSavedMessage(''), 2500);
    } catch (e) {
      setSavedMessage('Failed to save account');
      setTimeout(() => setSavedMessage(''), 2500);
    }
  };

  const saveNotifications = async () => {
    try {
      try {
        const raw = localStorage.getItem('handoff-user-profile');
        const prev = raw ? JSON.parse(raw) : {};
        const next = { ...prev, preferences: { ...(prev.preferences||{}), notifications } };
        localStorage.setItem('handoff-user-profile', JSON.stringify(next));
      } catch {}
      if (userProfile && !isGuestMode && typeof updateUserProfile === 'function') {
        await updateUserProfile({ preferences: { ...(userProfile as any).preferences, notifications } as any });
      }
      setSavedMessage('Notifications saved');
      setTimeout(() => setSavedMessage(''), 2500);
    } catch {
      setSavedMessage('Failed to save notifications');
      setTimeout(() => setSavedMessage(''), 2500);
    }
  };

  const saveIntegrations = () => {
    try {
      localStorage.setItem('handoff-integrations', JSON.stringify(integrations));
      setSavedMessage('Integrations saved');
      setTimeout(() => setSavedMessage(''), 2500);
    } catch {
      setSavedMessage('Failed to save integrations');
      setTimeout(() => setSavedMessage(''), 2500);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-[220px_1fr] h-full">
        <aside className="border-r p-4">
          <div className="px-2 pb-3">
            <div className="text-sm font-semibold">Settings</div>
            <div className="text-xs text-muted-foreground">Manage your account</div>
          </div>
          <Tabs value={active} onValueChange={(v)=>setActive(v as any)} className="h-full">
            <TabsList className="flex flex-col gap-1 bg-transparent p-0 h-auto">
              <TabsTrigger value="account" className="justify-start gap-2 data-[state=active]:bg-slate-100">
                <User className="h-4 w-4" /> Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start gap-2 data-[state=active]:bg-slate-100">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="integrations" className="justify-start gap-2 data-[state=active]:bg-slate-100">
                <PlugZap className="h-4 w-4" /> Integrations
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </aside>

        <section className="p-6 overflow-auto">
          {savedMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{savedMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs value={active} onValueChange={(v)=>setActive(v as any)}>
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input value={account.name} onChange={(e)=>setAccount(a=>({ ...a, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input type="email" value={account.email} onChange={(e)=>setAccount(a=>({ ...a, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveAccount}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email notifications</div>
                      <div className="text-sm text-muted-foreground">Receive updates via email</div>
                    </div>
                    <Switch checked={notifications.email} onCheckedChange={(v)=>setNotifications(n=>({ ...n, email: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Push notifications</div>
                      <div className="text-sm text-muted-foreground">In-app alerts and messages</div>
                    </div>
                    <Switch checked={notifications.push} onCheckedChange={(v)=>setNotifications(n=>({ ...n, push: v }))} />
                  </div>
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Overdue tasks</div>
                      <div className="text-sm text-muted-foreground">Alert when tasks pass due dates</div>
                    </div>
                    <Switch checked={notifications.overdueTasks} onCheckedChange={(v)=>setNotifications(n=>({ ...n, overdueTasks: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Financing deadlines</div>
                      <div className="text-sm text-muted-foreground">Mortgage and funding dates</div>
                    </div>
                    <Switch checked={notifications.financingDeadlines} onCheckedChange={(v)=>setNotifications(n=>({ ...n, financingDeadlines: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Contract milestones</div>
                      <div className="text-sm text-muted-foreground">Key legal and closing steps</div>
                    </div>
                    <Switch checked={notifications.contractMilestones} onCheckedChange={(v)=>setNotifications(n=>({ ...n, contractMilestones: v }))} />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={saveNotifications}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Google Calendar</div>
                      <div className="text-sm text-muted-foreground">Create and sync events</div>
                    </div>
                    <Switch checked={integrations.googleCalendar} onCheckedChange={(v)=>setIntegrations(i=>({ ...i, googleCalendar: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Slack</div>
                      <div className="text-sm text-muted-foreground">Team alerts and updates</div>
                    </div>
                    <Switch checked={integrations.slack} onCheckedChange={(v)=>setIntegrations(i=>({ ...i, slack: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Google Drive</div>
                      <div className="text-sm text-muted-foreground">Store and share docs</div>
                    </div>
                    <Switch checked={integrations.drive} onCheckedChange={(v)=>setIntegrations(i=>({ ...i, drive: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">DocuSign</div>
                      <div className="text-sm text-muted-foreground">E-sign your contracts</div>
                    </div>
                    <Switch checked={integrations.docusign} onCheckedChange={(v)=>setIntegrations(i=>({ ...i, docusign: v }))} />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={saveIntegrations}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
