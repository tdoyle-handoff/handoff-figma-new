import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarCheck2, DollarSign, FileBarChart2, Loader2, TrendingUp, Info, HelpCircle, Save, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '../hooks/useAuth';

const shortCurrency = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n: number) => `${n.toFixed(1)}%`;

// Component for labels with information tooltips
const LabelWithTooltip = ({ text, tooltip, className = "" }: { text: string; tooltip: string; className?: string }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    <Label className="text-sm font-medium">{text}</Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs bg-slate-900 text-white border border-slate-700 shadow-lg">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

function mortgagePmt(principal: number, annualRatePct: number, termYears: number) {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function amortization(principal: number, annualRatePct: number, termYears: number, months: number) {
  const r = annualRatePct / 100 / 12;
  const pmt = mortgagePmt(principal, annualRatePct, termYears);
  let bal = principal;
  const rows: { month: number; interest: number; principal: number; balance: number }[] = [];
  for (let m = 1; m <= months; m++) {
    const interest = bal * r;
    const principalPaid = Math.max(0, pmt - interest);
    bal = Math.max(0, bal - principalPaid);
    rows.push({ month: m, interest, principal: principalPaid, balance: bal });
  }
  return { rows, totalPrincipal: rows.reduce((s, x) => s + x.principal, 0) };
}

const STAGES = [
  { key: 'offer', label: 'Made an Offer' },
  { key: 'contract', label: 'Under Contract' },
  { key: 'inspection', label: 'Home Inspection' },
  { key: 'appraisal', label: 'Bank Appraisal' },
  { key: 'clear_to_close', label: 'Clear to Close' },
  { key: 'closing', label: 'Closing Day' },
];

interface DashboardProps { setupData: any }

// Dashboard data interface for persistence
interface DashboardData {
  homePrice: number;
  downModeDollar: boolean;
  downPercent: number;
  downDollar: number;
  rate: number;
  term: number;
  taxesAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  maintenanceMonthly: number;
  stageIdx: number;
  monthlyIncome: number;
  currentRent: number;
  sellerCredits: number;
  lenderCredits: number;
  lastSaved?: string;
}

// Default dashboard data
const defaultDashboardData: DashboardData = {
  homePrice: 750_000,
  downModeDollar: false,
  downPercent: 20,
  downDollar: 150_000,
  rate: 6.25,
  term: 30,
  taxesAnnual: 10_500,
  insuranceAnnual: 1_800,
  hoaMonthly: 0,
  maintenanceMonthly: 250,
  stageIdx: 2,
  monthlyIncome: 12_000,
  currentRent: 4_200,
  sellerCredits: 0,
  lenderCredits: 0,
};

export default function Dashboard({ setupData }: DashboardProps) {
  const { userProfile, updateUserProfile, isGuestMode } = useAuth();
  // Auto-save status
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Dashboard state
  const [homePrice, setHomePrice] = useState(defaultDashboardData.homePrice);
  const [downModeDollar, setDownModeDollar] = useState(defaultDashboardData.downModeDollar);
  const [downPercent, setDownPercent] = useState(defaultDashboardData.downPercent);
  const [downDollar, setDownDollar] = useState(defaultDashboardData.downDollar);
  const [rate, setRate] = useState(defaultDashboardData.rate);
  const [term, setTerm] = useState(defaultDashboardData.term);
  const [taxesAnnual, setTaxesAnnual] = useState(defaultDashboardData.taxesAnnual);
  const [insuranceAnnual, setInsuranceAnnual] = useState(defaultDashboardData.insuranceAnnual);
  const [hoaMonthly, setHoaMonthly] = useState(defaultDashboardData.hoaMonthly);
  const [maintenanceMonthly, setMaintenanceMonthly] = useState(defaultDashboardData.maintenanceMonthly);
  const [stageIdx, setStageIdx] = useState(defaultDashboardData.stageIdx);
  const [monthlyIncome, setMonthlyIncome] = useState(defaultDashboardData.monthlyIncome);
  const [currentRent, setCurrentRent] = useState(defaultDashboardData.currentRent);
  const [sellerCredits, setSellerCredits] = useState(defaultDashboardData.sellerCredits);
  const [lenderCredits, setLenderCredits] = useState(defaultDashboardData.lenderCredits);

  // Load saved dashboard data when user profile is available
  useEffect(() => {
    if (userProfile && !dataLoaded) {
      const savedData = userProfile.preferences?.dashboardData as DashboardData;

      if (savedData) {
        console.log('📊 Loading saved dashboard data for user:', userProfile.email);
        setHomePrice(savedData.homePrice || defaultDashboardData.homePrice);
        setDownModeDollar(savedData.downModeDollar ?? defaultDashboardData.downModeDollar);
        setDownPercent(savedData.downPercent || defaultDashboardData.downPercent);
        setDownDollar(savedData.downDollar || defaultDashboardData.downDollar);
        setRate(savedData.rate || defaultDashboardData.rate);
        setTerm(savedData.term || defaultDashboardData.term);
        setTaxesAnnual(savedData.taxesAnnual || defaultDashboardData.taxesAnnual);
        setInsuranceAnnual(savedData.insuranceAnnual || defaultDashboardData.insuranceAnnual);
        setHoaMonthly(savedData.hoaMonthly || defaultDashboardData.hoaMonthly);
        setMaintenanceMonthly(savedData.maintenanceMonthly || defaultDashboardData.maintenanceMonthly);
        setStageIdx(savedData.stageIdx || defaultDashboardData.stageIdx);
        setMonthlyIncome(savedData.monthlyIncome || defaultDashboardData.monthlyIncome);
        setCurrentRent(savedData.currentRent || defaultDashboardData.currentRent);
        setSellerCredits(savedData.sellerCredits || defaultDashboardData.sellerCredits);
        setLenderCredits(savedData.lenderCredits || defaultDashboardData.lenderCredits);
        setLastSaved(savedData.lastSaved || null);
        console.log('✅ Dashboard data loaded successfully');
      } else {
        console.log('📊 No saved dashboard data found, using defaults');
      }

      setDataLoaded(true);
    }
  }, [userProfile, dataLoaded]);

  // Auto-save dashboard data when values change
  const saveDashboardData = useCallback(async () => {
    if (!userProfile || !dataLoaded) return;

    try {
      setIsAutoSaving(true);

      const dashboardData: DashboardData = {
        homePrice,
        downModeDollar,
        downPercent,
        downDollar,
        rate,
        term,
        taxesAnnual,
        insuranceAnnual,
        hoaMonthly,
        maintenanceMonthly,
        stageIdx,
        monthlyIncome,
        currentRent,
        sellerCredits,
        lenderCredits,
        lastSaved: new Date().toISOString(),
      };

      const updatedPreferences = {
        ...userProfile.preferences,
        dashboardData,
      };

      await updateUserProfile({
        preferences: updatedPreferences
      });

      setLastSaved(dashboardData.lastSaved);
      console.log('💾 Dashboard data auto-saved successfully');
    } catch (error) {
      console.error('Error saving dashboard data:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [
    userProfile, dataLoaded, updateUserProfile,
    homePrice, downModeDollar, downPercent, downDollar, rate, term,
    taxesAnnual, insuranceAnnual, hoaMonthly, maintenanceMonthly,
    stageIdx, monthlyIncome, currentRent, sellerCredits, lenderCredits
  ]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!dataLoaded) return;

    const timeoutId = setTimeout(() => {
      saveDashboardData();
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [
    homePrice, downModeDollar, downPercent, downDollar, rate, term,
    taxesAnnual, insuranceAnnual, hoaMonthly, maintenanceMonthly,
    stageIdx, monthlyIncome, currentRent, sellerCredits, lenderCredits,
    saveDashboardData, dataLoaded
  ]);

  const downPayment = useMemo(() => (downModeDollar ? Math.min(downDollar, homePrice) : (downPercent / 100) * homePrice), [downModeDollar, downDollar, downPercent, homePrice]);
  const loanAmount = Math.max(homePrice - downPayment, 0);
  const pAndI = mortgagePmt(loanAmount, rate, term);
  const taxesMonthly = taxesAnnual / 12;
  const insuranceMonthly = insuranceAnnual / 12;
  const totalMonthly = pAndI + taxesMonthly + insuranceMonthly + hoaMonthly + maintenanceMonthly;

  const closingBase = homePrice * 0.025;
  const closingBreakdown = [
    { name: 'Bank & lender fees', value: Math.round(closingBase * 0.28) },
    { name: 'Title & legal', value: Math.round(closingBase * 0.24) },
    { name: 'Prepaid taxes/insurance', value: Math.round(closingBase * 0.18) },
    { name: 'Gov. & recording', value: Math.round(closingBase * 0.22) },
    { name: 'Other', value: Math.round(closingBase * 0.08) },
  ];
  const closingTotal = closingBreakdown.reduce((s, x) => s + x.value, 0);
  const moneyNeeded = Math.max(0, downPayment + closingTotal - sellerCredits - lenderCredits);

  const budgetShare = monthlyIncome ? ((pAndI + taxesMonthly + insuranceMonthly + hoaMonthly) / monthlyIncome) * 100 : 0;
  const rentDelta = totalMonthly - currentRent;

  const fiveYear = useMemo(() => amortization(loanAmount, rate, term, 60), [loanAmount, rate, term]);
  const equity5 = Math.max(0, downPayment + fiveYear.totalPrincipal);
  const progressPct = Math.round(((stageIdx + 1) / STAGES.length) * 100);

  const comps = [
    { label: '123 Oak', price: 720000 },
    { label: '45 Pine', price: 765000 },
    { label: '8 Cedar', price: 735000 },
    { label: '67 Maple', price: 790000 },
  ];

  const rentDeltaCopy = rentDelta === 0 ? 'Same as rent' : rentDelta > 0 ? `About ${shortCurrency(rentDelta)} more than your rent` : `About ${shortCurrency(Math.abs(rentDelta))} less than your rent`;
  const budgetCopy = budgetShare > 40 ? 'Above comfort range' : budgetShare > 33 ? 'A bit high' : 'Within comfort range';
  const tipMonthlySave = useMemo(() => {
    const base = mortgagePmt(loanAmount, rate, term);
    const improved = mortgagePmt(Math.max(0, loanAmount - 5000), rate, term);
    const diff = base - improved;
    return diff > 0 ? diff : 0;
  }, [loanAmount, rate, term]);

  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* Property Input Form */}
      <Card className="shadow-sm mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>Enter your property details to calculate costs and payments.</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isAutoSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{isGuestMode ? 'Auto-save (local)' : 'Auto-save enabled'}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <LabelWithTooltip
                text="Home Price"
                tooltip="The total purchase price of the property. This is the amount you'll pay the seller, not including closing costs or down payment."
              />
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value || 0))}
                  placeholder="750,000"
                  className="pl-8 text-lg"
                />
              </div>
            </div>
            <div>
              <LabelWithTooltip
                text="Down Payment %"
                tooltip="Percentage of home price paid upfront. Higher down payments mean lower monthly payments and may eliminate PMI. Conventional loans typically require 5-20%."
              />
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={downPercent}
                  onChange={(e) => setDownPercent(Number(e.target.value || 0))}
                  placeholder="20"
                  className="pr-8 text-lg"
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div>
              <LabelWithTooltip
                text="Interest Rate %"
                tooltip="Annual percentage rate for your mortgage loan. This is determined by current market rates, your credit score, down payment, and loan type."
              />
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value || 0))}
                  placeholder="6.25"
                  className="pr-8 text-lg"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div>
              <LabelWithTooltip
                text="Loan Term (Years)"
                tooltip="Length of your mortgage in years. 30-year loans have lower monthly payments but higher total interest. 15-year loans have higher payments but less total interest."
              />
              <Input
                type="number"
                value={term}
                onChange={(e) => setTerm(Number(e.target.value || 0))}
                placeholder="30"
                className="mt-1 text-lg"
              />
            </div>
            <div>
              <LabelWithTooltip
                text="Property Taxes (Annual)"
                tooltip="Annual property taxes based on your local tax rate and assessed property value. Typically 0.5-2.5% of home value depending on location."
              />
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={taxesAnnual}
                  onChange={(e) => setTaxesAnnual(Number(e.target.value || 0))}
                  placeholder="10,500"
                  className="pl-8 text-lg"
                />
              </div>
            </div>
            <div>
              <LabelWithTooltip
                text="Home Insurance (Annual)"
                tooltip="Annual homeowner's insurance premium. Protects against fire, theft, and other damages. Usually required by your lender and typically costs 0.2-0.5% of home value."
              />
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={insuranceAnnual}
                  onChange={(e) => setInsuranceAnnual(Number(e.target.value || 0))}
                  placeholder="1,800"
                  className="pl-8 text-lg"
                />
              </div>
            </div>
            <div>
              <LabelWithTooltip
                text="HOA (Monthly)"
                tooltip="Monthly Homeowners Association fees for shared amenities and maintenance. Common in condos, townhomes, and planned communities. Enter 0 if no HOA."
              />
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={hoaMonthly}
                  onChange={(e) => setHoaMonthly(Number(e.target.value || 0))}
                  placeholder="0"
                  className="pl-8 text-lg"
                />
              </div>
            </div>
            <div>
              <LabelWithTooltip
                text="Monthly Upkeep"
                tooltip="Estimated monthly maintenance and repair costs. Rule of thumb is 1-3% of home value annually, or about $1 per square foot per year."
              />
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={maintenanceMonthly}
                  onChange={(e) => setMaintenanceMonthly(Number(e.target.value || 0))}
                  placeholder="250"
                  className="pl-8 text-lg"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <LabelWithTooltip
                text="Monthly Income"
                tooltip="Your gross monthly income before taxes and deductions. Used to calculate debt-to-income ratio and determine if you qualify for the loan amount."
              />
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value || 0))}
                  placeholder="12,000"
                  className="pl-8 text-lg"
                />
              </div>
            </div>
            <div>
              <LabelWithTooltip
                text="Current Rent"
                tooltip="Your current monthly rent payment. Used to compare your new housing costs with your current housing expenses."
              />
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(Number(e.target.value || 0))}
                  placeholder="4,200"
                  className="pl-8 text-lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Analytics & Budget View */}
      <div className="space-y-12">
        {/* Budget Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Budget & Closing Costs
          </h2>
          {/* One-time Costs at Closing */}
          <Card className="shadow-sm mb-10">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl">One-time Costs at Closing</CardTitle>
              <CardDescription>Typical range is 2-5% of the price.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
                <div>
                  <LabelWithTooltip
                    text="Bank & lender fees"
                    tooltip="Fees charged by your lender for processing and underwriting your loan. Includes origination fees, processing fees, and underwriting costs. Typically 1-2% of loan amount."
                    className="text-sm text-muted-foreground mb-1"
                  />
                  <div className="text-lg font-semibold">{shortCurrency(closingBreakdown[0].value)}</div>
                  <div className="w-full bg-blue-200 h-1 rounded mt-2"></div>
                </div>
                <div>
                  <LabelWithTooltip
                    text="Title & legal"
                    tooltip="Title insurance, title search, and attorney fees. Title insurance protects you and the lender against title defects or ownership disputes. Required by most lenders."
                    className="text-sm text-muted-foreground mb-1"
                  />
                  <div className="text-lg font-semibold">{shortCurrency(closingBreakdown[1].value)}</div>
                  <div className="w-full bg-yellow-200 h-1 rounded mt-2"></div>
                </div>
                <div>
                  <LabelWithTooltip
                    text="Prepaid taxes/insurance"
                    tooltip="Property taxes and insurance premiums paid in advance at closing. Usually includes 2-6 months of property taxes and 1 year of homeowner's insurance to establish escrow accounts."
                    className="text-sm text-muted-foreground mb-1"
                  />
                  <div className="text-lg font-semibold">{shortCurrency(closingBreakdown[2].value)}</div>
                  <div className="w-full bg-green-200 h-1 rounded mt-2"></div>
                </div>
                <div>
                  <LabelWithTooltip
                    text="Gov. & recording"
                    tooltip="Government recording fees, transfer taxes, and document stamps required to legally transfer property ownership. Varies by state and local jurisdiction."
                    className="text-sm text-muted-foreground mb-1"
                  />
                  <div className="text-lg font-semibold">{shortCurrency(closingBreakdown[3].value)}</div>
                  <div className="w-full bg-purple-200 h-1 rounded mt-2"></div>
                </div>
                <div>
                  <LabelWithTooltip
                    text="Other"
                    tooltip="Miscellaneous closing costs including home inspection fees, appraisal fees, survey costs, and other third-party services required for your loan approval."
                    className="text-sm text-muted-foreground mb-1"
                  />
                  <div className="text-lg font-semibold">{shortCurrency(closingBreakdown[4].value)}</div>
                  <div className="w-full bg-gray-200 h-1 rounded mt-2"></div>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Credits</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <LabelWithTooltip
                        text="Seller"
                        tooltip="Amount the seller agrees to pay toward your closing costs. This is negotiated as part of your purchase offer and can help reduce your out-of-pocket expenses at closing."
                        className="text-sm"
                      />
                      <Input type="number" value={sellerCredits} onChange={(e)=>setSellerCredits(Number(e.target.value||0))} className="w-24 h-8 text-right" />
                    </div>
                    <div className="flex justify-between items-center">
                      <LabelWithTooltip
                        text="Lender"
                        tooltip="Credits from your lender to help pay closing costs, usually offered in exchange for accepting a slightly higher interest rate. Also called 'lender paid closing costs'."
                        className="text-sm"
                      />
                      <Input type="number" value={lenderCredits} onChange={(e)=>setLenderCredits(Number(e.target.value||0))} className="w-24 h-8 text-right" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <LabelWithTooltip
                    text="Money needed at closing"
                    tooltip="Total cash you need to bring to closing. This is your down payment plus all closing costs, minus any credits from seller or lender. Some costs may be financed into your loan."
                    className="text-sm text-muted-foreground mb-1 justify-end"
                  />
                  <div className="text-2xl font-bold">{shortCurrency(moneyNeeded)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Monthly Cost */}
          <div className="flex justify-center my-12">
            <Card className="shadow-sm w-full max-w-4xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Your Monthly Cost</CardTitle>
                <CardDescription>Live breakdown by category.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Left side - Text breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loan amount</span>
                      <span className="font-medium">{shortCurrency(loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mortgage</span>
                      <span className="font-medium">{shortCurrency(pAndI)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxes</span>
                      <span className="font-medium">{shortCurrency(taxesMonthly)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Insurance</span>
                      <span className="font-medium">{shortCurrency(insuranceMonthly)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">HOA</span>
                      <span className="font-medium">{shortCurrency(hoaMonthly)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Upkeep</span>
                      <span className="font-medium">{shortCurrency(maintenanceMonthly)}</span>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between font-semibold">
                      <span>Total monthly</span>
                      <span className="text-xl">{shortCurrency(totalMonthly)}</span>
                    </div>

                    <div className="mt-4">
                    <LabelWithTooltip
                      text="Rent comparison"
                      tooltip="How your total monthly housing costs (including mortgage, taxes, insurance, HOA, and maintenance) compare to your current rent payment."
                      className="text-sm text-muted-foreground mb-1"
                    />
                    <div className="text-sm font-medium text-orange-600">{rentDeltaCopy}</div>
                  </div>
                  </div>

                  {/* Right side - Pie Chart */}
                  <div className="flex justify-center">
                    <div className="h-48 w-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Mortgage', value: pAndI, fill: '#22c55e' },
                              { name: 'Taxes', value: taxesMonthly, fill: '#3b82f6' },
                              { name: 'Insurance', value: insuranceMonthly, fill: '#f59e0b' },
                              { name: 'Other', value: hoaMonthly + maintenanceMonthly, fill: '#8b5cf6' },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {[
                              { fill: '#22c55e' },
                              { fill: '#3b82f6' },
                              { fill: '#f59e0b' },
                              { fill: '#8b5cf6' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 my-12">
            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Monthly Home Cost</CardTitle>
                <CardDescription>Everything in one monthly number.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-semibold mb-4">{shortCurrency(totalMonthly)}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>🏠 Mortgage</div><div className="text-right">{shortCurrency(pAndI)}</div>
                  <div>📜 Taxes</div><div className="text-right">{shortCurrency(taxesMonthly)}</div>
                  <div>🛡️ Insurance</div><div className="text-right">{shortCurrency(insuranceMonthly)}</div>
                  <div>🏢 HOA</div><div className="text-right">{shortCurrency(hoaMonthly)}</div>
                  <div>🛠️ Upkeep</div><div className="text-right">{shortCurrency(maintenanceMonthly)}</div>
                </div>
                <Separator className="my-3" />
                <div className="text-sm text-muted-foreground">{rentDeltaCopy}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Money Needed at Closing</CardTitle>
                <CardDescription>Down payment + one‑time fees.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-semibold mb-4">{shortCurrency(moneyNeeded)}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>💰 Down payment</div><div className="text-right">{shortCurrency(downPayment)}</div>
                  <div>📄 One-time fees</div><div className="text-right">{shortCurrency(closingTotal)}</div>
                  <div>🎁 Credits</div><div className="text-right">−{shortCurrency(sellerCredits + lenderCredits)}</div>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <LabelWithTooltip
                      text="Seller credits"
                      tooltip="Amount the seller agrees to pay toward your closing costs. Negotiated as part of your purchase offer."
                      className="text-xs"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input type="number" value={sellerCredits} onChange={(e)=>setSellerCredits(Number(e.target.value||0))} className="pl-8" />
                    </div>
                  </div>
                  <div>
                    <LabelWithTooltip
                      text="Lender credits"
                      tooltip="Credits from your lender to help with closing costs, usually in exchange for a slightly higher interest rate."
                      className="text-xs"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input type="number" value={lenderCredits} onChange={(e)=>setLenderCredits(Number(e.target.value||0))} className="pl-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Healthy Budget Check</CardTitle>
                <CardDescription>Rule of thumb: home costs ≤ 1/3 of income</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                  <LabelWithTooltip
                    text="Your housing share"
                    tooltip="Percentage of your gross monthly income going to housing costs (mortgage, taxes, insurance, HOA). Lenders prefer this to be below 28-33% for loan approval."
                    className="text-sm text-muted-foreground"
                  />
                  <div className={`text-xl font-semibold ${budgetShare>33? budgetShare>40? 'text-red-600':'text-orange-600' : ''}`}>{budgetShare.toFixed(1)}%</div>
                </div>
                <Progress value={Math.min((budgetShare/50)*100,100)} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-muted-foreground">{budgetCopy}. Income used: monthly gross.</div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <LabelWithTooltip
                      text="Monthly income"
                      tooltip="Your gross monthly income used for debt-to-income calculations. Lenders typically want housing costs below 28-33% of gross income."
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input type="number" value={monthlyIncome} onChange={(e)=>setMonthlyIncome(Number(e.target.value||0))} className="pl-8" />
                    </div>
                  </div>
                  <div>
                    <LabelWithTooltip
                      text="Current rent"
                      tooltip="Your current monthly rent to compare with your new total housing costs including mortgage, taxes, and insurance."
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input type="number" value={currentRent} onChange={(e)=>setCurrentRent(Number(e.target.value||0))} className="pl-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 my-12">
            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">What if I change it?</CardTitle>
                <CardDescription>See how choices change your monthly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <LabelWithTooltip
                      text="Down payment"
                      tooltip="Amount paid upfront toward the home purchase. Changes your loan amount and monthly payment."
                    />
                    <div className="text-sm text-muted-foreground">{shortCurrency(downPayment)}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={!downModeDollar ? 'font-medium text-foreground' : 'text-muted-foreground'}>Percent</span>
                      <Switch checked={downModeDollar} onCheckedChange={setDownModeDollar} aria-label="Toggle between percent and dollar down payment" />
                      <span className={downModeDollar ? 'font-medium text-foreground' : 'text-muted-foreground'}>Dollar</span>
                    </div>
                    {!downModeDollar ? (
                      <><div className="relative">
                        <Input type="number" value={downPercent} onChange={(e) => setDownPercent(Number(e.target.value || 0))} className="w-32 pr-8" />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div><Slider value={[downPercent]} onValueChange={([v]) => setDownPercent(v)} min={0} max={100} step={1} className="w-full" /></>
                    ) : (
                      <><div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input type="number" value={downDollar} onChange={(e) => setDownDollar(Number(e.target.value || 0))} className="w-52 pl-8" />
                      </div><Slider value={[Math.min(downDollar, homePrice)]} onValueChange={([v]) => setDownDollar(v)} min={0} max={homePrice} step={1000} className="w-full" /></>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <LabelWithTooltip
                      text="Interest rate"
                      tooltip="Your mortgage interest rate. Even small changes (0.25%) can significantly impact your monthly payment and total interest paid."
                    />
                    <div className="text-sm text-muted-foreground">{pct(rate)}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative">
                      <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value || 0))} className="w-32 pr-8" step="0.01" />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <Slider value={[rate]} onValueChange={([v]) => setRate(Number(v.toFixed(2)))} min={0} max={12} step={0.05} className="w-full" />
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-1">
                  <LabelWithTooltip
                    text="Tip:"
                    tooltip="Increasing your down payment reduces your loan amount, which lowers both your monthly payment and the total interest you'll pay over the life of the loan."
                    className="text-sm text-muted-foreground font-medium"
                  />
                  <span className="text-sm text-muted-foreground">Putting in {shortCurrency(5_000)} more could lower your monthly by about {shortCurrency(tipMonthlySave)}.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Ownership You Build</CardTitle>
                <CardDescription>How much you'll own after 5 years.</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] p-6">
                <div className="text-2xl font-semibold">{shortCurrency(equity5)}</div>
                <LabelWithTooltip
                  text="Equity explanation"
                  tooltip="This shows only the equity built from paying down your mortgage principal over 5 years. It doesn't include potential home value appreciation or depreciation, which can significantly impact your total equity."
                  className="text-xs text-muted-foreground"
                />
                <div className="mt-3 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fiveYear.rows.map(r=>({month:r.month, balance:r.balance}))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v)=> (v/1000).toFixed(0) + 'k' } />
                      <ReTooltip formatter={(v: number) => shortCurrency(v)} />
                      <Area type="monotone" dataKey="balance" strokeWidth={2} fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>


          <Card className="shadow-sm mt-12">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg flex items-center gap-2">Good to know <Info className="h-4 w-4"/></CardTitle>
              <CardDescription>Quick tips in plain language.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 text-sm text-muted-foreground md:grid-cols-3 p-6">
              <LabelWithTooltip
                text="Monthly Home Cost explanation"
                tooltip="Your total monthly housing expense including mortgage principal & interest, property taxes, homeowner's insurance, HOA fees, and estimated maintenance costs."
                className="text-sm text-muted-foreground"
              />
              <LabelWithTooltip
                text="Money Needed explanation"
                tooltip="Total cash required at closing including down payment and all closing costs, reduced by any seller or lender credits you negotiate."
                className="text-sm text-muted-foreground"
              />
              <LabelWithTooltip
                text="Budget rule explanation"
                tooltip="Financial experts recommend keeping total housing costs below 28-33% of gross monthly income to maintain financial health and qualify for most loan programs."
                className="text-sm text-muted-foreground"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
