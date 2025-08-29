import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import {
  Search,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Car,
  Trees,
  Wifi,
  Shield,
  Filter,
  Target,
  Heart,
  TrendingUp,
  CheckCircle2,
  MessageCircle,
  Send,
  Loader2
} from 'lucide-react';

interface LocationCriteria {
  regions: string[];
  states: string[];
  cities: string[];
  zipCodes: { code: string; distance?: number }[];
}

interface SearchCriteria {
  homeTypes: string[];
  locations: string[];
  locationCriteria: LocationCriteria;
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  squareFootage: [number, number];
  lotSize: string;
  yearBuilt: [number, number];
  amenities: string[];
  specialRequirements: string[];
  preferredFeatures: string[];
  budget: {
    downPayment: number;
    monthlyPayment: number;
    includeHOA: boolean;
  };
  timeline: string;
  aiAssistant: {
    enabled: boolean;
    preferences: string;
    searchHistory: any[];
  };
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const HOME_TYPES = [
  { id: 'single-family', label: 'Single Family Home', icon: Home },
  { id: 'condo', label: 'Condominium', icon: Home },
  { id: 'townhouse', label: 'Townhouse', icon: Home },
  { id: 'duplex', label: 'Duplex', icon: Home },
  { id: 'manufactured', label: 'Manufactured/Mobile', icon: Home },
  { id: 'land', label: 'Land/Lot', icon: Square },
  { id: 'multi-family', label: 'Multi-Family', icon: Home },
  { id: 'farm', label: 'Farm/Ranch', icon: Trees }
];

const AMENITIES = [
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'garage', label: 'Garage/Parking', icon: '🚗' },
  { id: 'yard', label: 'Large Yard', icon: '🌳' },
  { id: 'updated-kitchen', label: 'Updated Kitchen', icon: '🍳' },
  { id: 'hardwood', label: 'Hardwood Floors', icon: '🪵' },
  { id: 'fireplace', label: 'Fireplace', icon: '🔥' },
  { id: 'master-suite', label: 'Master Suite', icon: '🛏️' },
  { id: 'basement', label: 'Finished Basement', icon: '🏠' },
  { id: 'walk-in-closet', label: 'Walk-in Closets', icon: '👔' },
  { id: 'laundry', label: 'Laundry Room', icon: '🧺' },
  { id: 'ac', label: 'Central Air', icon: '❄️' },
  { id: 'security', label: 'Security System', icon: '🔒' }
];

const SPECIAL_REQUIREMENTS = [
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: Shield },
  { id: 'single-story', label: 'Single Story Only', icon: Home },
  { id: 'pet-friendly', label: 'Pet-Friendly', icon: Heart },
  { id: 'good-schools', label: 'Excellent School District', icon: '🎓' },
  { id: 'senior-community', label: 'Senior Community', icon: Shield },
  { id: 'gated', label: 'Gated Community', icon: Shield },
  { id: 'waterfront', label: 'Waterfront Property', icon: '🌊' },
  { id: 'mountain-view', label: 'Mountain Views', icon: '🏔️' },
  { id: 'new-construction', label: 'New Construction Only', icon: '🔨' }
];

const PRICE_PRESETS = [
  { label: 'Under 300K', range: [0, 300000] as [number, number] },
  { label: '300K-500K', range: [300000, 500000] as [number, number] },
  { label: '500K-800K', range: [500000, 800000] as [number, number] },
  { label: '800K+', range: [800000, 2000000] as [number, number] }
];

const REGIONS = [
  { id: 'northeast', label: 'Northeast' },
  { id: 'southeast', label: 'Southeast' },
  { id: 'midwest', label: 'Midwest' },
  { id: 'southwest', label: 'Southwest' },
  { id: 'west', label: 'West' },
  { id: 'pacific', label: 'Pacific' }
];

const DISTANCE_OPTIONS = [5, 10, 15, 25, 50, 100];

export default function HomeSearchLanding() {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    homeTypes: [],
    locations: [],
    locationCriteria: {
      regions: [],
      states: [],
      cities: [],
      zipCodes: []
    },
    priceRange: [200000, 800000],
    bedrooms: '',
    bathrooms: '',
    squareFootage: [1000, 5000],
    lotSize: '',
    yearBuilt: [1900, 2024],
    amenities: [],
    specialRequirements: [],
    preferredFeatures: [],
    budget: {
      downPayment: 60000,
      monthlyPayment: 3500,
      includeHOA: true
    },
    timeline: '',
    aiAssistant: {
      enabled: true,
      preferences: '',
      searchHistory: []
    }
  });

  const [activeTab, setActiveTab] = useState('basics');
  const [searchInput, setSearchInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [zipCodeInput, setZipCodeInput] = useState('');
  const [zipCodeDistance, setZipCodeDistance] = useState(25);

  // Handle smart search
  const handleSmartSearch = async () => {
    if (!searchInput.trim()) return;

    const userMessage = searchInput;
    setSearchInput('');
    setIsProcessing(true);

    // Process search and update criteria
    setTimeout(() => {
      generateSearchResponse(userMessage);
      setIsProcessing(false);
    }, 1500);
  };

  const generateSearchResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();

    // Parse natural language and update search criteria
    parseAndUpdateCriteria(userMessage);

    if (message.includes('bedroom') || message.includes('bed')) {
      return "I've updated your search criteria based on your bedroom requirements. Most families find 3-4 bedrooms ideal for comfort and resale value. You can see the updated criteria below and modify any details as needed.";
    }

    if (message.includes('price') || message.includes('budget') || message.includes('cost')) {
      return "I've set your price range based on your budget. Remember to factor in closing costs (2-3%), taxes, insurance, and potential repairs. You can adjust the exact range in the criteria below.";
    }

    if (message.includes('location') || message.includes('area') || message.includes('neighborhood')) {
      return "I've added your preferred locations to the search criteria. I can search across multiple states and consider factors like schools, commute times, and property values. Feel free to add more locations below.";
    }

    if (message.includes('first time') || message.includes('first-time')) {
      return "Welcome to home buying! 🎉 I've set up beginner-friendly criteria focusing on move-in ready homes with good resale potential. The budget is set to stay within recommended guidelines.";
    }

    if (message.includes('school') || message.includes('education')) {
      return "I've noted your school district preferences. I'll prioritize areas with highly-rated schools and family-friendly neighborhoods. You can refine specific requirements in the criteria below.";
    }

    return "I've analyzed your search and updated the criteria below based on what you're looking for. Review the automated selections and adjust anything as needed, then search the MLS database for matching properties.";
  };

  const parseAndUpdateCriteria = (userMessage: string) => {
    const message = userMessage.toLowerCase();

    // Extract bedrooms
    const bedroomMatch = message.match(/(\d+)[\s-]?bedroom|(\d+)[\s-]?bed/);
    if (bedroomMatch) {
      const bedrooms = bedroomMatch[1] || bedroomMatch[2];
      setSearchCriteria(prev => ({ ...prev, bedrooms: `${bedrooms}+` }));
    }

    // Extract price ranges
    const priceMatches = message.match(/\$?([\d,]+)k|\$?([\d,]+),000|\$?([\d,]+)/g);
    if (priceMatches && priceMatches.length >= 1) {
      let prices = priceMatches.map(p => {
        const num = p.replace(/[\$,]/g, '');
        if (p.includes('k')) return parseInt(num) * 1000;
        if (num.length <= 3) return parseInt(num) * 1000; // assume k if small number
        return parseInt(num);
      }).filter(p => p > 10000); // reasonable home prices

      if (prices.length === 1) {
        if (message.includes('under') || message.includes('below') || message.includes('max')) {
          setSearchCriteria(prev => ({ ...prev, priceRange: [prev.priceRange[0], prices[0]] }));
        } else if (message.includes('over') || message.includes('above') || message.includes('min')) {
          setSearchCriteria(prev => ({ ...prev, priceRange: [prices[0], prev.priceRange[1]] }));
        }
      } else if (prices.length >= 2) {
        setSearchCriteria(prev => ({ ...prev, priceRange: [Math.min(...prices), Math.max(...prices)] }));
      }
    }

    // Extract locations (cities, states)
    const locationKeywords = ['in', 'near', 'around'];
    const states = ['texas', 'california', 'florida', 'new york', 'austin', 'dallas', 'houston', 'miami', 'orlando', 'los angeles', 'san francisco', 'chicago', 'boston', 'seattle', 'denver', 'atlanta', 'phoenix', 'las vegas', 'portland', 'nashville'];

    states.forEach(state => {
      if (message.includes(state)) {
        const formattedLocation = state.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        setSearchCriteria(prev => ({
          ...prev,
          locations: prev.locations.includes(formattedLocation)
            ? prev.locations
            : [...prev.locations, formattedLocation]
        }));
      }
    });

    // Extract home types
    if (message.includes('condo') || message.includes('condominium')) {
      setSearchCriteria(prev => ({
        ...prev,
        homeTypes: prev.homeTypes.includes('condo') ? prev.homeTypes : [...prev.homeTypes, 'condo']
      }));
    }

    if (message.includes('townhouse') || message.includes('town house')) {
      setSearchCriteria(prev => ({
        ...prev,
        homeTypes: prev.homeTypes.includes('townhouse') ? prev.homeTypes : [...prev.homeTypes, 'townhouse']
      }));
    }

    if (message.includes('single family') || message.includes('house') && !message.includes('townhouse')) {
      setSearchCriteria(prev => ({
        ...prev,
        homeTypes: prev.homeTypes.includes('single-family') ? prev.homeTypes : [...prev.homeTypes, 'single-family']
      }));
    }

    // Extract amenities
    if (message.includes('pool')) {
      setSearchCriteria(prev => ({
        ...prev,
        amenities: prev.amenities.includes('pool') ? prev.amenities : [...prev.amenities, 'pool']
      }));
    }

    if (message.includes('garage')) {
      setSearchCriteria(prev => ({
        ...prev,
        amenities: prev.amenities.includes('garage') ? prev.amenities : [...prev.amenities, 'garage']
      }));
    }

    if (message.includes('school') || message.includes('education')) {
      setSearchCriteria(prev => ({
        ...prev,
        specialRequirements: prev.specialRequirements.includes('good-schools') ? prev.specialRequirements : [...prev.specialRequirements, 'good-schools']
      }));
    }
  };

  const addRegion = () => {
    if (selectedRegion && !searchCriteria.locationCriteria.regions.includes(selectedRegion)) {
      setSearchCriteria(prev => ({
        ...prev,
        locationCriteria: {
          ...prev.locationCriteria,
          regions: [...prev.locationCriteria.regions, selectedRegion]
        }
      }));
      setSelectedRegion('');
    }
  };

  const addState = () => {
    if (selectedState && !searchCriteria.locationCriteria.states.includes(selectedState)) {
      setSearchCriteria(prev => ({
        ...prev,
        locationCriteria: {
          ...prev.locationCriteria,
          states: [...prev.locationCriteria.states, selectedState]
        }
      }));
      setSelectedState('');
    }
  };

  const addCity = () => {
    if (newLocationInput.trim() && !searchCriteria.locationCriteria.cities.includes(newLocationInput.trim())) {
      setSearchCriteria(prev => ({
        ...prev,
        locationCriteria: {
          ...prev.locationCriteria,
          cities: [...prev.locationCriteria.cities, newLocationInput.trim()]
        }
      }));
      setNewLocationInput('');
    }
  };

  const addZipCode = () => {
    if (zipCodeInput.trim() && /^\d{5}(-\d{4})?$/.test(zipCodeInput.trim())) {
      const exists = searchCriteria.locationCriteria.zipCodes.find(z => z.code === zipCodeInput.trim());
      if (!exists) {
        setSearchCriteria(prev => ({
          ...prev,
          locationCriteria: {
            ...prev.locationCriteria,
            zipCodes: [...prev.locationCriteria.zipCodes, { code: zipCodeInput.trim(), distance: zipCodeDistance }]
          }
        }));
        setZipCodeInput('');
      }
    }
  };

  const removeRegion = (region: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      locationCriteria: {
        ...prev.locationCriteria,
        regions: prev.locationCriteria.regions.filter(r => r !== region)
      }
    }));
  };

  const removeState = (state: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      locationCriteria: {
        ...prev.locationCriteria,
        states: prev.locationCriteria.states.filter(s => s !== state)
      }
    }));
  };

  const removeCity = (city: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      locationCriteria: {
        ...prev.locationCriteria,
        cities: prev.locationCriteria.cities.filter(c => c !== city)
      }
    }));
  };

  const removeZipCode = (zipCode: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      locationCriteria: {
        ...prev.locationCriteria,
        zipCodes: prev.locationCriteria.zipCodes.filter(z => z.code !== zipCode)
      }
    }));
  };

  const handleLocationAdd = () => {
    if (newLocationInput.trim() && !searchCriteria.locations.includes(newLocationInput.trim())) {
      setSearchCriteria(prev => ({
        ...prev,
        locations: [...prev.locations, newLocationInput.trim()]
      }));
      setNewLocationInput('');
    }
  };

  const removeLocation = (locationToRemove: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc !== locationToRemove)
    }));
  };

  const toggleSelection = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const isPricePresetActive = (preset: { range: [number, number] }) => {
    return searchCriteria.priceRange[0] === preset.range[0] && searchCriteria.priceRange[1] === preset.range[1];
  };

  const handleSearch = () => {
    // In a real implementation, this would trigger MLS search
    alert('🔍 Searching MLS database with your criteria...\n\nThis would integrate with your MLS API to find matching properties across multiple states.');
    console.log('Search Criteria:', searchCriteria);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Search className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Home</h1>
        </div>
      </div>

      {/* Main Search Form */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Smart Search Bar at top of criteria */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
              <div className="flex gap-3">
                <Input
                  placeholder="e.g., 'Find me a 3-bedroom home under $500k near good schools in Austin or Dallas'"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSmartSearch} disabled={!searchInput.trim()}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              {isProcessing && (
                <div className="flex items-center gap-2 mt-3 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processing your search and updating criteria below...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Separator className="flex-1" />
              <span className="text-sm text-gray-500 font-medium">OR USE DETAILED SEARCH</span>
              <Separator className="flex-1" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
              </TabsList>

              {/* Basics Tab */}
              <TabsContent value="basics" className="space-y-6">
                {/* Home Types */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Home Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {HOME_TYPES.map(type => {
                      const Icon = type.icon;
                      const isSelected = searchCriteria.homeTypes.includes(type.id);
                      return (
                        <Card
                          key={type.id}
                          className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                          onClick={() => setSearchCriteria(prev => ({
                            ...prev,
                            homeTypes: toggleSelection(prev.homeTypes, type.id)
                          }))}
                        >
                          <CardContent className="p-3 text-center">
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                            <p className={`text-sm ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                              {type.label}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Location</Label>

                  {/* Regions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Regions</Label>
                    <div className="flex gap-2">
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONS.map(region => (
                            <SelectItem key={region.id} value={region.id}>{region.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addRegion} disabled={!selectedRegion} size="sm">
                        Add
                      </Button>
                    </div>
                    {searchCriteria.locationCriteria.regions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {searchCriteria.locationCriteria.regions.map(region => (
                          <Badge
                            key={region}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-100 border-blue-300 text-blue-700"
                            onClick={() => removeRegion(region)}
                          >
                            {REGIONS.find(r => r.id === region)?.label} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* States */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">States</Label>
                    <div className="flex gap-2">
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addState} disabled={!selectedState} size="sm">
                        Add
                      </Button>
                    </div>
                    {searchCriteria.locationCriteria.states.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {searchCriteria.locationCriteria.states.map(state => (
                          <Badge
                            key={state}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-100 border-green-300 text-green-700"
                            onClick={() => removeState(state)}
                          >
                            {state} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cities */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Cities</Label>
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Enter city name"
                        value={newLocationInput}
                        onChange={(e) => setNewLocationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCity()}
                      />
                      <Button onClick={addCity} disabled={!newLocationInput.trim()} size="sm">
                        Add
                      </Button>
                    </div>
                    {searchCriteria.locationCriteria.cities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {searchCriteria.locationCriteria.cities.map(city => (
                          <Badge
                            key={city}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-100 border-purple-300 text-purple-700"
                            onClick={() => removeCity(city)}
                          >
                            {city} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ZIP Codes with Distance */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">ZIP Codes with Distance</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="ZIP code"
                        value={zipCodeInput}
                        onChange={(e) => setZipCodeInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addZipCode()}
                        maxLength={10}
                      />
                      <Select value={zipCodeDistance.toString()} onValueChange={(value) => setZipCodeDistance(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTANCE_OPTIONS.map(distance => (
                            <SelectItem key={distance} value={distance.toString()}>{distance} miles</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addZipCode} disabled={!zipCodeInput.trim()} size="sm">
                        Add
                      </Button>
                    </div>
                    {searchCriteria.locationCriteria.zipCodes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {searchCriteria.locationCriteria.zipCodes.map(zip => (
                          <Badge
                            key={zip.code}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-100 border-orange-300 text-orange-700"
                            onClick={() => removeZipCode(zip.code)}
                          >
                            {zip.code} ({zip.distance} mi) ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Price Range</Label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {PRICE_PRESETS.map(preset => (
                      <Button
                        key={preset.label}
                        variant={isPricePresetActive(preset) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSearchCriteria(prev => ({ ...prev, priceRange: preset.range }))}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Min Price</Label>
                      <Input
                        type="number"
                        placeholder="50,000"
                        value={searchCriteria.priceRange[0]}
                        onChange={(e) => {
                          const value = Number(e.target.value) || 0;
                          setSearchCriteria(prev => ({
                            ...prev,
                            priceRange: [value, prev.priceRange[1]]
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Max Price</Label>
                      <Input
                        type="number"
                        placeholder="800,000"
                        value={searchCriteria.priceRange[1]}
                        onChange={(e) => {
                          const value = Number(e.target.value) || 0;
                          setSearchCriteria(prev => ({
                            ...prev,
                            priceRange: [prev.priceRange[0], value]
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    ${searchCriteria.priceRange[0].toLocaleString()} - ${searchCriteria.priceRange[1].toLocaleString()}
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Select value={searchCriteria.bedrooms} onValueChange={(value) =>
                      setSearchCriteria(prev => ({ ...prev, bedrooms: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1+">1+</SelectItem>
                        <SelectItem value="2+">2+</SelectItem>
                        <SelectItem value="3+">3+</SelectItem>
                        <SelectItem value="4+">4+</SelectItem>
                        <SelectItem value="5+">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Select value={searchCriteria.bathrooms} onValueChange={(value) =>
                      setSearchCriteria(prev => ({ ...prev, bathrooms: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1+">1+</SelectItem>
                        <SelectItem value="1.5+">1.5+</SelectItem>
                        <SelectItem value="2+">2+</SelectItem>
                        <SelectItem value="2.5+">2.5+</SelectItem>
                        <SelectItem value="3+">3+</SelectItem>
                        <SelectItem value="4+">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Square Footage */}
                <div className="space-y-3">
                  <Label>Square Footage</Label>
                  <div className="px-3">
                    <Slider
                      value={searchCriteria.squareFootage}
                      onValueChange={(value) => setSearchCriteria(prev => ({
                        ...prev,
                        squareFootage: value as [number, number]
                      }))}
                      max={8000}
                      min={500}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{searchCriteria.squareFootage[0].toLocaleString()} sq ft</span>
                      <span>{searchCriteria.squareFootage[1].toLocaleString()} sq ft</span>
                    </div>
                  </div>
                </div>

                {/* Year Built */}
                <div className="space-y-3">
                  <Label>Year Built</Label>
                  <div className="px-3">
                    <Slider
                      value={searchCriteria.yearBuilt}
                      onValueChange={(value) => setSearchCriteria(prev => ({
                        ...prev,
                        yearBuilt: value as [number, number]
                      }))}
                      max={2024}
                      min={1900}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{searchCriteria.yearBuilt[0]}</span>
                      <span>{searchCriteria.yearBuilt[1]}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                {/* Amenities */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITIES.map(amenity => {
                      const isSelected = searchCriteria.amenities.includes(amenity.id);
                      return (
                        <div
                          key={amenity.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSearchCriteria(prev => ({
                            ...prev,
                            amenities: toggleSelection(prev.amenities, amenity.id)
                          }))}
                        >
                          <Checkbox checked={isSelected} readOnly />
                          <span className="text-lg">{amenity.icon}</span>
                          <span className={`text-sm ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                            {amenity.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Requirements</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SPECIAL_REQUIREMENTS.map(req => {
                      const isSelected = searchCriteria.specialRequirements.includes(req.id);
                      const Icon = req.icon;
                      return (
                        <div
                          key={req.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSearchCriteria(prev => ({
                            ...prev,
                            specialRequirements: toggleSelection(prev.specialRequirements, req.id)
                          }))}
                        >
                          <Checkbox checked={isSelected} readOnly />
                          {typeof req.icon === 'string' ? (
                            <span className="text-lg">{req.icon}</span>
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                          <span className={`text-sm ${isSelected ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Budget Tab */}
              <TabsContent value="budget" className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Down Payment</Label>
                      <Input
                        type="number"
                        placeholder="60000"
                        value={searchCriteria.budget.downPayment}
                        onChange={(e) => setSearchCriteria(prev => ({
                          ...prev,
                          budget: { ...prev.budget, downPayment: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Monthly Payment</Label>
                      <Input
                        type="number"
                        placeholder="3500"
                        value={searchCriteria.budget.monthlyPayment}
                        onChange={(e) => setSearchCriteria(prev => ({
                          ...prev,
                          budget: { ...prev.budget, monthlyPayment: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Purchase Timeline</Label>
                    <Select value={searchCriteria.timeline} onValueChange={(value) =>
                      setSearchCriteria(prev => ({ ...prev, timeline: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="When are you looking to buy?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="3months">Within 3 months</SelectItem>
                        <SelectItem value="6months">Within 6 months</SelectItem>
                        <SelectItem value="1year">Within 1 year</SelectItem>
                        <SelectItem value="exploring">Just exploring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            {/* Search Button */}
            <div className="flex gap-3">
              <Button onClick={handleSearch} className="flex-1" size="lg">
                <Search className="w-5 h-5 mr-2" />
                Search MLS Database
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5 mr-2" />
                Save Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
