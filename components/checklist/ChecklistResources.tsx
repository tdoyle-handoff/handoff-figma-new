import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { HelpCircle, FileText, DollarSign } from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
  onOpenPricing?: () => void;
}

export default function ChecklistResources({ onNavigate, onOpenPricing }: Props) {
  return (
    <div className="space-y-3">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('resources')}>
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('resources')}>
            <FileText className="w-4 h-4 mr-2" />
            Learn More About This Step
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => (onOpenPricing ? onOpenPricing() : onNavigate('resources'))}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            View Pricing & Plans
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}

