import React, { useState } from 'react';
import { Calculator, Home, DollarSign, Shield, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface InsuranceQuote {
  type: string;
  provider: string;
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  coverage: {
    dwelling: number;
    personalProperty: number;
    liability: number;
    medicalPayments: number;
  };
}

export default function InsuranceCalculator() {
  const [homeValue, setHomeValue] = useState(450000);
  const [homeAge, setHomeAge] = useState(10);
  const [zipCode, setZipCode] = useState('');
  const [constructionType, setConstructionType] = useState('frame');
  const [roofType, setRoofType] = useState('asphalt');
  const [securityFeatures, setSecurityFeatures] = useState<string[]>([]);
  const [claimsHistory, setClaimsHistory] = useState('none');
  const [creditScore, setCreditScore] = useState(750);
  const [deductible, setDeductible] = useState([1000]);

  const [calculatedQuotes, setCalculatedQuotes] = useState<InsuranceQuote[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const securityOptions = [
    'Security System',
    'Smoke Detectors',
    'Burglar Alarm',
    'Fire Sprinklers',
    'Dead Bolt Locks',
    'Storm Shutters'
  ];

  const calculateInsurance = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const baseRate = homeValue * 0.003; // Base rate of 0.3% of home value
      
      // Adjustments based on factors
      let rateMultiplier = 1.0;
      
      // Home age adjustment
      if (homeAge > 30) rateMultiplier += 0.2;
      else if (homeAge > 15) rateMultiplier += 0.1;
      else if (homeAge < 5) rateMultiplier -= 0.1;
      
      // Construction type adjustment
      if (constructionType === 'brick') rateMultiplier -= 0.15;
      else if (constructionType === 'stucco') rateMultiplier -= 0.05;
      else if (constructionType === 'frame') rateMultiplier += 0.05;
      
      // Security features discount
      const securityDiscount = securityFeatures.length * 0.02;
      rateMultiplier -= securityDiscount;
      
      // Claims history adjustment
      if (claimsHistory === 'multiple') rateMultiplier += 0.3;
      else if (claimsHistory === 'single') rateMultiplier += 0.15;
      
      // Credit score adjustment
      if (creditScore >= 800) rateMultiplier -= 0.1;
      else if (creditScore >= 700) rateMultiplier -= 0.05;
      else if (creditScore < 600) rateMultiplier += 0.2;
      
      // Deductible adjustment
      if (deductible[0] >= 2500) rateMultiplier -= 0.15;
      else if (deductible[0] >= 1500) rateMultiplier -= 0.1;
      else if (deductible[0] >= 1000) rateMultiplier -= 0.05;
      
      const annualPremium = Math.round(baseRate * rateMultiplier);
      const monthlyPremium = Math.round(annualPremium / 12);
      
      const quotes: InsuranceQuote[] = [
        {
          type: 'Homeowners',
          provider: 'State Farm',
          monthlyPremium: monthlyPremium,
          annualPremium: annualPremium,
          deductible: deductible[0],
          coverage: {
            dwelling: homeValue,
            personalProperty: Math.round(homeValue * 0.7),
            liability: 300000,
            medicalPayments: 5000
          }
        },
        {
          type: 'Homeowners',
          provider: 'Allstate',
          monthlyPremium: Math.round(monthlyPremium * 1.1),
          annualPremium: Math.round(annualPremium * 1.1),
          deductible: deductible[0],
          coverage: {
            dwelling: homeValue,
            personalProperty: Math.round(homeValue * 0.7),
            liability: 300000,
            medicalPayments: 5000
          }
        },
        {
          type: 'Homeowners',
          provider: 'GEICO',
          monthlyPremium: Math.round(monthlyPremium * 0.9),
          annualPremium: Math.round(annualPremium * 0.9),
          deductible: deductible[0],
          coverage: {
            dwelling: homeValue,
            personalProperty: Math.round(homeValue * 0.7),
            liability: 300000,
            medicalPayments: 5000
          }
        }
      ];
      
      setCalculatedQuotes(quotes);
      setIsCalculating(false);
    }, 2000);
  };

  const toggleSecurityFeature = (feature: string) => {
    setSecurityFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Insurance Calculator
          </h1>
          <p className="text-muted-foreground">
            Estimate your homeowners insurance premiums based on property details and risk factors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Information
              </CardTitle>
              <CardDescription>
                Tell us about your property to get accurate estimates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeValue">Home Value</Label>
                  <Input
                    id="homeValue"
                    type="number"
                    value={homeValue}
                    onChange={(e) => setHomeValue(Number(e.target.value))}
                    placeholder="450000"
                  />
                </div>
                <div>
                  <Label htmlFor="homeAge">Home Age (years)</Label>
                  <Input
                    id="homeAge"
                    type="number"
                    value={homeAge}
                    onChange={(e) => setHomeAge(Number(e.target.value))}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="constructionType">Construction Type</Label>
                  <Select value={constructionType} onValueChange={setConstructionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frame">Frame</SelectItem>
                      <SelectItem value="brick">Brick</SelectItem>
                      <SelectItem value="stucco">Stucco</SelectItem>
                      <SelectItem value="stone">Stone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="roofType">Roof Type</Label>
                <Select value={roofType} onValueChange={setRoofType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                    <SelectItem value="slate">Slate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Deductible: ${deductible[0].toLocaleString()}</Label>
                <Slider
                  value={deductible}
                  onValueChange={setDeductible}
                  max={5000}
                  min={500}
                  step={250}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>$500</span>
                  <span>$5,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Factors & Discounts
              </CardTitle>
              <CardDescription>
                These factors affect your premium calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Security Features</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {securityOptions.map((feature) => (
                    <Button
                      key={feature}
                      variant={securityFeatures.includes(feature) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSecurityFeature(feature)}
                      className="justify-start"
                    >
                      {feature}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="claimsHistory">Claims History</Label>
                  <Select value={claimsHistory} onValueChange={setClaimsHistory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Claims</SelectItem>
                      <SelectItem value="single">1 Claim</SelectItem>
                      <SelectItem value="multiple">2+ Claims</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creditScore">Credit Score</Label>
                  <Input
                    id="creditScore"
                    type="number"
                    value={creditScore}
                    onChange={(e) => setCreditScore(Number(e.target.value))}
                    placeholder="750"
                  />
                </div>
              </div>

              <Button 
                onClick={calculateInsurance} 
                disabled={isCalculating}
                className="w-full"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Insurance Quotes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {calculatedQuotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estimated Quotes
                </CardTitle>
                <CardDescription>
                  Based on your property details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {calculatedQuotes.map((quote, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{quote.provider}</h4>
                          <p className="text-sm text-muted-foreground">{quote.type} Insurance</p>
                        </div>
                        <Badge variant="outline">${quote.deductible.toLocaleString()} deductible</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Premium:</span>
                          <span className="font-medium">${quote.monthlyPremium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Annual Premium:</span>
                          <span className="font-medium">${quote.annualPremium.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <div className="grid grid-cols-2 gap-2">
                          <div>Dwelling: ${quote.coverage.dwelling.toLocaleString()}</div>
                          <div>Personal Property: ${quote.coverage.personalProperty.toLocaleString()}</div>
                          <div>Liability: ${quote.coverage.liability.toLocaleString()}</div>
                          <div>Medical: ${quote.coverage.medicalPayments.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> These are estimates only. Actual premiums may vary based on additional factors, underwriting guidelines, and market conditions. Contact insurance providers for accurate quotes.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Factors That Affect Your Premium</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between">
                <span>Home Age:</span>
                <span className={homeAge > 15 ? 'text-red-600' : 'text-green-600'}>
                  {homeAge > 30 ? '+20%' : homeAge > 15 ? '+10%' : homeAge < 5 ? '-10%' : 'Neutral'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Construction:</span>
                <span className={constructionType === 'brick' ? 'text-green-600' : 'text-muted-foreground'}>
                  {constructionType === 'brick' ? '-15%' : constructionType === 'stucco' ? '-5%' : 'Standard'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Security Features:</span>
                <span className="text-green-600">-{(securityFeatures.length * 2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Claims History:</span>
                <span className={claimsHistory === 'none' ? 'text-green-600' : 'text-red-600'}>
                  {claimsHistory === 'multiple' ? '+30%' : claimsHistory === 'single' ? '+15%' : 'Good'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
