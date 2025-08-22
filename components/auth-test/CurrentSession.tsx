import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

interface CurrentSessionProps {
  sessionData: any;
}

export function CurrentSession({ sessionData }: CurrentSessionProps) {
  if (!sessionData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Session</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label>User Profile:</Label>
            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(sessionData.profile, null, 2)}
            </pre>
          </div>
          {sessionData.session && (
            <div>
              <Label>Session Info:</Label>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify({
                  access_token: sessionData.session.access_token ? 'Present' : 'Missing',
                  refresh_token: sessionData.session.refresh_token ? 'Present' : 'Missing',
                  expires_at: sessionData.session.expires_at,
                  user_id: sessionData.session.user?.id
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}