import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Home, TrendingUp, Info, ArrowLeft, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { useIsMobile } from './ui/use-mobile';

interface MortgageCalculatorProps {
  onBack?: () => void;
}

export default function MortgageCalculator({ onBack }: MortgageCalculatorProps) {
  const isMobile = useIsMobile();
  const [homePrice, setHomePrice] = useState(750000);
  const [downPayment, setDownPayment] = useState(150000);
  const [interestRate, setInterestRate] = useState(6.75);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(8736);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [pmi, setPmi] = useState(0);
  const [hoaFees, setHoaFees] = useState(900);

  const [results, setResults] = useState({
    monthlyPayment: 0,
    principalAndInterest: 0,
    totalInterest: 0,
    totalPayment: 0,
    loanAmount: 0,
    monthlyPropertyTax: 0,
    monthlyInsurance: 0,
    monthlyPmi: 0,
    monthlyHoa: 0,
    totalMonthlyPayment: 0
  });

  const calculateMortgage = () => {
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    
    // Calculate monthly principal and interest
    const monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Calculate PMI (typically 0.5% to 1% of loan amount if down payment < 20%)
    const downPaymentPercent = (downPayment / homePrice) * 100;
    const monthlyPMI = downPaymentPercent < 20 ? (principal * 0.005) / 12 : 0;
    
    // Calculate other monthly costs
    const monthlyTax = propertyTax / 12;
    const monthlyInsurance = homeInsurance / 12;
    const monthlyHOA = hoaFees / 12;
    
    // Total monthly payment
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + monthlyHOA;
    
    // Total interest over life of loan
    const totalInt = (monthlyPI * numPayments) - principal;
    const totalPay = principal + totalInt;

    setResults({
      monthlyPayment: monthlyPI,
      principalAndInterest: monthlyPI,
      totalInterest: totalInt,
      totalPayment: totalPay,
      loanAmount: principal,
      monthlyPropertyTax: monthlyTax,
      monthlyInsurance: monthlyInsurance,
      monthlyPmi: monthlyPMI,
      monthlyHoa: monthlyHOA,
      totalMonthlyPayment: totalMonthly
    });
    
    setPmi(monthlyPMI * 12);
  };

  useEffect(() => {
    calculateMortgage();
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTax, homeInsurance, hoaFees]);

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

  const downPaymentPercent = (downPayment / homePrice) * 100;
  const loanToValue = ((homePrice - downPayment) / homePrice) * 100;

  // Generate amortization schedule (first 12 months)
  const generateAmortizationSchedule = () => {
    const schedule = [];
    const monthlyRate = interestRate / 100 / 12;
    let remainingBalance = homePrice - downPayment;
    const monthlyPI = results.principalAndInterest;

    for (let month = 1; month <= 12; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPI - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPI,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance
      });
    }

    return schedule;
  };

  const amortizationSchedule = generateAmortizationSchedule();

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
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold`}>Mortgage Calculator</h1>
              <p className="text-sm text-muted-foreground">Calculate your monthly mortgage payments</p>
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
                <Home className="w-5 h-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-muted-foreground">
                      {downPaymentPercent.toFixed(1)}% of home price
                    </span>
                    <Badge variant={downPaymentPercent < 20 ? 'destructive' : 'secondary'}>
                      {downPaymentPercent < 20 ? 'Private Mortgage Insurance (PMI) Required' : 'No Private Mortgage Insurance (PMI)'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label>Down Payment: {downPaymentPercent.toFixed(1)}%</Label>
                <Slider
                  value={[downPaymentPercent]}
                  onValueChange={([value]) => setDownPayment((homePrice * value) / 100)}
                  max={50}
                  min={3}
                  step={0.5}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>3%</span>
                  <span>50%</span>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Additional Costs
              </CardTitle>
              <CardDescription>
                Include property taxes, insurance, and Homeowners Association (HOA) fees for total monthly payment
              </CardDescription>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(propertyTax / 12)}/month
                  </p>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(homeInsurance / 12)}/month
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="hoaFees">Annual Homeowners Association (HOA) Fees</Label>
                <Input
                  id="hoaFees"
                  type="text"
                  value={formatCurrency(hoaFees)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setHoaFees(parseInt(value) || 0);
                  }}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(hoaFees / 12)}/month
                </p>
              </div>

              {downPaymentPercent < 20 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Private Mortgage Insurance (PMI) Required:</strong> Your down payment is less than 20%, so you'll need Private Mortgage Insurance (PMI).
                    Estimated Private Mortgage Insurance (PMI): {formatCurrency(pmi)}/year ({formatCurrency(pmi / 12)}/month)
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className={`space-y-4 ${isMobile ? 'order-1' : ''}`}>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Monthly Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Monthly Payment</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(results.totalMonthlyPayment)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Principal & Interest</span>
                    <span className="text-sm font-medium">{formatCurrency(results.principalAndInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Property Tax</span>
                    <span className="text-sm font-medium">{formatCurrency(results.monthlyPropertyTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Home Insurance</span>
                    <span className="text-sm font-medium">{formatCurrency(results.monthlyInsurance)}</span>
                  </div>
                  {results.monthlyPmi > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Private Mortgage Insurance (PMI)</span>
                      <span className="text-sm font-medium">{formatCurrency(results.monthlyPmi)}</span>
                    </div>
                  )}
                  {results.monthlyHoa > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Homeowners Association (HOA) Fees</span>
                      <span className="text-sm font-medium">{formatCurrency(results.monthlyHoa)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Loan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Loan Amount</span>
                  <span className="text-sm font-medium">{formatCurrency(results.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Interest</span>
                  <span className="text-sm font-medium">{formatCurrency(results.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Payments</span>
                  <span className="text-sm font-medium">{formatCurrency(results.totalPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Loan-to-Value</span>
                  <span className="text-sm font-medium">{loanToValue.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Interest vs Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Interest</span>
                    <span>{((results.totalInterest / results.totalPayment) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(results.totalInterest / results.totalPayment) * 100} className="h-2 bg-red-100" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Principal</span>
                    <span>{((results.loanAmount / results.totalPayment) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(results.loanAmount / results.totalPayment) * 100} className="h-2 bg-blue-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Amortization Schedule */}
      {!isMobile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Amortization Schedule (First 12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Month</th>
                    <th className="text-left p-2">Payment</th>
                    <th className="text-left p-2">Principal</th>
                    <th className="text-left p-2">Interest</th>
                    <th className="text-left p-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((row) => (
                    <tr key={row.month} className="border-b">
                      <td className="p-2">{row.month}</td>
                      <td className="p-2">{formatCurrencyDetailed(row.payment)}</td>
                      <td className="p-2">{formatCurrencyDetailed(row.principal)}</td>
                      <td className="p-2">{formatCurrencyDetailed(row.interest)}</td>
                      <td className="p-2">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
