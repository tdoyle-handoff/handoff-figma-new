import { Fragment } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useIsMobile } from './ui/use-mobile';
import { MLSProperty } from '../types/mls';
import { formatCurrency, formatSquareFeet, formatLotSize, formatPropertyType } from '../hooks/useMLSData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Home,
  Car,
  Thermometer,
  Droplets,
  Zap,
  Trees,
  Users,
  Building,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Share2,
  Heart,
  ArrowLeft,
  Calculator,
  Eye,
  AlertCircle,
  CheckCircle2,
  School,
  Navigation
} from 'lucide-react';

interface MLSPropertyDetailsProps {
  property: MLSProperty;
  onBack?: () => void;
  onSelect?: (property: MLSProperty) => void;
  onSave?: (property: MLSProperty) => void;
  onShare?: (property: MLSProperty) => void;
  onScheduleViewing?: (property: MLSProperty) => void;
  className?: string;
}

export function MLSPropertyDetails({
  property,
  onBack,
  onSelect,
  onSave,
  onShare,
  onScheduleViewing,
  className = ""
}: MLSPropertyDetailsProps) {
  const isMobile = useIsMobile();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const photos = property.photos || [];
  const hasPhotos = photos.length > 0;

  // Handle save toggle
  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(property);
  };

  // Calculate estimated monthly payment
  const calculateEstimatedPayment = () => {
    if (!property.listing_details.list_price) return null;
    
    const price = property.listing_details.list_price;
    const downPayment = price * 0.20; // 20% down
    const loanAmount = price - downPayment;
    const annualRate = 0.07; // 7% annual rate
    const monthlyRate = annualRate / 12;
    const termMonths = 30 * 12; // 30 years
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    const propertyTaxes = (property.financial_details?.property_taxes || price * 0.012) / 12;
    const insurance = price * 0.0035 / 12; // Estimate 0.35% annually
    const hoaFees = property.financial_details?.hoa_fees || 0;
    
    return {
      principal_interest: monthlyPayment,
      property_taxes: propertyTaxes,
      insurance: insurance,
      hoa: hoaFees,
      total: monthlyPayment + propertyTaxes + insurance + hoaFees
    };
  };

  const monthlyPayment = calculateEstimatedPayment();

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Sold': return 'bg-red-100 text-red-800 border-red-200';
      case 'Withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Expired': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className={`flex items-center gap-4 mb-6 ${isMobile ? 'sticky top-0 bg-background z-10 py-4 -mx-4 px-4' : ''}`}>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`font-bold truncate ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              {property.address.street}
            </h1>
            <Badge variant="outline" className={getStatusColor(property.listing_details.status)}>
              {property.listing_details.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm truncate">
              {property.address.city}, {property.address.state} {property.address.zip_code}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={isSaved ? 'text-red-500' : ''}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => onShare?.(property)}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Photo Gallery */}
      {hasPhotos && (
        <Card className="mb-6 overflow-hidden">
          <div className="relative">
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {/* Main photo */}
              <div className={`${isMobile ? 'aspect-video' : 'col-span-2 aspect-video'} bg-gray-100 overflow-hidden`}>
                <ImageWithFallback
                  src={photos[currentPhotoIndex]?.high_res_url || photos[currentPhotoIndex]?.url}
                  alt={photos[currentPhotoIndex]?.caption || "Property photo"}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setCurrentPhotoIndex(currentPhotoIndex)}
                />
              </div>
              
              {/* Thumbnail grid */}
              {!isMobile && photos.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {photos.slice(1, 5).map((photo, index) => (
                    <div 
                      key={photo.id}
                      className="aspect-square bg-gray-100 overflow-hidden cursor-pointer rounded-lg hover:opacity-80 transition-opacity"
                      onClick={() => setCurrentPhotoIndex(index + 1)}
                    >
                      <ImageWithFallback
                        src={photo.thumbnail_url || photo.url}
                        alt={photo.caption || `Property photo ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  
                  {photos.length > 5 && (
                    <div className="aspect-square bg-gray-900/80 flex items-center justify-center text-white font-semibold rounded-lg cursor-pointer hover:bg-gray-900/90 transition-colors">
                      +{photos.length - 5} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile photo navigation */}
            {isMobile && photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/60'
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Price and Key Details */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {/* Price */}
            <div className="space-y-2">
              {property.listing_details.list_price && (
                <Fragment>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(property.listing_details.list_price)}
                  </div>
                  {property.listing_details.price_per_sqft && (
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(property.listing_details.price_per_sqft)}/sq ft
                    </div>
                  )}
                  {property.listing_details.original_list_price && 
                   property.listing_details.original_list_price !== property.listing_details.list_price && (
                    <div className="text-sm text-muted-foreground">
                      Originally {formatCurrency(property.listing_details.original_list_price)}
                    </div>
                  )}
                </Fragment>
              )}
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{property.property_details.bedrooms || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">Bedroom{property.property_details.bedrooms !== 1 ? 's' : ''}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{property.property_details.bathrooms || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">Bathroom{property.property_details.bathrooms !== 1 ? 's' : ''}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Maximize className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{property.property_details.square_feet?.toLocaleString() || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">Sq Ft</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Trees className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {property.property_details.lot_size_acres 
                      ? `${property.property_details.lot_size_acres} ac`
                      : property.property_details.lot_size_sqft
                        ? `${Math.round(property.property_details.lot_size_sqft / 1000)}K sq ft`
                        : 'N/A'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">Lot Size</div>
                </div>
              </div>
            </div>

            {/* Estimated Payment */}
            {monthlyPayment && (
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Est. Monthly Payment</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatCurrency(monthlyPayment.total)}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Principal & Interest: {formatCurrency(monthlyPayment.principal_interest)}</div>
                  <div>Taxes & Insurance: {formatCurrency(monthlyPayment.property_taxes + monthlyPayment.insurance)}</div>
{monthlyPayment.hoa > 0 && <div>Homeowners Association (HOA): {formatCurrency(monthlyPayment.hoa)}</div>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-4' : 'grid-cols-6'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          {!isMobile && <TabsTrigger value="history">History</TabsTrigger>}
          {!isMobile && <TabsTrigger value="contact">Contact</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Property Description */}
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Property Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.property_details.year_built && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Built {property.property_details.year_built}</span>
                  </div>
                )}
                
                {property.property_details.stories && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.property_details.stories} stor{property.property_details.stories !== 1 ? 'ies' : 'y'}</span>
                  </div>
                )}
                
                {property.property_details.garage_spaces && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.property_details.garage_spaces} car garage</span>
                  </div>
                )}
                
                {property.property_details.pool && (
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Pool</span>
                  </div>
                )}
                
                {property.property_details.fireplace && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Fireplace</span>
                  </div>
                )}
                
                {property.property_details.central_air && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Central Air</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Features */}
          {property.features && property.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.features.slice(0, 12).map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Type</span>
                      <span>{formatPropertyType(property.property_details.property_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built</span>
                      <span>{property.property_details.year_built || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Square Feet</span>
                      <span>{formatSquareFeet(property.property_details.square_feet)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lot Size</span>
                      <span>{formatLotSize(property.property_details.lot_size_sqft, property.property_details.lot_size_acres)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stories</span>
                      <span>{property.property_details.stories || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Systems & Features</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Heating</span>
                      <span>{property.property_details.heating_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cooling</span>
                      <span>{property.property_details.cooling_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exterior</span>
                      <span>{property.property_details.exterior_material || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Foundation</span>
                      <span>{property.property_details.foundation_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roof</span>
                      <span>{property.property_details.roof_type || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pricing */}
                <div>
                  <h4 className="font-medium mb-3">Pricing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">List Price</span>
                      <span className="font-medium">{formatCurrency(property.listing_details.list_price)}</span>
                    </div>
                    {property.listing_details.original_list_price && 
                     property.listing_details.original_list_price !== property.listing_details.list_price && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span>{formatCurrency(property.listing_details.original_list_price)}</span>
                      </div>
                    )}
                    {property.listing_details.price_per_sqft && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per Sq Ft</span>
                        <span>{formatCurrency(property.listing_details.price_per_sqft)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Monthly Costs */}
                {monthlyPayment && (
                  <div>
                    <h4 className="font-medium mb-3">Estimated Monthly Costs</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal & Interest</span>
                        <span>{formatCurrency(monthlyPayment.principal_interest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Taxes</span>
                        <span>{formatCurrency(monthlyPayment.property_taxes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurance</span>
                        <span>{formatCurrency(monthlyPayment.insurance)}</span>
                      </div>
                      {monthlyPayment.hoa > 0 && (
                        <div className="flex justify-between">
<span className="text-muted-foreground">Homeowners Association (HOA) Fees</span>
                          <span>{formatCurrency(monthlyPayment.hoa)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Monthly</span>
                        <span>{formatCurrency(monthlyPayment.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Costs */}
                <div>
                  <h4 className="font-medium mb-3">Additional Information</h4>
                  <div className="space-y-2">
                    {property.financial_details?.property_taxes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Property Taxes</span>
                        <span>{formatCurrency(property.financial_details.property_taxes)}</span>
                      </div>
                    )}
                    {property.financial_details?.hoa_fees && (
                      <div className="flex justify-between">
<span className="text-muted-foreground">Monthly Homeowners Association (HOA) Fees</span>
                        <span>{formatCurrency(property.financial_details.hoa_fees)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Location & Neighborhood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Address */}
                <div>
                  <h4 className="font-medium mb-3">Address</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <div>{property.address.formatted}</div>
                      {property.address.coordinates && (
                        <div className="text-sm text-muted-foreground">
                          {property.address.coordinates.latitude.toFixed(6)}, {property.address.coordinates.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Neighborhood */}
                {property.neighborhood && (
                  <div>
                    <h4 className="font-medium mb-3">Neighborhood Scores</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {property.neighborhood.walk_score && (
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{property.neighborhood.walk_score}</div>
                          <div className="text-sm text-muted-foreground">Walk Score</div>
                        </div>
                      )}
                      {property.neighborhood.transit_score && (
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{property.neighborhood.transit_score}</div>
                          <div className="text-sm text-muted-foreground">Transit Score</div>
                        </div>
                      )}
                      {property.neighborhood.bike_score && (
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{property.neighborhood.bike_score}</div>
                          <div className="text-sm text-muted-foreground">Bike Score</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Schools */}
                {property.schools && property.schools.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <School className="w-4 h-4" />
                      Nearby Schools
                    </h4>
                    <div className="space-y-3">
                      {property.schools.slice(0, 5).map((school, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{school.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {school.type} • {school.distance_miles?.toFixed(1)} miles
                            </div>
                          </div>
                          {school.rating && (
                            <div className="text-center">
                              <div className="text-lg font-bold">{school.rating}/10</div>
                              <div className="text-xs text-muted-foreground">Rating</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={getStatusColor(property.listing_details.status)}>
                    {property.listing_details.status}
                  </Badge>
                </div>
                
                {property.listing_details.list_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listed Date</span>
                    <span>{new Date(property.listing_details.list_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {property.listing_details.days_on_market && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days on Market</span>
                    <span>{property.listing_details.days_on_market} days</span>
                  </div>
                )}
                
                {property.listing_details.sold_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sold Date</span>
                    <span>{new Date(property.listing_details.sold_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {property.listing_details.sold_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sold Price</span>
                    <span className="font-medium">{formatCurrency(property.listing_details.sold_price)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comparable Sales */}
          {property.market_data?.comparable_sales && property.market_data.comparable_sales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Comparable Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.market_data.comparable_sales.slice(0, 3).map((comp, index) => (
                    <div key={comp.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{comp.address}</div>
                          <div className="text-sm text-muted-foreground">
                            {comp.bedrooms}br • {comp.bathrooms}ba • {comp.square_feet?.toLocaleString()} sq ft
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(comp.sold_price)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(comp.sold_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{comp.distance_miles?.toFixed(1)} miles away</span>
                        {comp.price_per_sqft && (
                          <span>{formatCurrency(comp.price_per_sqft)}/sq ft</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          {property.listing_details.listing_agent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Listing Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">{property.listing_details.listing_agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.listing_details.listing_agent.company}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {property.listing_details.listing_agent.phone && (
                      <Button variant="outline" className="justify-start" asChild>
                        <a href={`tel:${property.listing_details.listing_agent.phone}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          {property.listing_details.listing_agent.phone}
                        </a>
                      </Button>
                    )}
                    
                    {property.listing_details.listing_agent.email && (
                      <Button variant="outline" className="justify-start" asChild>
                        <a href={`mailto:${property.listing_details.listing_agent.email}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          {property.listing_details.listing_agent.email}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {property.listing_details.listing_office && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Listing Office
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="font-medium">{property.listing_details.listing_office.name}</div>
                  
                  {property.listing_details.listing_office.phone && (
                    <Button variant="outline" className="justify-start" asChild>
                      <a href={`tel:${property.listing_details.listing_office.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        {property.listing_details.listing_office.phone}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {onScheduleViewing && (
          <Button variant="outline" onClick={() => onScheduleViewing(property)}>
            <Eye className="w-4 h-4 mr-2" />
            Schedule Viewing
          </Button>
        )}
        
        <Button variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(property.address.formatted)}`, '_blank')}>
          <Navigation className="w-4 h-4 mr-2" />
          View on Map
        </Button>
        
        {onSelect && (
          <Button onClick={() => onSelect(property)}>
            Select This Property
          </Button>
        )}
      </div>
    </div>
  );
}