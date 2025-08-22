import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ProjectInfoProps {
  projectId: string;
  publicAnonKey: string;
}

export function ProjectInfo({ projectId, publicAnonKey }: ProjectInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Project Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Project ID</label>
            <code className="block p-2 bg-muted rounded text-sm">{projectId}</code>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Anon Key</label>
            <code className="block p-2 bg-muted rounded text-sm break-all">
              {publicAnonKey.substring(0, 20)}...
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}