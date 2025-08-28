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
  Bot,
  Sparkles,
  Filter,
  Target,
  Heart,
  TrendingUp,
  CheckCircle2,
  MessageCircle,
  Send,
  Loader2
} from 'lucide-react';

interface SearchCriteria {
  homeTypes: string[];
  locations: string[];
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
  { id: 'senior-community', label: 'Senior Community', icon: Shield },
  { id: 'gated', label: 'Gated Community', icon: Shield },
  { id: 'waterfront', label: 'Waterfront Property', icon: '🌊' },
  { id: 'mountain-view', label: 'Mountain Views', icon: '🏔️' },
  { id: 'new-construction', label: 'New Construction Only', icon: '🔨' }
];

export default function HomeSearchLanding() {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    homeTypes: [],
    locations: [],
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
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      type: 'ai',
      message: "👋 Hi! I'm your AI home search assistant. I can help you find the perfect home by understanding your needs and searching the MLS database. What kind of home are you looking for?"
    }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState('');

  // Handle AI chat
  const handleAiChat = async () => {
    if (!aiChatInput.trim()) return;

    const userMessage = aiChatInput;
    setAiChatInput('');
    setAiChatMessages(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsAiTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAiResponse(userMessage);
      setAiChatMessages(prev => [...prev, { type: 'ai', message: aiResponse }]);
      setIsAiTyping(false);
    }, 1500);
  };

  const generateAiResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('bedroom') || message.includes('bed')) {
      return "I can help you find homes with the right number of bedrooms! Most families look for 3-4 bedrooms. Based on your family size, I'd recommend considering homes with at least 3 bedrooms for comfort and resale value. Would you like me to search for 3+ bedroom homes in your area?";
    }
    
    if (message.includes('price') || message.includes('budget') || message.includes('cost')) {
      return "Let's talk about your budget! I see you're looking in the $200k-$800k range. Remember to factor in closing costs (2-3% of home price), moving expenses, and immediate repairs. I can search for homes within your budget and show you what's available. What's your comfortable monthly payment including taxes and insurance?";
    }
    
    if (message.includes('location') || message.includes('area') || message.includes('neighborhood')) {
      return "Location is so important! I can search across multiple states and metro areas. I'll consider factors like commute times, school districts, crime rates, and property appreciation. What's most important to you - proximity to work, good schools, or specific amenities? I can pull up comparable data from different areas.";
    }
    
    if (message.includes('first time') || message.includes('first-time')) {
      return "Congratulations on your first home purchase! 🎉 I'll help make this easier. For first-time buyers, I recommend focusing on: move-in ready homes, good neighborhoods with appreciation potential, and staying within 28% of gross income for housing costs. I can also identify homes eligible for first-time buyer programs. Want me to search for beginner-friendly properties?";
    }
    
    if (message.includes('school') || message.includes('education')) {
      return "School districts are crucial for families and resale value! I can filter homes by school ratings and show you district boundaries on the map. I'll also check for nearby private schools and extracurricular opportunities. What grade levels are you most concerned about?";
    }
    
    return "I understand you're looking for the perfect home! Based on what you've told me, I can search the MLS database for properties that match your criteria. I'll also provide insights on market trends, neighborhood data, and help you understand if a property is priced fairly. Would you like me to start a search with your current criteria, or would you like to refine anything first?";
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
          <Bot className="w-8 h-8 text-purple-600" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our AI-powered search helps you discover the perfect home across multiple states using advanced MLS integration. 
          Tell us what you're looking for, and we'll find homes that match your exact needs.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Multi-State Search</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>AI-Powered Matching</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Live MLS Data</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Search Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search Criteria
              </CardTitle>
              <CardDescription>
                Tell us about your ideal home and we'll search across multiple MLSs to find the best matches.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <Label className="text-base font-medium">What type of home are you looking for?</Label>
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
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Where would you like to live?</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter city, state, or ZIP code"
                          value={newLocationInput}
                          onChange={(e) => setNewLocationInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleLocationAdd()}
                        />
                      </div>
                      <Button onClick={handleLocationAdd} disabled={!newLocationInput.trim()}>
                        <MapPin className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {searchCriteria.locations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {searchCriteria.locations.map(location => (
                          <Badge 
                            key={location} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => removeLocation(location)}
                          >
                            {location} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      💡 Add multiple locations to search across different areas and states
                    </p>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Price Range</Label>
                    <div className="px-3">
                      <Slider
                        value={searchCriteria.priceRange}
                        onValueChange={(value) => setSearchCriteria(prev => ({
                          ...prev,
                          priceRange: value as [number, number]
                        }))}
                        max={2000000}
                        min={50000}
                        step={25000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>${searchCriteria.priceRange[0].toLocaleString()}</span>
                        <span>${searchCriteria.priceRange[1].toLocaleString()}</span>
                      </div>
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
                    <Label className="text-base font-medium">Desired Amenities</Label>
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
                    <Label className="text-base font-medium">Special Requirements</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SPECIAL_REQUIREMENTS.map(req => {
                        const isSelected = searchCriteria.specialRequirements.includes(req.id);
                        const Icon = req.icon;
                        return (
                          <div 
                            key={req.id} 
                            className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
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
                            <span className={`text-sm ${isSelected ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
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

                    <Alert>
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Budget Tip:</strong> Remember to factor in closing costs (2-3%), property taxes, 
                        insurance, and potential HOA fees when determining your budget.
                      </AlertDescription>
                    </Alert>
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

        {/* AI Assistant Chat */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                AI Search Assistant
                <Badge variant="secondary" className="ml-auto">Live</Badge>
              </CardTitle>
              <CardDescription>
                Get personalized recommendations and MLS insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
                {aiChatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border shadow-sm p-3 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me about homes, neighborhoods, or market trends..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                />
                <Button onClick={handleAiChat} size="sm" disabled={!aiChatInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* AI Features */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">AI can help with:</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'MLS property search',
                    'Neighborhood analysis',
                    'Market trends & pricing',
                    'School district info',
                    'Commute calculations',
                    'Investment potential'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
