import React, { useMemo, useState } from 'react';
import { Star, Phone, Mail, Filter, Plus, Home, Waves, Wind } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';

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

interface InsuranceQuoteRequest {
  providerId: string;
  providerName: string;
  type: 'home' | 'flood' | 'wind';
  deductible: number;
  dwellingCoverage: number;
}

interface InsuranceProvidersProps {
  onRequestQuote?: (request: InsuranceQuoteRequest) => void;
}

const INSURANCE_TYPES = [
  { value: 'home', label: 'Homeowners Insurance', icon: Home, required: true },
  { value: 'flood', label: 'Flood Insurance', icon: Waves, required: false },
  { value: 'wind', label: 'Wind/Hurricane Insurance', icon: Wind, required: false }
] as const;

type InsuranceTypeValue = (typeof INSURANCE_TYPES)[number]['value'];

const PROVIDERS: InsuranceProvider[] = [
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

export default function InsuranceProviders({ onRequestQuote }: InsuranceProvidersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuoteRequest, setShowQuoteRequest] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<InsuranceTypeValue>('home');
  const [coverageAmount, setCoverageAmount] = useState([450000]);
  const [deductible, setDeductible] = useState([1000]);

  const filteredProviders = useMemo(
    () =>
      PROVIDERS.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [searchTerm]
  );

  const requestQuote = (provider: InsuranceProvider, type: InsuranceTypeValue) => {
    const req: InsuranceQuoteRequest = {
      providerId: provider.id,
      providerName: provider.name,
      type,
      deductible: deductible[0],
      dwellingCoverage: coverageAmount[0]
    };
    onRequestQuote?.(req);
    setShowQuoteRequest(false);
    setSelectedProvider(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
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
                <Select value={selectedInsuranceType} onValueChange={(v) => setSelectedInsuranceType(v as InsuranceTypeValue)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_TYPES.map((type) => (
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

              <div>
                <label className="text-sm font-medium mb-2 block">Select Provider</label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {PROVIDERS.map((provider) => (
                    <Card
                      key={provider.id}
                      className={selectedProvider?.id === provider.id ? 'cursor-pointer transition-colors ring-2 ring-primary' : 'cursor-pointer transition-colors hover:bg-muted'}
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

      {/* Provider Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base">{provider.name}</h3>
                    <Badge variant="outlineInfo">{provider.amRating} Rated</Badge>
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
    </div>
  );
}
