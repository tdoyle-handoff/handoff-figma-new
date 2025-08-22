import { Fragment } from 'react';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { Wrench, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function QuickPropertyBasicFix() {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);

  const getServerUrl = (path: string) => {
    return `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5${path}`;
  };

  const quickFixPropertyBasic = async () => {
    setIsFixing(true);
    setFixResult(null);

    try {
      // Step 1: Fix endpoint URLs
      const fixUrl = getServerUrl('/attom-admin/fix-endpoints');
      const fixResponse = await fetch(fixUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!fixResponse.ok) {
        throw new Error(`Fix endpoints failed: ${fixResponse.status}`);
      }

      const fixData = await fixResponse.json();
      console.log('Fix endpoints result:', fixData);

      // Step 2: Test the endpoint after fix
      const testUrl = getServerUrl('/attom-admin/test-endpoint');
      const testResponse = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpointId: 'property_basic_profile',
          testParams: {
            address: '11 village st, deep river, ct'
          }
        })
      });

      if (!testResponse.ok) {
        throw new Error(`Test endpoint failed: ${testResponse.status}`);
      }

      const testData = await testResponse.json();
      console.log('Test endpoint result:', testData);

      setFixResult({
        success: true,
        fixData,
        testData,
        message: testData.success ? 
          'Property-basic endpoint fixed and working correctly!' :
          `Endpoint fixed but still returning ${testData.status}: ${testData.error}`
      });

      if (testData.success) {
        toast.success('Property-basic endpoint has been fixed and is now working!');
      } else {
        toast.warning('Endpoint URLs were fixed, but there may still be API issues');
      }

    } catch (error) {
      console.error('Quick fix error:', error);
      setFixResult({
        success: false,
        error: error.message,
        message: `Quick fix failed: ${error.message}`
      });
      toast.error('Quick fix failed - check the diagnostic tool for more details');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Wrench className="w-5 h-5" />
          Quick Fix: Property-Basic 404 Error
        </CardTitle>
        <CardDescription>
          Automatically fix the common endpoint URL issue causing "The path could not be found [/property/basicprofile]" error.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={quickFixPropertyBasic}
            disabled={isFixing}
            className="flex items-center gap-2"
          >
            {isFixing ? (
              <Fragment>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying Fix...
              </Fragment>
            ) : (
              <Fragment>
                <Wrench className="w-4 h-4" />
                Fix Property-Basic Endpoint
              </Fragment>
            )}
          </Button>

          {fixResult && (
            <div className="flex items-center gap-2">
              {fixResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${fixResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {fixResult.success ? 'Fixed!' : 'Failed'}
              </span>
            </div>
          )}
        </div>

        {fixResult && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{fixResult.message}</p>
                {fixResult.fixData && (
                  <p className="text-sm text-muted-foreground">
                    Fixed {fixResult.fixData.fixedEndpoints || 0} endpoint configuration(s).
                  </p>
                )}
                {fixResult.testData && (
                  <div className="text-xs bg-muted/50 rounded p-2 mt-2">
                    <p><strong>Test Result:</strong></p>
                    <p>Status: {fixResult.testData.status}</p>
                    <p>API URL: {fixResult.testData.url}</p>
                    {fixResult.testData.error && <p>Error: {fixResult.testData.error}</p>}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Corrects endpoint URL from <code>/property/basicprofile</code> to <code>/propertyapi/v1.0.0/property/basicprofile</code></li>
            <li>Updates the configuration automatically</li>
            <li>Tests the corrected endpoint with a sample address</li>
            <li>Verifies the fix is working properly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}