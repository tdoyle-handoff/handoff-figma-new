import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ApiKeyValidationResult } from './helpers';

interface RecommendationsProps {
  validationResult: ApiKeyValidationResult | null;
}

export function Recommendations({ validationResult }: RecommendationsProps) {
  if (!validationResult?.recommendations || validationResult.recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recommendations</CardTitle>
        <CardDescription>
          {validationResult.success ? 'Your API key is working correctly' : 'Steps to resolve the issue'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {validationResult.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                validationResult.success ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}