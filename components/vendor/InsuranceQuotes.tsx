import React, { useEffect, useMemo, useState } from 'react';
import { Shield, Clock, FileText, Home, Waves, Wind } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { statusToBadgeVariant } from '../lib/badgeVariants';
import { Button } from '../ui/button';

interface InsuranceQuote {
  id: string;
  providerId: string;
  providerName: string;
  type: 'home' | 'flood' | 'wind';
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  coverage: {
    dwelling: number;
    personalProperty: number;
    liability: number;
    medicalPayments: number;
  };
  discounts: {
    name: string;
    amount: number;
  }[];
  status: 'pending' | 'received' | 'selected';
  validUntil: string;
  features: string[];
}

const INSURANCE_TYPES = [
  { value: 'home', label: 'Homeowners Insurance', icon: Home, required: true },
  { value: 'flood', label: 'Flood Insurance', icon: Waves, required: false },
  { value: 'wind', label: 'Wind/Hurricane Insurance', icon: Wind, required: false }
] as const;

type InsuranceTypeValue = (typeof INSURANCE_TYPES)[number]['value'];

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
      medicalPayments: 5000
    },
    discounts: [
      { name: 'Multi-policy discount', amount: 200 },
      { name: 'New home discount', amount: 150 }
    ],
    status: 'received',
    validUntil: '2025-08-14',
    features: ['Replacement cost coverage', '24/7 claims service', 'Identity theft protection']
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
      medicalPayments: 5000
    },
    discounts: [
      { name: 'New customer discount', amount: 300 },
      { name: 'Claims-free discount', amount: 100 }
    ],
    status: 'received',
    validUntil: '2025-08-15',
    features: ['Claim satisfaction guarantee', 'New home protection', 'Green improvements coverage']
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
      medicalPayments: 5000
    },
    discounts: [
      { name: 'Multi-policy discount', amount: 180 },
      { name: 'Security system discount', amount: 75 }
    ],
    status: 'received',
    validUntil: '2025-08-16',
    features: ['Emergency living expenses', 'Water backup coverage', 'Identity recovery']
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
      medicalPayments: 0
    },
    discounts: [
      { name: 'New policy discount', amount: 50 },
      { name: 'Flood zone discount', amount: 25 }
    ],
    status: 'received',
    validUntil: '2025-08-17',
    features: ['FEMA compliant', 'Basement coverage', 'Replacement cost']
  }
];

interface InsuranceQuotesProps {
  quotes?: InsuranceQuote[];
  defaultType?: InsuranceTypeValue;
}

export default function InsuranceQuotes({ quotes: quotesProp, defaultType = 'home' }: InsuranceQuotesProps) {
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<InsuranceTypeValue>(defaultType);
  const quotes = quotesProp ?? INITIAL_QUOTES;

  useEffect(() => {
    setSelectedInsuranceType(defaultType);
  }, [defaultType]);

  // shared helper mapping to badge variants
  const quoteStatusToVariant = (status: string) => statusToBadgeVariant(status);

  const filteredQuotes = useMemo(
    () => quotes.filter((q) => q.type === selectedInsuranceType).sort((a, b) => a.monthlyPremium - b.monthlyPremium),
    [quotes, selectedInsuranceType]
  );

  return (
    <div className="space-y-6">
      {/* Type filter */}
      <div className="flex gap-2">
        {INSURANCE_TYPES.map((type) => (
          <Button
            key={type.value}
            variant={selectedInsuranceType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedInsuranceType(type.value)}
            className="flex items-center gap-2"
          >
            <type.icon className="w-4 h-4" />
            {type.label}
            {type.required && <Badge variant="secondary" className="ml-1">Required</Badge>}
          </Button>
        ))}
      </div>

      {/* Quotes list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base">{quote.providerName}</h3>
                    <Badge variant={quoteStatusToVariant(quote.status) as any}>{quote.status}</Badge>
                  </div>
                  {quote.status === 'pending' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Quote processing - typically ready in 24 hours</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-primary">${quote.monthlyPremium.toLocaleString()}/mo</p>
                  <p className="text-sm text-muted-foreground">${quote.annualPremium.toLocaleString()}/year</p>
                </div>
              </div>

              {quote.status === 'received' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        {quote.type === 'flood' ? 'Flood Coverage' : 'Dwelling Coverage'}
                      </p>
                      <p className="font-medium">${quote.coverage.dwelling.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Personal Property</p>
                      <p className="font-medium">${quote.coverage.personalProperty.toLocaleString()}</p>
                    </div>
                    {quote.type !== 'flood' && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Liability</p>
                          <p className="font-medium">${quote.coverage.liability.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Medical Payments</p>
                          <p className="font-medium">${quote.coverage.medicalPayments.toLocaleString()}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-muted-foreground">Deductible</p>
                      <p className="font-medium">${quote.deductible.toLocaleString()}</p>
                    </div>
                  </div>

                  {quote.discounts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Applied Discounts:</h4>
                      <div className="flex flex-wrap gap-2">
                        {quote.discounts.map((discount, index) => (
                          <Badge key={index} variant="outlineSuccess">
                            {discount.name} (-${discount.amount})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-sm mb-2">Included Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {quote.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">Select Policy</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredQuotes.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No quotes yet</h3>
              <p className="text-muted-foreground mb-4">
                Request quotes from multiple providers to compare rates and coverage
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
