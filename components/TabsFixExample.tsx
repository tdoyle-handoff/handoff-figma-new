import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useIsMobile } from './ui/use-mobile';

// Example of how to apply mobile tab overflow fixes
export function TabsFixExample() {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue="questionnaire" className="w-full">
      <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'tab-container-multiline' : ''}`}>
        <TabsTrigger 
          value="questionnaire" 
          className={isMobile ? 'tab-multiline' : ''}
        >
          <span className={isMobile ? 'mobile-tab-text-multiline' : ''}>
            Buyer Questionnaire
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="property" 
          className={isMobile ? 'tab-multiline' : ''}
        >
          <span className={isMobile ? 'mobile-tab-text-multiline' : ''}>
            Property Input
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="questionnaire" className="space-y-4">
        {/* Questionnaire content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Buyer Questionnaire</h3>
          <p>Complete your home preferences and requirements.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="property" className="space-y-4">
        {/* Property input content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Property Details Input</h3>
          <p>Enter specific property information and details.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}