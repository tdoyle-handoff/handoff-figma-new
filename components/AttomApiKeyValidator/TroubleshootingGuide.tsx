import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TROUBLESHOOTING_GUIDE } from './constants';

export function TroubleshootingGuide() {
  const getBorderColor = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-200';
      case 'yellow': return 'border-yellow-200';
      case 'blue': return 'border-blue-200';
      default: return 'border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Common Issues & Solutions</CardTitle>
        <CardDescription>Troubleshooting guide for ATTOM API key problems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {TROUBLESHOOTING_GUIDE.map((section, index) => (
            <div key={index} className={`border-l-4 ${getBorderColor(section.color)} pl-4`}>
              <h4 className="font-medium text-sm">{section.title}</h4>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}