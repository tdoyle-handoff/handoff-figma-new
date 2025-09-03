import React from 'react'
import ModernAdminLayout, { SectionItem } from '../layout/ModernAdminLayout'
import SectionNav from './SectionNav'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Eye, GripVertical, Pencil, Plus, Settings2, Trash } from 'lucide-react'

// Demo page that mirrors the screenshot's Registration UI
export default function RegistrationDemo() {
  const [active, setActive] = React.useState<'setup' | 'general' | 'speakers' | 'agenda' | 'registration' | 'landing'>('registration')

  const sections: SectionItem[] = [
    { key: 'setup', label: 'Setup', icon: Settings2 },
    { key: 'general', label: 'General' },
    { key: 'speakers', label: 'Speakers' },
    { key: 'agenda', label: 'Agenda' },
    { key: 'registration', label: 'Registration' },
    { key: 'landing', label: 'Landing page' },
  ]

  return (
    <ModernAdminLayout
      title="Registration"
      sections={sections}
      activeSectionKey={active}
      onSectionChange={(k) => setActive(k as typeof active)}
      actions={
        <>
          <Button variant="secondary" size="sm">
            <Eye className="w-4 h-4 mr-1" /> Preview form
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header toggle and meta */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Registration form</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Enable</span>
                <Switch defaultChecked />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">If enabled, attendees need to complete this form in order to join your event.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4">
              <div>
                <Label className="mb-1 block">Form name</Label>
                <Input defaultValue="New Event Registration Form" />
              </div>
              <div>
                <Label className="mb-1 block">Form description</Label>
                <Textarea rows={3} placeholder="We're so excited that you want to join! Please tell us a little more about yourself." />
              </div>
              <div>
                <Label className="mb-1 block">Register button label</Label>
                <Input defaultValue="Register" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fields table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Form fields</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">6</Badge>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add field</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 items-center bg-muted px-3 py-2 text-xs text-muted-foreground border-b">
                <div className="col-span-7">Form field</div>
                <div className="col-span-2 text-center">Required</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {[
                { key: 'name', label: 'Name', required: true },
                { key: 'email', label: 'Email', required: true },
                { key: 'city', label: 'City', required: false },
                { key: 'website', label: 'Website', required: false },
                { key: 'twitter', label: 'Twitter', required: false },
              ].map((row) => (
                <div key={row.key} className="grid grid-cols-12 items-center px-3 py-2 border-b last:border-b-0 bg-white">
                  <div className="col-span-7 flex items-center gap-2 text-sm">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span>{row.label}</span>
                    {row.required && <Badge variant="secondary" className="ml-1">required</Badge>}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Checkbox checked={row.required} readOnly />
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="secondary" size="sm"><Trash className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernAdminLayout>
  )
}

