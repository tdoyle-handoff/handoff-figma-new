import React, { useState, useEffect } from 'react';
import { Calculator, FileText, DollarSign, Info, ArrowLeft, Download, Share2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useIsMobile } from './ui/use-mobile';

interface ClosingCalculatorProps {
  onBack?: () => void;
}

export default function ClosingCalculator({ onBack }: ClosingCalculatorProps) {
  const isMobile = useIsMobile();
  const [homePrice, setHomePrice] = useState(750000);
  const [downPayment, setDownPayment] = useState(150000);
  const [loanAmount, setLoanAmount] = useState(600000);
  const [interestRate, setInterestRate] = useState(6.75);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(8736);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [location, setLocation] = useState('california');
  const [loanType, setLoanType] = useState('conventional');

  const [results, setResults] = useState({
    totalClosingCosts: 0,
    lenderFees: 0,
    thirdPartyFees: 0,
    governmentFees: 0,
    prepaidExpenses: 0,
    breakdown: {} as any
  });

  const stateTransferTaxRates = {
    california: 0.0011,
    newyork: 0.004,
    texas: 0,
    florida: 0.007,
    illinois: 0.001,
    other: 0.001
  };

  const calculateClosingCosts = () => {
    const loanAmt = homePrice - downPayment;
    setLoanAmount(loanAmt);

    // Lender Fees
    const originationFee = loanAmt * 0.005; // 0.5% of loan amount
    const underwritingFee = 1200;
    const processingFee = 500;
    const appraisalFee = 600;
    const creditReportFee = 50;
    const floodCertification = 25;
    const taxService = 85;
    const lenderFees = originationFee + underwritingFee + processingFee + appraisalFee + creditReportFee + floodCertification + taxService;

    // Third Party Fees
    const titleInsurance = homePrice * 0.005; // 0.5% of home price
    const homeInspection = 500;
    const pestInspection = 150;
    const surveyFee = 400;
    const attorneyFees = 800;
    const escrowFee = 300;
    const thirdPartyFees = titleInsurance + homeInspection + pestInspection + surveyFee + attorneyFees + escrowFee;

    // Government Fees
    const recordingFees = 250;
    const transferTax = homePrice * (stateTransferTaxRates[location as keyof typeof stateTransferTaxRates] || 0.001);
    const governmentFees = recordingFees + transferTax;

    // Prepaid Expenses
    const prepaidInterest = (loanAmt * (interestRate / 100) / 365) * 15; // 15 days of interest
    const prepaidPropertyTax = propertyTax * 0.5; // 6 months
    const prepaidInsurance = homeInsurance; // 1 year
    const prepaidExpenses = prepaidInterest + prepaidPropertyTax + prepaidInsurance;

    // Escrow Account Setup
    const escrowPropertyTax = propertyTax * 0.25; // 3 months
    const escrowInsurance = homeInsurance * 0.25; // 3 months
    const escrowAccount = escrowPropertyTax + escrowInsurance;

    const totalClosing = lenderFees + thirdPartyFees + governmentFees + prepaidExpenses + escrowAccount;

    setResults({
      totalClosingCosts: totalClosing,
      lenderFees,
      thirdPartyFees,
      governmentFees,
      prepaidExpenses,
      breakdown: {
        lenderFees: {
          originationFee,
          underwritingFee,
          processingFee,
          appraisalFee,
          creditReportFee,
          floodCertification,
          taxService
        },
        thirdPartyFees: {
          titleInsurance,
          homeInspection,
          pestInspection,
          surveyFee,
          attorneyFees,
          escrowFee
        },
        governmentFees: {
          recordingFees,
          transferTax
        },
        prepaidExpenses: {
          prepaidInterest,
          prepaidPropertyTax,
          prepaidInsurance
        },
        escrowAccount: {
          escrowPropertyTax,
          escrowInsurance,
          total: escrowAccount
        }
      }
    });
  };

  useEffect(() => {
    calculateClosingCosts();
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTax, homeInsurance, location, loanType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const closingCostPercentage = (results.totalClosingCosts / homePrice) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className={isMobile ? 'touch-target' : ''}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold`}>Closing Costs Calculator</h1>
              <p className="text-sm text-muted-foreground">Estimate your closing costs and cash needed</p>
            </div>
          </div>
        </div>
        <div className={`flex gap-2 ${isMobile ? 'hidden' : ''}`}>
          <Button variant="action-share" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="action-download" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
        {/* Input Panel */}
        <div className={`space-y-6 ${isMobile ? 'order-2' : 'lg:col-span-2'}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Purchase Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <Label htmlFor="homePrice">Home Price</Label>
                  <Input
                    id="homePrice"
                    type="text"
                    value={formatCurrency(homePrice)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setHomePrice(parseInt(value) || 0);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    type="text"
                    value={formatCurrency(downPayment)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setDownPayment(parseInt(value) || 0);
                    }}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {((downPayment / homePrice) * 100).toFixed(1)}% of home price
                  </p>
                </div>
              </div>

              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="loanTerm">Loan Term (years)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(parseInt(e.target.value) || 30)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <Label htmlFor="location">State/Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="newyork">New York</SelectItem>
                      <SelectItem value="texas">Texas</SelectItem>
                      <SelectItem value="florida">Florida</SelectItem>
                      <SelectItem value="illinois">Illinois</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select value={loanType} onValueChange={setLoanType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="fha">FHA Loan</SelectItem>
                      <SelectItem value="va">VA Loan</SelectItem>
                      <SelectItem value="usda">USDA Loan</SelectItem>
                      <SelectItem value="jumbo">Jumbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <Label htmlFor="propertyTax">Annual Property Tax</Label>
                  <Input
                    id="propertyTax"
                    type="text"
                    value={formatCurrency(propertyTax)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPropertyTax(parseInt(value) || 0);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="homeInsurance">Annual Home Insurance</Label>
                  <Input
                    id="homeInsurance"
                    type="text"
                    value={formatCurrency(homeInsurance)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setHomeInsurance(parseInt(value) || 0);
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className={`space-y-4 ${isMobile ? 'order-1' : ''}`}>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Total Closing Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Estimated Closing Costs</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(results.totalClosingCosts)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {closingCostPercentage.toFixed(2)}% of home price
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cash Needed at Closing</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(downPayment + results.totalClosingCosts)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Down payment + closing costs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Lender Fees</span>
                  <span className="text-sm font-medium">{formatCurrency(results.lenderFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Third Party Fees</span>
                  <span className="text-sm font-medium">{formatCurrency(results.thirdPartyFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Government Fees</span>
                  <span className="text-sm font-medium">{formatCurrency(results.governmentFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Prepaid Expenses</span>
                  <span className="text-sm font-medium">{formatCurrency(results.prepaidExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Escrow Account</span>
                  <span className="text-sm font-medium">{formatCurrency(results.breakdown.escrowAccount?.total || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> These are estimates. Actual closing costs may vary based on your specific situation and lender requirements.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lender" className="w-full">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <TabsTrigger value="lender">Lender Fees</TabsTrigger>
              <TabsTrigger value="thirdparty">Third Party</TabsTrigger>
              <TabsTrigger value="government">Government</TabsTrigger>
              <TabsTrigger value="prepaid">Prepaid</TabsTrigger>
            </TabsList>

            <TabsContent value="lender" className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Origination Fee (0.5%)</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.lenderFees?.originationFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Underwriting Fee</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.lenderFees?.underwritingFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.lenderFees?.processingFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Appraisal Fee</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.lenderFees?.appraisalFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Report Fee</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.lenderFees?.creditReportFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flood Certification</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.lenderFees?.floodCertification || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Service Fee</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.lenderFees?.taxService || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total Lender Fees</span>
                  <span className="font-bold">{formatCurrency(results.lenderFees)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="thirdparty" className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Title Insurance</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.thirdPartyFees?.titleInsurance || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Home Inspection</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.thirdPartyFees?.homeInspection || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pest Inspection</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.thirdPartyFees?.pestInspection || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Survey Fee</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.thirdPartyFees?.surveyFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attorney Fees</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.thirdPartyFees?.attorneyFees || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow Fee</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.thirdPartyFees?.escrowFee || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total Third Party Fees</span>
                  <span className="font-bold">{formatCurrency(results.thirdPartyFees)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="government" className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Recording Fees</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.governmentFees?.recordingFees || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transfer Tax</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.governmentFees?.transferTax || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total Government Fees</span>
                  <span className="font-bold">{formatCurrency(results.governmentFees)}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prepaid" className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Prepaid Interest (15 days)</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.prepaidExpenses?.prepaidInterest || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prepaid Property Tax (6 months)</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.prepaidExpenses?.prepaidPropertyTax || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prepaid Insurance (1 year)</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.prepaidExpenses?.prepaidInsurance || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow Property Tax (3 months)</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.escrowAccount?.escrowPropertyTax || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow Insurance (3 months)</span>
                  <span className="font-medium">{formatCurrency(results.breakdown.escrowAccount?.escrowInsurance || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total Prepaid & Escrow</span>
                  <span className="font-bold">{formatCurrency(results.prepaidExpenses + (results.breakdown.escrowAccount?.total || 0))}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
