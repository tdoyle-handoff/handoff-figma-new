import { Fragment } from 'react';
import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';

interface AuthTestData {
  email: string;
  password: string;
  fullName: string;
}

interface AuthTestFormProps {
  authData: AuthTestData;
  setAuthData: React.Dispatch<React.SetStateAction<AuthTestData>>;
  onRunTests: () => void;
  onClearTests: () => void;
  isRunning: boolean;
}

export function AuthTestForm({ authData, setAuthData, onRunTests, onClearTests, isRunning }: AuthTestFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Authentication Test Suite</CardTitle>
        <CardDescription>
          Test the complete authentication flow including user registration, login, and data storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="email">Test Email</Label>
            <Input
              id="email"
              type="email"
              value={authData.email}
              onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isRunning}
            />
          </div>
          <div>
            <Label htmlFor="password">Test Password</Label>
            <Input
              id="password"
              type="password"
              value={authData.password}
              onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
              disabled={isRunning}
            />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={authData.fullName}
              onChange={(e) => setAuthData(prev => ({ ...prev, fullName: e.target.value }))}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onRunTests} disabled={isRunning}>
            {isRunning ? (
              <Fragment>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </Fragment>
            ) : (
              'Run Full Test Suite'
            )}
          </Button>
          <Button variant="outline" onClick={onClearTests} disabled={isRunning}>
            Clear Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}