import React, { useState } from 'react';
import { Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function InfoCards() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* What to Expect Card - Now Collapsible */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <Home className="w-4 h-4 text-primary" />
              </div>
              <CardTitle>What to expect</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        {/* Always visible summary */}
        <CardContent className="pt-0">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2 text-primary">Coming Up: Home Inspection</h4>
            <p className="text-sm text-muted-foreground">
              Scheduled for <strong>January 17th at 9:00 AM</strong>. This critical step will help identify any potential issues before finalizing your purchase.
            </p>
          </div>
        </CardContent>

        {/* Collapsible detailed content */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <div>
                <h4 className="font-medium mb-2">What happens during the inspection?</h4>
                <p className="text-sm text-muted-foreground">
                  A certified home inspector will thoroughly examine the property's structure, systems, and components. 
                  This includes electrical, plumbing, HVAC, roofing, and more. The inspection typically takes 2-4 hours 
                  depending on the size and complexity of the home.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">What happens next?</h4>
                <p className="text-sm text-muted-foreground">
                  After the inspection, you'll receive a detailed report within 24-48 hours. You'll then have 5 business days to review the report and decide if you want to 
                  proceed with the purchase, negotiate repairs, or request credits. Your agent will guide you through this process and help you understand the findings.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Should I attend the inspection?</h4>
                <p className="text-sm text-muted-foreground">
                  While not required, attending the inspection is highly recommended. It's a great opportunity to learn about your future home's systems and ask the inspector questions. 
                  We'll send you a reminder 24 hours before with the inspector's contact information and meeting details.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">What if issues are found?</h4>
                <p className="text-sm text-muted-foreground">
                  Don't worry - it's normal for inspections to reveal some issues. Most are minor and can be addressed through negotiations with the seller. 
                  Your agent will help you prioritize any concerns and develop a strategy for moving forward.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}