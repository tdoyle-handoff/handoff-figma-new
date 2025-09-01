import React, { useState } from 'react';
import { Shield, Star, DollarSign, Phone, Mail, MapPin, Calculator, FileText, Clock, CheckCircle, AlertCircle, Home, Waves, Wind, Search, Filter, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

interface InsuranceProvider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  amRating: string;
  phone: string;
  email: string;
  website: string;
  yearsInBusiness: number;
  specialties: string[];
  discounts: string[];
  features: string[];
  logo?: string;
}

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

export default function Insurance() {
  const [selectedInsuranceType, setSelectedInsuranceType] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuoteRequest, setShowQuoteRequest] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const [coverageAmount, setCoverageAmount] = useState([450000]);
  const [deductible, setDeductible] = useState([1000]);


  const insuranceProviders: InsuranceProvider[] = [
    {
      id: '1',
      name: 'State Farm',
      rating: 4.2,
      reviewCount: 15420,
      amRating: 'A++',
      phone: '(555) 123-4567',
      email: 'quotes@statefarm.com',
      website: 'statefarm.com',
      yearsInBusiness: 99,
      specialties: ['Home', 'Flood', 'Wind', 'Bundle Discounts'],
      discounts: ['Multi-policy', 'New home', 'Home security', 'Claims-free'],
      features: ['24/7 Claims', 'Mobile App', 'Local Agents', 'Bundle Savings']
    },
    {
      id: '2',
      name: 'Allstate',
      rating: 4.1,
      reviewCount: 12890,
      amRating: 'A+',
      phone: '(555) 234-5678',
      email: 'info@allstate.com',
      website: 'allstate.com',
      yearsInBusiness: 89,
      specialties: ['Home', 'Flood', 'Hurricane', 'Catastrophic Coverage'],
      discounts: ['Safe home', 'Multi-policy', 'New home', 'Early signing'],
      features: ['Claim Satisfaction Guarantee', 'Catastrophic Coverage', 'Weather Alerts']
    },
    {
      id: '3',
      name: 'GEICO',
      rating: 4.3,
      reviewCount: 18750,
      amRating: 'A++',
      phone: '(555) 345-6789',
      email: 'support@geico.com',
      website: 'geico.com',
      yearsInBusiness: 86,
      specialties: ['Home', 'Flood', 'Competitive Rates', 'Digital First'],
      discounts: ['Military', 'Federal employee', 'New home', 'Multi-policy'],
      features: ['15-minute claims', 'Mobile app', 'Low rates', '24/7 service']
    },
    {
      id: '4',
      name: 'Liberty Mutual',
      rating: 4.0,
      reviewCount: 9630,
      amRating: 'A',
      phone: '(555) 456-7890',
      email: 'quotes@libertymutual.com',
      website: 'libertymutual.com',
      yearsInBusiness: 110,
      specialties: ['Home', 'Flood', 'Wind', 'Customizable Coverage'],
      discounts: ['New customer', 'Multi-policy', 'Loyalty', 'Weather-resistant home'],
      features: ['New Home Replacement', 'Weather Protection', 'Customizable Coverage']
    }
  ];

  const [quotes, setQuotes] = useState<InsuranceQuote[]>([
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
  ]);

  const insuranceTypes = [
    { value: 'home', label: 'Homeowners Insurance', icon: Home, required: true },
    { value: 'flood', label: 'Flood Insurance', icon: Waves, required: false },
    { value: 'wind', label: 'Wind/Hurricane Insurance', icon: Wind, required: false }
  ];

  const filteredProviders = insuranceProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'selected': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const requestQuote = (provider: InsuranceProvider, type: string) => {
    const newQuote: InsuranceQuote = {
      id: Date.now().toString(),
      providerId: provider.id,
      providerName: provider.name,
      type: type as 'home' | 'flood' | 'wind',
      monthlyPremium: 0,
      annualPremium: 0,
      deductible: deductible[0],
      coverage: {
        dwelling: coverageAmount[0],
        personalProperty: Math.round(coverageAmount[0] * 0.7),
        liability: type === 'flood' ? 0 : 300000,
        medicalPayments: type === 'flood' ? 0 : 5000
      },
      discounts: [],
      status: 'pending',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      features: provider.features
    };

    setQuotes([...quotes, newQuote]);
    setShowQuoteRequest(false);
    setSelectedProvider(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Insurance</h1>
          <p className="text-black">
            Book providers with ratings & reviews
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showQuoteRequest} onOpenChange={setShowQuoteRequest}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" aria-describedby="insurance-quote-dialog-description">
              <DialogHeader>
                <DialogTitle>Request Insurance Quote</DialogTitle>
                <DialogDescription id="insurance-quote-dialog-description">
                  Get personalized quotes from top-rated insurance providers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Insurance Type</label>
                  <Select value={selectedInsuranceType} onValueChange={setSelectedInsuranceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                            {type.required && <Badge variant="secondary">Required</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedInsuranceType === 'home' || selectedInsuranceType === 'flood' || selectedInsuranceType === 'wind') && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {selectedInsuranceType === 'flood' ? 'Flood Coverage Amount' : 'Dwelling Coverage Amount'}: ${coverageAmount[0].toLocaleString()}
                      </label>
                      <Slider
                        value={coverageAmount}
                        onValueChange={setCoverageAmount}
                        max={800000}
                        min={200000}
                        step={10000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>$200,000</span>
                        <span>$800,000</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Deductible: ${deductible[0].toLocaleString()}
                      </label>
                      <Slider
                        value={deductible}
                        onValueChange={setDeductible}
                        max={5000}
                        min={500}
                        step={250}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>$500</span>
                        <span>$5,000</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Select Provider</label>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {insuranceProviders.map((provider) => (
                      <Card 
                        key={provider.id} 
                        className={selectedProvider?.id === provider.id ? 'cursor-pointer transition-colors ring-2 ring-primary' : 'cursor-pointer transition-colors hover:bg-muted' }
                        onClick={() => setSelectedProvider(provider)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{provider.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{provider.rating} ({provider.reviewCount} reviews)</span>
                                <Badge variant="outline">{provider.amRating}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{provider.yearsInBusiness} years</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => selectedProvider && requestQuote(selectedProvider, selectedInsuranceType)}
                    disabled={!selectedProvider}
                    className="flex-1"
                  >
                    Request Quote
                  </Button>
                  <Button variant="outline" onClick={() => setShowQuoteRequest(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Insurance Requirements Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your lender requires homeowners insurance before closing. Consider flood and wind coverage if your property is in a high-risk area.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-6">
          {/* Insurance Type Filter */}
          <div className="flex gap-2">
            {insuranceTypes.map((type) => (
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

          {/* Quote Comparison */}
          <div className="grid grid-cols-1 gap-4">
            {quotes
              .filter(quote => quote.type === selectedInsuranceType)
              .sort((a, b) => a.monthlyPremium - b.monthlyPremium)
              .map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{quote.providerName}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>
                      {quote.status === 'pending' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Quote processing - typically ready in 24 hours</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-primary">${quote.monthlyPremium}/mo</p>
                      <p className="text-sm text-muted-foreground">${quote.annualPremium}/year</p>
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
                              <Badge key={index} variant="outline" className="text-green-600">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            alert(`Viewing details for ${quote.providerName} ${quote.type} insurance policy.\n\nCoverage Details:\n• Dwelling: $${quote.coverage.dwelling.toLocaleString()}\n• Personal Property: $${quote.coverage.personalProperty.toLocaleString()}\n• Liability: $${quote.coverage.liability.toLocaleString()}\n• Medical Payments: $${quote.coverage.medicalPayments.toLocaleString()}\n\nDeductible: $${quote.deductible.toLocaleString()}\nValid until: ${quote.validUntil}`);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const updatedQuotes = quotes.map(q =>
                              q.id === quote.id
                                ? { ...q, status: 'selected' as const }
                                : q.type === quote.type
                                  ? { ...q, status: 'received' as const }
                                  : q
                            );
                            setQuotes(updatedQuotes);
                            alert(`Selected ${quote.providerName} ${quote.type} insurance policy!\n\nMonthly Premium: $${quote.monthlyPremium.toLocaleString()}\nAnnual Premium: $${quote.annualPremium.toLocaleString()}\n\nYour insurance provider will contact you to finalize the policy details.`);
                          }}
                        >
                          Select Policy
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {quotes.filter(quote => quote.type === selectedInsuranceType).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No quotes yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Request quotes from multiple providers to compare rates and coverage
                  </p>
                  <Button onClick={() => setShowQuoteRequest(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Request Your First Quote
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search providers by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <Badge variant="outline">{provider.amRating} Rated</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{provider.rating} ({provider.reviewCount} reviews)</span>
                        </div>
                        <span>{provider.yearsInBusiness} years in business</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Specialties</h4>
                          <div className="flex flex-wrap gap-1">
                            {provider.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Available Discounts</h4>
                          <div className="flex flex-wrap gap-1">
                            {provider.discounts.slice(0, 3).map((discount, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {discount}
                              </Badge>
                            ))}
                            {provider.discounts.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{provider.discounts.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{provider.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{provider.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setShowQuoteRequest(true);
                        }}
                      >
                        Get Quote
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Calculator</CardTitle>
              <CardDescription>
                Estimate your insurance costs based on your property details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Home Value</label>
                    <Input placeholder="$450,000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Year Built</label>
                    <Input placeholder="2018" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Square Footage</label>
                    <Input placeholder="2,400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Construction Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select construction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frame">Frame</SelectItem>
                        <SelectItem value="masonry">Masonry</SelectItem>
                        <SelectItem value="brick">Brick</SelectItem>
                        <SelectItem value="steel">Steel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location Risk Factors</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Flood zone</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Hurricane zone</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Earthquake zone</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Safety Features</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Security system</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Fire sprinkler system</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Storm shutters</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-4">Estimated Annual Premiums</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Homeowners Insurance</span>
                    <span className="font-medium">$1,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flood Insurance</span>
                    <span className="font-medium">$540</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind/Hurricane Insurance</span>
                    <span className="font-medium">$720</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Bundle Discount</span>
                    <span>-$180</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Estimated Cost</span>
                    <span>$2,580/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    *This is an estimate. Actual rates may vary based on additional factors.
                  </p>
                </div>
              </div>
              
              <Button className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Get Accurate Quotes
              </Button>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Policies</CardTitle>
              <CardDescription>
                Manage your active insurance policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No active policies</h3>
                <p className="text-muted-foreground mb-4">
                  Once you select and purchase insurance, your policies will appear here
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Get Your First Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
