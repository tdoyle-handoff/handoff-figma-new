import React, { useMemo, useState } from 'react';
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
import { CalendarCheck2, DollarSign, FileBarChart2, Loader2, TrendingUp, Info } from 'lucide-react';

const shortCurrency = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n: number) => `${n.toFixed(1)}%`;

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

export default function Dashboard({ setupData }: DashboardProps) {
  const [homePrice, setHomePrice] = useState(750_000);
  const [downModeDollar, setDownModeDollar] = useState(false);
  const [downPercent, setDownPercent] = useState(20);
  const [downDollar, setDownDollar] = useState(150_000);
  const [rate, setRate] = useState(6.25);
  const [term, setTerm] = useState(30);
  const [taxesAnnual, setTaxesAnnual] = useState(10_500);
  const [insuranceAnnual, setInsuranceAnnual] = useState(1_800);
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [maintenanceMonthly, setMaintenanceMonthly] = useState(250);
  const [stageIdx, setStageIdx] = useState(2);
  const [monthlyIncome, setMonthlyIncome] = useState(12_000);
  const [currentRent, setCurrentRent] = useState(4_200);
  const [sellerCredits, setSellerCredits] = useState(0);
  const [lenderCredits, setLenderCredits] = useState(0);

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
    <div className="mx-auto max-w-7xl p-6">
      {setupData?.buyerName && (
        <div className="mb-2 text-sm text-muted-foreground">
          Welcome back, {setupData.buyerName.split(' ')[0]}!
        </div>
      )}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="gap-2"><FileBarChart2 className="h-4 w-4"/>Analytics</TabsTrigger>
          <TabsTrigger value="budget" className="gap-2"><DollarSign className="h-4 w-4"/>Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarCheck2 className="h-5 w-5"/>Your Progress</CardTitle>
              <CardDescription>From offer to keys in hand.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Label className="mr-2">Where you are</Label>
                <Select value={String(stageIdx)} onValueChange={(v) => setStageIdx(Number(v))}>
                  <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select stage"/></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s, i) => (
                      <SelectItem key={s.key} value={String(i)}>{i + 1}. {s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="ml-auto text-sm text-muted-foreground">{progressPct}% done</div>
              </div>
              <Progress value={progressPct} className="h-2" />
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
                {STAGES.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${i <= stageIdx ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}></div>
                    <span className={`text-sm ${i <= stageIdx ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Monthly Home Cost</CardTitle>
                <CardDescription>Everything in one monthly number.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{shortCurrency(totalMonthly)}</div>
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
              <CardHeader>
                <CardTitle>Money Needed at Closing</CardTitle>
                <CardDescription>Down payment + one‑time fees.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{shortCurrency(moneyNeeded)}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>💰 Down payment</div><div className="text-right">{shortCurrency(downPayment)}</div>
                  <div>🧾 One‑time fees</div><div className="text-right">{shortCurrency(closingTotal)}</div>
                  <div>🎁 Credits</div><div className="text-right">−{shortCurrency(sellerCredits + lenderCredits)}</div>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Label className="text-xs">Seller credits</Label>
                    <Input type="number" value={sellerCredits} onChange={(e)=>setSellerCredits(Number(e.target.value||0))} />
                  </div>
                  <div>
                    <Label className="text-xs">Lender credits</Label>
                    <Input type="number" value={lenderCredits} onChange={(e)=>setLenderCredits(Number(e.target.value||0))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Healthy Budget Check</CardTitle>
                <CardDescription>Rule of thumb: home costs ≤ 1/3 of income</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                  <div className="text-sm text-muted-foreground">Your housing share</div>
                  <div className={`text-xl font-semibold ${budgetShare>33? budgetShare>40? 'text-red-600':'text-orange-600' : ''}`}>{budgetShare.toFixed(1)}%</div>
                </div>
                <Progress value={Math.min((budgetShare/50)*100,100)} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-muted-foreground">{budgetCopy}. Income used: monthly gross.</div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label>Monthly income</Label>
                    <Input type="number" value={monthlyIncome} onChange={(e)=>setMonthlyIncome(Number(e.target.value||0))} />
                  </div>
                  <div>
                    <Label>Current rent</Label>
                    <Input type="number" value={currentRent} onChange={(e)=>setCurrentRent(Number(e.target.value||0))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>What if I change it?</CardTitle>
                <CardDescription>See how choices change your monthly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between"><Label>Down payment</Label><div className="text-sm text-muted-foreground">{shortCurrency(downPayment)}</div></div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={!downModeDollar ? 'font-medium text-foreground' : 'text-muted-foreground'}>Percent</span>
                      <Switch checked={downModeDollar} onCheckedChange={setDownModeDollar} aria-label="Toggle between percent and dollar down payment" />
                      <span className={downModeDollar ? 'font-medium text-foreground' : 'text-muted-foreground'}>Dollar</span>
                    </div>
                    {!downModeDollar ? (
                      <><Input type="number" value={downPercent} onChange={(e) => setDownPercent(Number(e.target.value || 0))} className="w-24" /><Slider value={[downPercent]} onValueChange={([v]) => setDownPercent(v)} min={0} max={100} step={1} className="w-full" /></>
                    ) : (
                      <><Input type="number" value={downDollar} onChange={(e) => setDownDollar(Number(e.target.value || 0))} className="w-40" /><Slider value={[Math.min(downDollar, homePrice)]} onValueChange={([v]) => setDownDollar(v)} min={0} max={homePrice} step={1000} className="w-full" /></>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between"><Label>Interest rate</Label><div className="text-sm text-muted-foreground">{pct(rate)}</div></div>
                  <div className="mt-2 flex items-center gap-3">
                    <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value || 0))} className="w-24" />
                    <Slider value={[rate]} onValueChange={([v]) => setRate(Number(v.toFixed(2)))} min={0} max={12} step={0.05} className="w-full" />
                  </div>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">Tip: Putting in {shortCurrency(5_000)} more could lower your monthly by about {shortCurrency(tipMonthlySave)}.</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Ownership You Build</CardTitle>
                <CardDescription>How much you’ll own after 5 years.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <div className="text-2xl font-semibold">{shortCurrency(equity5)}</div>
                <div className="text-xs text-muted-foreground">This is from paying down your loan. Home price changes not included.</div>
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

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/>Similar homes nearby</CardTitle>
              <CardDescription>Recent prices to sanity‑check your offer.</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comps}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(v) => (v/1000).toFixed(0) + 'k'} />
                  <ReTooltip formatter={(v: number) => shortCurrency(v)} />
                  <Bar dataKey="price" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Good to know <Info className="h-4 w-4"/></CardTitle>
              <CardDescription>Quick tips in plain language.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <div>"Monthly Home Cost" includes mortgage, taxes, insurance, HOA, and upkeep.</div>
              <div>“Money Needed at Closing” is your down payment plus one‑time fees. Credits can reduce it.</div>
              <div>Healthy budget rule: try to keep home costs at or under one‑third of your gross income.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>Set Your Numbers</CardTitle>
                  <CardDescription>Change these to match your situation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Home price</Label>
                      <div className="text-sm text-muted-foreground">{shortCurrency(homePrice)}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Input type="number" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value || 0))} className="w-48" />
                      <Slider value={[homePrice]} onValueChange={([v]) => setHomePrice(v)} min={100_000} max={2_000_000} step={5_000} className="w-full" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Down payment</Label>
                        <div className="ml-auto flex items-center gap-2 text-sm">
                          <span className={!downModeDollar ? 'font-medium text-foreground' : 'text-muted-foreground'}>Percent</span>
                          <Switch checked={downModeDollar} onCheckedChange={setDownModeDollar} aria-label="Toggle between percent and dollar down payment" />
                          <span className={downModeDollar ? 'font-medium text-foreground' : 'text-muted-foreground'}>Dollar</span>
                        </div>
                      </div>
                      {!downModeDollar ? (
                        <div className="flex items-center gap-3">
                          <Input type="number" value={downPercent} onChange={(e) => setDownPercent(Number(e.target.value || 0))} className="w-28" />
                          <Slider value={[downPercent]} onValueChange={([v]) => setDownPercent(v)} min={0} max={100} step={1} className="w-full" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Input type="number" value={downDollar} onChange={(e) => setDownDollar(Number(e.target.value || 0))} className="w-40" />
                          <Slider value={[Math.min(downDollar, homePrice)]} onValueChange={([v]) => setDownDollar(v)} min={0} max={homePrice} step={1000} className="w-full" />
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">Calculated: <span className="font-medium text-foreground">{shortCurrency(downPayment)}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Interest rate</Label>
                        <div className="mt-2 flex items-center gap-3">
                          <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value || 0))} className="w-28" />
                          <Slider value={[rate]} onValueChange={([v]) => setRate(Number(v.toFixed(2)))} min={0} max={12} step={0.05} className="w-full" />
                        </div>
                      </div>
                      <div>
                        <Label>Loan length (years)</Label>
                        <div className="mt-2 flex items-center gap-3">
                          <Input type="number" value={term} onChange={(e) => setTerm(Number(e.target.value || 0))} className="w-28" />
                          <Slider value={[term]} onValueChange={([v]) => setTerm(v)} min={10} max={40} step={5} className="w-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Property taxes (yearly)</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <Input type="number" value={taxesAnnual} onChange={(e) => setTaxesAnnual(Number(e.target.value || 0))} className="w-40" />
                        <Slider value={[taxesAnnual]} onValueChange={([v]) => setTaxesAnnual(v)} min={0} max={40_000} step={250} className="w-full" />
                      </div>
                    </div>
                    <div>
                      <Label>Home insurance (yearly)</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <Input type="number" value={insuranceAnnual} onChange={(e) => setInsuranceAnnual(Number(e.target.value || 0))} className="w-40" />
                        <Slider value={[insuranceAnnual]} onValueChange={([v]) => setInsuranceAnnual(v)} min={0} max={10_000} step={100} className="w-full" />
                      </div>
                    </div>
                    <div>
                      <Label>HOA (monthly)</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <Input type="number" value={hoaMonthly} onChange={(e) => setHoaMonthly(Number(e.target.value || 0))} className="w-40" />
                        <Slider value={[hoaMonthly]} onValueChange={([v]) => setHoaMonthly(v)} min={0} max={2_000} step={25} className="w-full" />
                      </div>
                    </div>
                    <div>
                      <Label>Upkeep (monthly)</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <Input type="number" value={maintenanceMonthly} onChange={(e) => setMaintenanceMonthly(Number(e.target.value || 0))} className="w-40" />
                        <Slider value={[maintenanceMonthly]} onValueChange={([v]) => setMaintenanceMonthly(v)} min={0} max={2_000} step={25} className="w-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Your Monthly Cost <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/></CardTitle>
                  <CardDescription>Live breakdown by category.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Loan amount</div>
                    <div className="text-right font-medium">{shortCurrency(loanAmount)}</div>
                    <div className="text-muted-foreground">Mortgage</div>
                    <div className="text-right font-medium">{shortCurrency(pAndI)}</div>
                    <div className="text-muted-foreground">Taxes</div>
                    <div className="text-right font-medium">{shortCurrency(taxesMonthly)}</div>
                    <div className="text-muted-foreground">Insurance</div>
                    <div className="text-right font-medium">{shortCurrency(insuranceMonthly)}</div>
                    <div className="text-muted-foreground">HOA</div>
                    <div className="text-right font-medium">{shortCurrency(hoaMonthly)}</div>
                    <div className="text-muted-foreground">Upkeep</div>
                    <div className="text-right font-medium">{shortCurrency(maintenanceMonthly)}</div>
                  </div>

                  <div className="my-3" />
                  <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                    <div className="text-sm text-muted-foreground">Total monthly</div>
                    <div className="text-xl font-semibold">{shortCurrency(totalMonthly)}</div>
                  </div>

                  <div className="mt-4 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[
                          { name: 'Mortgage', value: Math.round(pAndI) },
                          { name: 'Taxes', value: Math.round(taxesMonthly) },
                          { name: 'Insurance', value: Math.round(insuranceMonthly) },
                          { name: 'HOA', value: Math.round(hoaMonthly) },
                          { name: 'Upkeep', value: Math.round(maintenanceMonthly) },
                        ]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                          {[0,1,2,3,4].map((i) => (
                            <Cell key={`cell-${i}`} fill={["#10b981","#6366f1","#f59e0b","#ef4444","#14b8a6"][i]} />
                          ))}
                        </Pie>
                        <ReTooltip formatter={(v: number) => shortCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <Separator className="my-4" />

                  <div className="text-sm text-muted-foreground">Rent comparison</div>
                  <div className={`mt-1 text-sm ${rentDelta>0?'text-orange-600':'text-emerald-600'}`}>{rentDeltaCopy}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>One‑time Costs at Closing</CardTitle>
                <CardDescription>Typical range is 2–5% of the price.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {closingBreakdown.map((c, i) => (
                    <div key={c.name} className="rounded-2xl border p-4">
                      <div className="text-sm text-muted-foreground">{c.name}</div>
                      <div className="mt-1 text-xl font-semibold">{shortCurrency(c.value)}</div>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted">
                        <div className={`h-2 rounded-full ${i % 2 ? 'bg-indigo-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((c.value / (homePrice * 0.03)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <div className="text-muted-foreground">Credits</div>
                    <div className="mt-1 flex items-center justify-between"><span>Seller</span><span className="font-medium">{shortCurrency(sellerCredits)}</span></div>
                    <div className="mt-1 flex items-center justify-between"><span>Lender</span><span className="font-medium">{shortCurrency(lenderCredits)}</span></div>
                  </div>
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <div className="text-muted-foreground">Money needed at closing</div>
                    <div className="mt-1 text-xl font-semibold">{shortCurrency(moneyNeeded)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
