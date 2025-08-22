import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useAI } from './AIContext';
import { usePropertyContext } from './PropertyContext';
import { useIsMobile } from './ui/use-mobile';
import {
  Search,
  MapPin,
  Filter,
  Heart,
  Eye,
  Calculator,
  TrendingUp,
  Home,
  School,
  Car,
  Train,
  ShoppingCart,
  Hospital,
  Trees,
  Wifi,
  Zap,
  Bot,
  Star,
  AlertTriangle,
  Info,
  CheckCircle,
  Navigation,
  Clock,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Users,
  Settings
} from 'lucide-react';

interface SearchFilters {
  location: string;
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  propertyTypes: string[];
  maxDaysOnMarket: number;
  mustHaveFeatures: string[];
  schoolRating: number;
  commutePreferences: {
    maxCommuteTime: number;
    workAddress: string;
    transportMode: string;
  };
  aiPreferences: {
    prioritizeValue: boolean;
    prioritizeAppreciation: boolean;
    prioritizeSchools: boolean;
    prioritizeCommute: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

interface AISearchInsight {
  type: 'tip' | 'warning' | 'opportunity' | 'market';
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

export function AIPropertySearch() {
  const ai = useAI();
  const propertyContext = usePropertyContext();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [searchInsights, setSearchInsights] = useState<AISearchInsight[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    priceRange: [500000, 1000000],
    bedrooms: '',
    bathrooms: '',
    propertyTypes: [],
    maxDaysOnMarket: 30,
    mustHaveFeatures: [],
    schoolRating: 7,
    commutePreferences: {
      maxCommuteTime: 45,
      workAddress: '',
      transportMode: 'driving'
    },
    aiPreferences: {
      prioritizeValue: true,
      prioritizeAppreciation: true,
      prioritizeSchools: false,
      prioritizeCommute: false,
      riskTolerance: 'medium'
    }
  });

  useEffect(() => {
    generateSearchInsights();
  }, [filters]);

  const generateSearchInsights = () => {
    const insights: AISearchInsight[] = [];
    
    // Price range insights
    if (filters.priceRange[1] - filters.priceRange[0] < 100000) {
      insights.push({
        type: 'tip',
        title: 'Narrow Price Range',
        description: 'Your price range is quite specific. Consider expanding it by $50k to see more options.',
        action: 'Expand Range',
        confidence: 85
      });
    }
    
    // Market timing insights
    if (filters.maxDaysOnMarket < 14) {
      insights.push({
        type: 'opportunity',
        title: 'Fresh Listings Only',
        description: 'You\'re focusing on very new listings. This is smart in a competitive market!',
        confidence: 92
      });
    }
    
    // School preference insights
    if (filters.schoolRating > 8 && filters.aiPreferences.prioritizeSchools) {
      insights.push({
        type: 'warning',
        title: 'High School Standards',
        description: 'Requiring 8+ school ratings may limit options significantly. Consider flexibility for great properties.',
        action: 'Adjust Schools',
        confidence: 78
      });
    }
    
    // AI market insight
    insights.push({
      type: 'market',
      title: 'Market Opportunity',
      description: 'Based on current trends, properties in your range are appreciating 12% annually.',
      confidence: 89
    });
    
    setSearchInsights(insights);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate AI search process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Send search context to AI
    ai.sendMessage(`Search for properties with these criteria: ${JSON.stringify(filters, null, 2)}`, {
      action: 'property_search',
      filters
    });
    
    setIsSearching(false);
  };

  const saveCurrentSearch = () => {
    const searchName = `${filters.location || 'Custom'} Search ${savedSearches.length + 1}`;
    const newSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: { ...filters },
      createdAt: new Date(),
      resultCount: Math.floor(Math.random() * 50) + 10
    };
    
    setSavedSearches(prev => [...prev, newSearch]);
    ai.sendMessage(`I've saved your search as "${searchName}". I'll monitor the market and notify you of new matches.`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'market': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'tip': return 'border-l-blue-500';
      case 'warning': return 'border-l-amber-500';
      case 'opportunity': return 'border-l-green-500';
      case 'market': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            AI Property Search
          </h1>
          <p className="text-muted-foreground mt-1">
            Intelligent property discovery powered by AI
          </p>
        </div>
        <Button
          onClick={() => ai.setChatOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Bot className="w-4 h-4" />
          Search Assistant
        </Button>
      </div>

      {/* AI Search Insights */}
      {searchInsights.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            AI Search Insights
          </h3>
          {searchInsights.map((insight, index) => (
            <Alert key={index} className={`border-l-4 ${getInsightBorderColor(insight.type)}`}>
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                  <AlertDescription className="text-xs">
                    {insight.description}
                  </AlertDescription>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="mt-2 h-auto p-1 text-xs">
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Search Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="ai-prefs">AI Preferences</TabsTrigger>
          <TabsTrigger value="saved">Saved Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Quick Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Quick Search
              </CardTitle>
              <CardDescription>
                Start your search with a location, address, or neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter city, neighborhood, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="min-w-32"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              
              {/* Quick Filter Tags */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '$500K-$750K', value: () => setFilters(prev => ({ ...prev, priceRange: [500000, 750000] })) },
                  { label: '3+ Bedrooms', value: () => setFilters(prev => ({ ...prev, bedrooms: '3+' })) },
                  { label: 'New Listings', value: () => setFilters(prev => ({ ...prev, maxDaysOnMarket: 7 })) },
                  { label: 'Great Schools', value: () => setFilters(prev => ({ ...prev, schoolRating: 8 })) },
                ].map((tag, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={tag.value}
                    className="text-xs"
                  >
                    {tag.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                  min={200000}
                  max={2000000}
                  step={25000}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    Bedrooms
                  </Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="flex items-center gap-2">
                    <Bath className="w-4 h-4" />
                    Bathrooms
                  </Label>
                  <Select
                    value={filters.bathrooms}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="1.5">1.5+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="2.5">2.5+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          {/* Property Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Single Family',
                  'Condominium',
                  'Townhouse',
                  'Duplex'
                ].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={filters.propertyTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters(prev => ({ 
                            ...prev, 
                            propertyTypes: [...prev.propertyTypes, type] 
                          }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev, 
                            propertyTypes: prev.propertyTypes.filter(t => t !== type) 
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Must-Have Features */}
          <Card>
            <CardHeader>
              <CardTitle>Must-Have Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Garage/Parking', icon: Car },
                  { label: 'Updated Kitchen', icon: Home },
                  { label: 'Hardwood Floors', icon: Square },
                  { label: 'Fireplace', icon: Home },
                  { label: 'Yard/Garden', icon: Trees },
                  { label: 'Pool', icon: Home }
                ].map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.label} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.label}
                        checked={filters.mustHaveFeatures.includes(feature.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({ 
                              ...prev, 
                              mustHaveFeatures: [...prev.mustHaveFeatures, feature.label] 
                            }));
                          } else {
                            setFilters(prev => ({ 
                              ...prev, 
                              mustHaveFeatures: prev.mustHaveFeatures.filter(f => f !== feature.label) 
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={feature.label} className="text-sm flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        {feature.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Market Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Market Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Maximum Days on Market: {filters.maxDaysOnMarket} days</Label>
                <Slider
                  value={[filters.maxDaysOnMarket]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, maxDaysOnMarket: value[0] }))}
                  min={1}
                  max={180}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fresh listings</span>
                  <span>Any timing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                School Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum School Rating: {filters.schoolRating}/10</Label>
                <Slider
                  value={[filters.schoolRating]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, schoolRating: value[0] }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Any rating</span>
                  <span>Excellent schools</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-prefs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Search Preferences
              </CardTitle>
              <CardDescription>
                Help AI understand what matters most to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Prioritize Value/Good Deals</Label>
                    <p className="text-sm text-muted-foreground">Find properties below market value</p>
                  </div>
                  <Switch
                    checked={filters.aiPreferences.prioritizeValue}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      aiPreferences: { ...prev.aiPreferences, prioritizeValue: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Prioritize Appreciation Potential</Label>
                    <p className="text-sm text-muted-foreground">Focus on properties likely to increase in value</p>
                  </div>
                  <Switch
                    checked={filters.aiPreferences.prioritizeAppreciation}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      aiPreferences: { ...prev.aiPreferences, prioritizeAppreciation: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Prioritize School Quality</Label>
                    <p className="text-sm text-muted-foreground">Weight school ratings heavily in recommendations</p>
                  </div>
                  <Switch
                    checked={filters.aiPreferences.prioritizeSchools}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      aiPreferences: { ...prev.aiPreferences, prioritizeSchools: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Prioritize Commute</Label>
                    <p className="text-sm text-muted-foreground">Consider travel time to work/important locations</p>
                  </div>
                  <Switch
                    checked={filters.aiPreferences.prioritizeCommute}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      aiPreferences: { ...prev.aiPreferences, prioritizeCommute: checked }
                    }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Risk Tolerance</Label>
                <Select
                  value={filters.aiPreferences.riskTolerance}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setFilters(prev => ({
                    ...prev,
                    aiPreferences: { ...prev.aiPreferences, riskTolerance: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Conservative - Established neighborhoods, proven value</SelectItem>
                    <SelectItem value="medium">Balanced - Mix of stability and growth potential</SelectItem>
                    <SelectItem value="high">Aggressive - Emerging areas, higher upside potential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Commute Preferences */}
              {filters.aiPreferences.prioritizeCommute && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium">Commute Preferences</h4>
                  
                  <div className="space-y-2">
                    <Label>Work/Important Address</Label>
                    <Input
                      placeholder="Enter work address or important location"
                      value={filters.commutePreferences.workAddress}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        commutePreferences: { ...prev.commutePreferences, workAddress: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum Commute Time: {filters.commutePreferences.maxCommuteTime} minutes</Label>
                    <Slider
                      value={[filters.commutePreferences.maxCommuteTime]}
                      onValueChange={(value) => setFilters(prev => ({
                        ...prev,
                        commutePreferences: { ...prev.commutePreferences, maxCommuteTime: value[0] }
                      }))}
                      min={15}
                      max={90}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transportation Mode</Label>
                    <Select
                      value={filters.commutePreferences.transportMode}
                      onValueChange={(value) => setFilters(prev => ({
                        ...prev,
                        commutePreferences: { ...prev.commutePreferences, transportMode: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driving">Driving</SelectItem>
                        <SelectItem value="transit">Public Transit</SelectItem>
                        <SelectItem value="walking">Walking</SelectItem>
                        <SelectItem value="cycling">Cycling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Saved Searches</h2>
            <Button onClick={saveCurrentSearch} className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Save Current Search
            </Button>
          </div>
          
          {savedSearches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <Search className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-medium">No Saved Searches Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save your searches to get notified when new matching properties become available
                  </p>
                </div>
                <Button onClick={saveCurrentSearch}>Save Your First Search</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <Card key={search.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{search.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{search.resultCount} properties found</span>
                          <span>Created {search.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{formatPrice(search.filters.priceRange[0])} - {formatPrice(search.filters.priceRange[1])}</Badge>
                          {search.filters.bedrooms && <Badge variant="outline">{search.filters.bedrooms} bed</Badge>}
                          {search.filters.location && <Badge variant="outline">{search.filters.location}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="flex gap-4 p-6">
          <Button onClick={handleSearch} className="flex-1" disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search Properties'}
          </Button>
          <Button variant="outline" onClick={saveCurrentSearch}>
            <Heart className="w-4 h-4 mr-2" />
            Save Search
          </Button>
          <Button variant="outline" onClick={() => ai.sendMessage('Help me refine my search criteria')}>
            <Bot className="w-4 h-4 mr-2" />
            AI Assistance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}