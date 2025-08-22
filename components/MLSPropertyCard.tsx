import { Fragment } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useIsMobile } from './ui/use-mobile';
import { MLSProperty } from '../types/mls';
import { formatCurrency, formatSquareFeet, formatLotSize, formatPropertyType } from '../hooks/useMLSData';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Eye,
  ExternalLink,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Info
} from 'lucide-react';

interface MLSPropertyCardProps {
  property: MLSProperty;
  onSelect?: (property: MLSProperty) => void;
  onSave?: (property: MLSProperty) => void;
  onShare?: (property: MLSProperty) => void;
  compact?: boolean;
  showPhotos?: boolean;
  className?: string;
}

export function MLSPropertyCard({
  property,
  onSelect,
  onSave,
  onShare,
  compact = false,
  showPhotos = true,
  className = ""
}: MLSPropertyCardProps) {
  const isMobile = useIsMobile();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const photos = property.photos || [];
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentPhotoIndex] : null;

  // Navigate photos
  const nextPhoto = () => {
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  // Handle save toggle
  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(property);
  };

  // Handle share
  const handleShare = () => {
    onShare?.(property);
  };

  // Handle select
  const handleSelect = () => {
    onSelect?.(property);
  };

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

  // Format bedrooms/bathrooms
  const formatBedBath = () => {
    const beds = property.property_details.bedrooms;
    const baths = property.property_details.bathrooms;
    const parts = [];
    
    if (beds) parts.push(`${beds} bed${beds !== 1 ? 's' : ''}`);
    if (baths) parts.push(`${baths} bath${baths !== 1 ? 's' : ''}`);
    
    return parts.join(', ') || 'N/A';
  };

  if (compact) {
    return (
      <Card className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`} onClick={handleSelect}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Photo thumbnail */}
            {showPhotos && hasPhotos && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={currentPhoto?.thumbnail_url || currentPhoto?.url}
                  alt="Property"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Property info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{property.address.street}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {property.address.city}, {property.address.state} {property.address.zip_code}
                  </p>
                </div>
                <Badge variant="outline" className={`ml-2 text-xs ${getStatusColor(property.listing_details.status)}`}>
                  {property.listing_details.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatBedBath()}</span>
                {property.property_details.square_feet && (
                  <span>{formatSquareFeet(property.property_details.square_feet)}</span>
                )}
                {property.listing_details.list_price && (
                  <span className="font-medium text-foreground">
                    {formatCurrency(property.listing_details.list_price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* Photo carousel */}
      {showPhotos && hasPhotos && (
        <div className="relative aspect-video bg-gray-100">
          <img
            src={currentPhoto?.url}
            alt={currentPhoto?.caption || "Property photo"}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTAwSDIyNVY4MEgyMzVWMTMwSDE3NVYxMDBaIiBmaWxsPSIjOTlBMkE5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxNDBIMTc1VjEyMFoiIGZpbGw9IiM5OUEyQTkiLz4KPHRleHQgeD0iMjAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NzY3NjciIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />

          {/* Photo navigation */}
          {photos.length > 1 && (
            <Fragment>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Fragment>
          )}

          {/* Photo indicator */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Photo counter */}
          {hasPhotos && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {photos.length}
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`bg-white/80 hover:bg-white/90 w-8 h-8 p-0 ${isSaved ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white/90 w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold truncate">{property.address.street}</h3>
              <Badge variant="outline" className={`${getStatusColor(property.listing_details.status)}`}>
                {property.listing_details.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm truncate">
                {property.address.city}, {property.address.state} {property.address.zip_code}
              </span>
            </div>
            {property.mls_number && (
              <div className="text-xs text-muted-foreground">
                MLS: {property.mls_number}
              </div>
            )}
          </div>
          
          {property.listing_details.list_price && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(property.listing_details.list_price)}
              </div>
              {property.listing_details.price_per_sqft && (
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(property.listing_details.price_per_sqft)}/sq ft
                </div>
              )}
            </div>
          )}
        </div>

        {/* Key details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {property.property_details.bedrooms || 'N/A'} bed{property.property_details.bedrooms !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {property.property_details.bathrooms || 'N/A'} bath{property.property_details.bathrooms !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {formatSquareFeet(property.property_details.square_feet)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {formatPropertyType(property.property_details.property_type)}
            </span>
          </div>
        </div>

        {/* Additional details */}
        <div className="space-y-2 mb-4">
          {property.property_details.year_built && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Built in {property.property_details.year_built}</span>
            </div>
          )}
          
          {property.property_details.lot_size_sqft && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Maximize className="w-4 h-4" />
              <span>Lot: {formatLotSize(property.property_details.lot_size_sqft, property.property_details.lot_size_acres)}</span>
            </div>
          )}

          {property.listing_details.days_on_market && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{property.listing_details.days_on_market} days on market</span>
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {property.description}
            </p>
          </div>
        )}

        <Separator className="mb-4" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {property.listing_details.listing_agent && (
              <div className="text-xs text-muted-foreground">
                Listed by {property.listing_details.listing_agent.name}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelect}
              className={isMobile ? 'mobile-button-sm' : ''}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
            {onSelect && (
              <Button
                onClick={handleSelect}
                className={isMobile ? 'mobile-button-sm' : ''}
              >
                Select Property
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}