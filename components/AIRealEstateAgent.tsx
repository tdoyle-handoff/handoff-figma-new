import { Fragment } from "react";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { usePropertyContext } from "./PropertyContext";
import { useAI } from "./AIContext";
import { useIsMobile } from "./ui/use-mobile";
import {
  Bot,
  Home,
  TrendingUp,
  MessageSquare,
  FileText,
  Users,
  Search,
  Calculator,
  Handshake,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Phone,
  Mail,
  Clock,
  Target,
  Briefcase,
  Shield,
  Zap,
  BookOpen,
  Settings,
  BarChart3,
  Eye,
  PlusCircle,
  Filter,
  Heart,
} from "lucide-react";

interface AIAgentService {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "available" | "active" | "completed" | "pending";
  progress?: number;
  priority: "high" | "medium" | "low";
  estimatedTime?: string;
  features: string[];
}

interface PropertyListing {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize?: string;
  yearBuilt?: number;
  propertyType: string;
  listingDate: string;
  daysOnMarket: number;
  mlsNumber: string;
  photos: string[];
  description: string;
  features: string[];
  neighborhood: string;
  schools?: {
    elementary?: string;
    middle?: string;
    high?: string;
    ratings?: { elementary?: number; middle?: number; high?: number };
  };
  marketAnalysis: {
    pricePerSqFt: number;
    comparables: number;
    marketTrend: "rising" | "stable" | "declining";
    competitiveRating: number;
  };
  aiRecommendation: {
    score: number;
    reasons: string[];
    concerns: string[];
    offerGuidance: string;
  };
}

export function AIRealEstateAgent() {
  const propertyContext = usePropertyContext();
  const ai = useAI();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("overview");
  const [agentServices, setAgentServices] = useState<AIAgentService[]>([]);
  const [propertyListings, setPropertyListings] = useState<PropertyListing[]>(
    [],
  );
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<any>({});

  useEffect(() => {
    initializeAgentServices();
    loadPropertyListings();
    loadMarketInsights();
  }, []);

  const initializeAgentServices = () => {
    const services: AIAgentService[] = [
      {
        id: "property-search",
        name: "Property Search & Discovery",
        description: "AI-powered property matching and recommendations",
        icon: Search,
        status: "available",
        priority: "high",
        estimatedTime: "Real-time",
        features: [
          "Smart property matching based on your preferences",
          "Real-time MLS integration and updates",
          "Neighborhood insights and school ratings",
          "Comparable property analysis",
          "AI-powered listing recommendations",
        ],
      },
      {
        id: "market-analysis",
        name: "Market Analysis & Pricing",
        description: "Comprehensive market intelligence and pricing guidance",
        icon: TrendingUp,
        status: "available",
        priority: "high",
        estimatedTime: "5 minutes",
        features: [
          "Real-time market trend analysis",
          "Comparable sales and pricing insights",
          "Neighborhood price predictions",
          "Investment potential assessment",
          "Best time to buy recommendations",
        ],
      },
      {
        id: "offer-negotiation",
        name: "Offer & Negotiation Assistant",
        description:
          "Strategic guidance for competitive offers and negotiations",
        icon: Handshake,
        status: "pending",
        priority: "high",
        estimatedTime: "15 minutes",
        features: [
          "Competitive offer strategy development",
          "Negotiation talking points and tactics",
          "Contract term recommendations",
          "Counteroffer response guidance",
          "Market positioning analysis",
        ],
      },
      {
        id: "professional-network",
        name: "Professional Network",
        description:
          "Connect with vetted lenders, inspectors, and service providers",
        icon: Users,
        status: "available",
        priority: "medium",
        estimatedTime: "Instant",
        features: [
          "Vetted mortgage lender recommendations",
          "Certified home inspector network",
          "Real estate attorney referrals",
          "Insurance agent connections",
          "Contractor and service provider directory",
        ],
      },
      {
        id: "document-automation",
        name: "Document Preparation & Review",
        description:
          "AI-powered contract preparation and legal document review",
        icon: FileText,
        status: "available",
        priority: "medium",
        estimatedTime: "30 minutes",
        features: [
          "Purchase agreement preparation",
          "Disclosure document review",
          "Contract term analysis and recommendations",
          "Document compliance verification",
          "E-signature workflow management",
        ],
      },
      {
        id: "communication-hub",
        name: "Communication Center",
        description: "Centralized communication with all transaction parties",
        icon: MessageSquare,
        status: "available",
        priority: "low",
        estimatedTime: "Ongoing",
        features: [
          "Automated status updates to all parties",
          "Schedule coordination for showings and inspections",
          "Document sharing and collaboration",
          "Milestone notifications and reminders",
          "Multi-party communication threads",
        ],
      },
    ];

    setAgentServices(services);
  };

  const loadPropertyListings = () => {
    // Simulate property listings with AI recommendations
    const listings: PropertyListing[] = [
      {
        id: "prop-001",
        address: "123 Oak Street, Riverside Heights, CA 95814",
        price: 750000,
        bedrooms: 3,
        bathrooms: 2.5,
        squareFootage: 1850,
        lotSize: "0.25 acres",
        yearBuilt: 2018,
        propertyType: "Single Family",
        listingDate: "2024-01-15",
        daysOnMarket: 8,
        mlsNumber: "MLS#12345678",
        photos: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        ],
        description:
          "Beautiful modern home in desirable Riverside Heights neighborhood. Updated kitchen with quartz countertops, open floor plan, and large backyard perfect for entertaining.",
        features: [
          "Updated Kitchen",
          "Hardwood Floors",
          "Two-Car Garage",
          "Backyard",
          "Modern Appliances",
        ],
        neighborhood: "Riverside Heights",
        schools: {
          elementary: "Riverside Elementary",
          middle: "Heights Middle School",
          high: "Riverside High School",
          ratings: { elementary: 9, middle: 8, high: 9 },
        },
        marketAnalysis: {
          pricePerSqFt: 405,
          comparables: 12,
          marketTrend: "rising",
          competitiveRating: 8.5,
        },
        aiRecommendation: {
          score: 92,
          reasons: [
            "Matches your budget and size requirements perfectly",
            "Excellent school district ratings align with your preferences",
            "Strong appreciation potential based on neighborhood trends",
            "Recent updates reduce immediate maintenance costs",
            "Low days on market indicates competitive pricing",
          ],
          concerns: [
            "Popular neighborhood may lead to bidding war",
            "Consider inspection of 2018 construction quality",
          ],
          offerGuidance:
            "Recommend offering 2-3% above asking price with competitive terms. Include inspection contingency but short timeframe.",
        },
      },
      {
        id: "prop-002",
        address: "456 Maple Drive, Garden Valley, CA 95825",
        price: 680000,
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: 2100,
        lotSize: "0.3 acres",
        yearBuilt: 2015,
        propertyType: "Single Family",
        listingDate: "2024-01-10",
        daysOnMarket: 13,
        mlsNumber: "MLS#12345679",
        photos: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        ],
        description:
          "Spacious family home with 4 bedrooms and large lot. Great for growing families, with excellent schools nearby.",
        features: [
          "4 Bedrooms",
          "Large Lot",
          "Family Room",
          "Dining Room",
          "Patio",
        ],
        neighborhood: "Garden Valley",
        schools: {
          elementary: "Garden Elementary",
          middle: "Valley Middle School",
          high: "Garden Valley High",
          ratings: { elementary: 7, middle: 7, high: 8 },
        },
        marketAnalysis: {
          pricePerSqFt: 324,
          comparables: 8,
          marketTrend: "stable",
          competitiveRating: 7.2,
        },
        aiRecommendation: {
          score: 78,
          reasons: [
            "More space than minimum requirements",
            "Lower price per square foot than target area",
            "Larger lot provides expansion opportunities",
          ],
          concerns: [
            "School ratings below your preferred minimum",
            "13 days on market may indicate pricing issues",
            "May need updates to kitchen and bathrooms",
          ],
          offerGuidance:
            "Consider offering 5-7% below asking price. Include contingencies for inspection and repairs.",
        },
      },
    ];

    setPropertyListings(listings);
  };

  const loadMarketInsights = () => {
    setMarketInsights({
      averagePrice: 725000,
      pricePerSqFt: 385,
      daysOnMarket: 18,
      inventoryLevel: "Low",
      marketTrend: "Seller's Market",
      appreciation12Month: 8.5,
      appreciation5Year: 45.2,
      competitionLevel: "High",
      bestTimeToOffer: "Within 3 days of listing",
      recommendations: [
        "Act quickly on well-priced properties in your target area",
        "Consider offering above asking price for competitive properties",
        "Get pre-approval letter to strengthen your position",
        "Be flexible on closing timeline to appeal to sellers",
        "Consider waiving minor contingencies in competitive situations",
      ],
      neighborhoodInsights: {
        "Riverside Heights": {
          avgPrice: 780000,
          trend: "Rising rapidly",
          competition: "Very High",
          appreciation: 12.3,
        },
        "Garden Valley": {
          avgPrice: 645000,
          trend: "Stable growth",
          competition: "Moderate",
          appreciation: 6.8,
        },
      },
    });
  };

  const handleServiceAction = (serviceId: string) => {
    switch (serviceId) {
      case "property-search":
        setActiveTab("properties");
        break;
      case "market-analysis":
        setActiveTab("market");
        break;
      case "offer-negotiation":
        ai.sendMessage("I need help preparing an offer for a property");
        break;
      case "professional-network":
        setActiveTab("network");
        break;
      case "document-automation":
        setActiveTab("documents");
        break;
      case "communication-hub":
        setActiveTab("communications");
        break;
      default:
        ai.sendMessage(`Tell me more about ${serviceId}`);
    }
  };

  const handleSaveProperty = (propertyId: string) => {
    setSavedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId],
    );
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const ServiceCard = ({ service }: { service: AIAgentService }) => {
    const Icon = service.icon;

    return (
      <Card
        className="hover:shadow-md transition-all duration-200 cursor-pointer h-full"
        onClick={() => handleServiceAction(service.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{service.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={getServiceStatusColor(service.status)}
                    variant="outline"
                  >
                    {service.status}
                  </Badge>
                  <span
                    className={`text-xs ${getPriorityColor(service.priority)}`}
                  >
                    {service.priority} priority
                  </span>
                </div>
              </div>
            </div>
          </div>
          <CardDescription className="text-sm mt-2">
            {service.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {service.estimatedTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{service.estimatedTime}</span>
              </div>
            )}

            <div className="space-y-1">
              {service.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}
              {service.features.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{service.features.length - 3} more features
                </div>
              )}
            </div>

            <Button
              className="w-full mt-4"
              variant={service.status === "available" ? "default" : "outline"}
            >
              {service.status === "available" && "Start Service"}
              {service.status === "active" && "View Progress"}
              {service.status === "completed" && "View Results"}
              {service.status === "pending" && "View Status"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PropertyCard = ({ property }: { property: PropertyListing }) => {
    const isSaved = savedProperties.includes(property.id);

    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <div className="relative">
          <img
            src={property.photos[0]}
            alt={property.address}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => handleSaveProperty(property.id)}
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </Button>
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            AI Score: {property.aiRecommendation.score}
          </Badge>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {formatPrice(property.price)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {property.address}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                property.marketAnalysis.marketTrend === "rising"
                  ? "border-green-200 text-green-800"
                  : property.marketAnalysis.marketTrend === "declining"
                    ? "border-red-200 text-red-800"
                    : "border-blue-200 text-blue-800"
              }
            >
              {property.marketAnalysis.marketTrend}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{property.bedrooms}</div>
              <div className="text-muted-foreground">Beds</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{property.bathrooms}</div>
              <div className="text-muted-foreground">Baths</div>
            </div>
            <div className="text-center">
              <div className="font-medium">
                {property.squareFootage.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Sq Ft</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>MLS# {property.mlsNumber}</span>
            <span>{property.daysOnMarket} days on market</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                AI Recommendation Score
              </span>
              <span className="text-sm font-bold text-primary">
                {property.aiRecommendation.score}/100
              </span>
            </div>
            <Progress value={property.aiRecommendation.score} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-green-600">
              Why This Property:
            </div>
            <ul className="text-xs space-y-1">
              {property.aiRecommendation.reasons
                .slice(0, 2)
                .map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
            </ul>
          </div>

          {property.aiRecommendation.concerns.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-amber-600">
                Consider:
              </div>
              <ul className="text-xs space-y-1">
                {property.aiRecommendation.concerns
                  .slice(0, 1)
                  .map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{concern}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t space-y-2">
            <Button
              className="w-full"
              onClick={() =>
                ai.sendMessage(`Tell me more about ${property.address}`)
              }
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details & Analysis
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                ai.sendMessage(
                  `Help me prepare an offer for ${property.address}`,
                )
              }
            >
              <Calculator className="w-4 h-4 mr-2" />
              Prepare Offer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${isMobile ? "p-4" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            AI Real Estate Agent
          </h1>
          <p className="text-muted-foreground mt-1">
            Your intelligent real estate partner - replacing traditional agent
            services with AI
          </p>
        </div>
        <Button
          onClick={() => ai.setChatOpen(true)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Ask Your Agent
        </Button>
      </div>

      {/* Agent Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Agent Services Overview
          </CardTitle>
          <CardDescription>
            Comprehensive real estate services powered by artificial
            intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-green-700">Available Services</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-blue-700">Always Available</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">$0</div>
              <div className="text-sm text-purple-700">Commission Fee</div>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your AI agent provides all traditional real estate services
              without commissions, available 24/7 with instant responses and
              data-driven insights.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Service Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="properties" className="text-xs">
            Properties
          </TabsTrigger>
          <TabsTrigger value="market" className="text-xs">
            Market
          </TabsTrigger>
          <TabsTrigger value="network" className="text-xs">
            Network
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            Documents
          </TabsTrigger>
          <TabsTrigger value="communications" className="text-xs">
            Comms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agentServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI-Curated Properties</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  ai.sendMessage("Help me refine my property search")
                }
              >
                <Settings className="w-4 h-4 mr-2" />
                Search Preferences
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {propertyListings.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <Search className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="font-medium">Want to see more properties?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  I can search thousands of listings and find perfect matches
                  for you
                </p>
              </div>
              <Button
                onClick={() =>
                  ai.sendMessage(
                    "Show me more properties that match my criteria",
                  )
                }
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Expand Search
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <h2 className="text-2xl font-bold">Market Intelligence</h2>

          {marketInsights && (
            <Fragment>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(marketInsights.averagePrice)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Price
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {marketInsights.pricePerSqFt}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Price per Sq Ft
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {marketInsights.daysOnMarket}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Days on Market
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {marketInsights.appreciation12Month}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      12-Month Growth
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    AI Market Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketInsights.recommendations.map(
                      (rec: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Neighborhood Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(marketInsights.neighborhoodInsights).map(
                      ([name, data]: [string, any]) => (
                        <div key={name} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{name}</h4>
                            <Badge variant="outline">
                              {data.competition} Competition
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium">
                                {formatPrice(data.avgPrice)}
                              </div>
                              <div className="text-muted-foreground">
                                Avg Price
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">
                                {data.appreciation}%
                              </div>
                              <div className="text-muted-foreground">
                                Growth
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{data.trend}</div>
                              <div className="text-muted-foreground">Trend</div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </Fragment>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <h2 className="text-2xl font-bold">Professional Network</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                type: "Mortgage Lenders",
                icon: DollarSign,
                count: 12,
                rating: 4.8,
              },
              { type: "Home Inspectors", icon: Shield, count: 8, rating: 4.9 },
              {
                type: "Real Estate Attorneys",
                icon: FileText,
                count: 6,
                rating: 4.7,
              },
              {
                type: "Insurance Agents",
                icon: Briefcase,
                count: 10,
                rating: 4.6,
              },
              {
                type: "General Contractors",
                icon: Settings,
                count: 15,
                rating: 4.5,
              },
              { type: "Appraisers", icon: BarChart3, count: 7, rating: 4.8 },
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.type}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{category.count} vetted professionals</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{category.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      View Recommendations
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Alert>
            <Users className="w-4 h-4" />
            <AlertDescription>
              All professionals in our network are pre-vetted, highly rated, and
              offer competitive rates. Your AI agent has already negotiated
              preferred pricing for you.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <h2 className="text-2xl font-bold">Document Center</h2>
          <p className="text-muted-foreground">
            AI-powered document preparation and review
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Preparation</CardTitle>
                <CardDescription>
                  Let AI prepare your real estate documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Purchase Agreement",
                  "Disclosure Forms",
                  "Inspection Contingency",
                  "Financing Contingency",
                  "Seller Response Forms",
                ].map((doc, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Prepare {doc}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Review</CardTitle>
                <CardDescription>
                  Upload documents for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Upload Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drop files here or click to browse
                  </p>
                  <Button>Choose Files</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <h2 className="text-2xl font-bold">Communication Center</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Active Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      party: "Listing Agent",
                      lastMessage: "Seller accepted your offer!",
                      time: "2 hours ago",
                      unread: true,
                    },
                    {
                      party: "Loan Officer",
                      lastMessage: "Pre-approval documents ready",
                      time: "1 day ago",
                      unread: false,
                    },
                    {
                      party: "Home Inspector",
                      lastMessage: "Inspection scheduled for Friday",
                      time: "2 days ago",
                      unread: false,
                    },
                  ].map((convo, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{convo.party}</span>
                        <span className="text-xs text-muted-foreground">
                          {convo.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {convo.lastMessage}
                        </span>
                        {convo.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      event: "Home Inspection",
                      date: "Friday, Jan 26",
                      time: "10:00 AM",
                    },
                    {
                      event: "Appraisal",
                      date: "Monday, Jan 29",
                      time: "2:00 PM",
                    },
                    {
                      event: "Final Walkthrough",
                      date: "Wednesday, Jan 31",
                      time: "4:00 PM",
                    },
                  ].map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{event.event}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.date} at {event.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
