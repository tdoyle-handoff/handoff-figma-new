import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import AttorneySearch from './vendor/AttorneySearch';
import InspectorSearch from './vendor/InspectorSearch';
import InsuranceProviders from './vendor/InsuranceProviders';
import InsuranceQuotes from './vendor/InsuranceQuotes';
import InsuranceCalculator from './vendor/InsuranceCalculator';

type TabKey = 'attorneys' | 'inspectors' | 'insurance-providers' | 'insurance-quotes' | 'insurance-calculator';

type InsuranceType = 'home' | 'flood' | 'wind';

interface InsuranceQuote {
  id: string;
  providerId: string;
  providerName: string;
  type: InsuranceType;
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  coverage: {
    dwelling: number;
    personalProperty: number;
    liability: number;
    medicalPayments: number;
  };
  discounts: { name: string; amount: number }[];
  status: 'pending' | 'received' | 'selected';
  validUntil: string;
  features: string[];
}

interface InsuranceQuoteRequest {
  providerId: string;
  providerName: string;
  type: InsuranceType;
  deductible: number;
  dwellingCoverage: number;
}

interface VendorMarketplaceProps {
  defaultTab?: TabKey;
}

const INITIAL_QUOTES: InsuranceQuote[] = [
  {
    id: '1',
    providerId: '1',
    providerName: 'State Farm',
    type: 'home',
    monthlyPremium: 125,
    annualPremium: 1500,
    deductible: 1000,
    coverage: {
      dwelling: 450000,
      personalProperty: 315000,
      liability: 300000,
      medicalPayments: 5000,
    },
    discounts: [
      { name: 'Multi-policy discount', amount: 200 },
      { name: 'New home discount', amount: 150 },
    ],
    status: 'received',
    validUntil: '2025-08-14',
    features: ['Replacement cost coverage', '24/7 claims service', 'Identity theft protection'],
  },
  {
    id: '2',
    providerId: '2',
    providerName: 'Allstate',
    type: 'home',
    monthlyPremium: 142,
    annualPremium: 1704,
    deductible: 1000,
    coverage: {
      dwelling: 450000,
      personalProperty: 315000,
      liability: 300000,
      medicalPayments: 5000,
    },
    discounts: [
      { name: 'New customer discount', amount: 300 },
      { name: 'Claims-free discount', amount: 100 },
    ],
    status: 'received',
    validUntil: '2025-08-15',
    features: ['Claim satisfaction guarantee', 'New home protection', 'Green improvements coverage'],
  },
  {
    id: '3',
    providerId: '3',
    providerName: 'GEICO',
    type: 'home',
    monthlyPremium: 118,
    annualPremium: 1416,
    deductible: 1000,
    coverage: {
      dwelling: 450000,
      personalProperty: 315000,
      liability: 300000,
      medicalPayments: 5000,
    },
    discounts: [
      { name: 'Multi-policy discount', amount: 180 },
      { name: 'Security system discount', amount: 75 },
    ],
    status: 'received',
    validUntil: '2025-08-16',
    features: ['Emergency living expenses', 'Water backup coverage', 'Identity recovery'],
  },
  {
    id: '4',
    providerId: '4',
    providerName: 'Liberty Mutual',
    type: 'flood',
    monthlyPremium: 45,
    annualPremium: 540,
    deductible: 1000,
    coverage: {
      dwelling: 450000,
      personalProperty: 100000,
      liability: 0,
      medicalPayments: 0,
    },
    discounts: [
      { name: 'New policy discount', amount: 50 },
      { name: 'Flood zone discount', amount: 25 },
    ],
    status: 'received',
    validUntil: '2025-08-17',
    features: ['FEMA compliant', 'Basement coverage', 'Replacement cost'],
  },
];

export default function VendorMarketplace({ defaultTab = 'attorneys' }: VendorMarketplaceProps) {
  const [tabValue, setTabValue] = React.useState<TabKey>(defaultTab);
  const [quotes, setQuotes] = React.useState<InsuranceQuote[]>(INITIAL_QUOTES);
  const [lastRequestedType, setLastRequestedType] = React.useState<InsuranceType>('home');

  const handleRequestQuote = (req: InsuranceQuoteRequest) => {
    const newQuote: InsuranceQuote = {
      id: Date.now().toString(),
      providerId: req.providerId,
      providerName: req.providerName,
      type: req.type,
      monthlyPremium: 0,
      annualPremium: 0,
      deductible: req.deductible,
      coverage: {
        dwelling: req.dwellingCoverage,
        personalProperty: Math.round(req.dwellingCoverage * 0.7),
        liability: req.type === 'flood' ? 0 : 300000,
        medicalPayments: req.type === 'flood' ? 0 : 5000,
      },
      discounts: [],
      status: 'pending',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      features: [],
    };
    setQuotes((prev) => [...prev, newQuote]);
    setLastRequestedType(req.type);
    setTabValue('insurance-quotes');
  };

  return (
    <div className="space-y-6">
      <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as TabKey)} className="w-full">
        <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start overflow-x-auto">
          <TabsTrigger
            value="attorneys"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Attorneys
          </TabsTrigger>
          <TabsTrigger
            value="inspectors"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Inspectors
          </TabsTrigger>
          <TabsTrigger
            value="insurance-providers"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Insurance Providers
          </TabsTrigger>
          <TabsTrigger
            value="insurance-quotes"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Insurance Quotes
          </TabsTrigger>
          <TabsTrigger
            value="insurance-calculator"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Insurance Calculator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attorneys" className="space-y-6">
          <AttorneySearch />
        </TabsContent>

        <TabsContent value="inspectors" className="space-y-6">
          <InspectorSearch />
        </TabsContent>

        <TabsContent value="insurance-providers" className="space-y-6">
          <InsuranceProviders onRequestQuote={handleRequestQuote} />
        </TabsContent>

        <TabsContent value="insurance-quotes" className="space-y-6">
          <InsuranceQuotes quotes={quotes} defaultType={lastRequestedType} />
        </TabsContent>

        <TabsContent value="insurance-calculator" className="space-y-6">
          <InsuranceCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
