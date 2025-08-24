import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import InspectorSearch from './vendor/InspectorSearch';

const OfferBuilder = React.lazy(() => import('./OfferBuilder'));

export default function ComponentTest() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Component Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Testing if both components can load without errors...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offer Builder Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading Offer Builder...</div>}>
            <OfferBuilder />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inspector Search Test</CardTitle>
        </CardHeader>
        <CardContent>
          <InspectorSearch />
        </CardContent>
      </Card>
    </div>
  );
}
