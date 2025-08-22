import { Fragment } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MapPin, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Code, 
  Lightbulb,
  Navigation,
  Key,
  Globe,
  Zap
} from 'lucide-react';
import AddressAutocompleteInput, { formatAddressComponents, validateAddressCompleteness } from './AddressAutocompleteInput';
import { PropertyAddressFormExample } from './PropertyAddressForm';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import type { AddressDetails } from '../hooks/useAddressAutocomplete';

export function AddressAPIDemo() {
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [demoMode, setDemoMode] = useState<'basic' | 'validation' | 'form'>('basic');

  // API status check
  const { apiKeyValid, fallbackMode } = useAddressAutocomplete({
    debugMode: true
  });

  const addressComponents = selectedAddress ? formatAddressComponents(selectedAddress) : null;
  const validation = validateAddressCompleteness(selectedAddress);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Google Places API Integration</h1>
            <p className="text-muted-foreground">
              Real-time address validation and autocomplete for Handoff
            </p>
          </div>
        </div>

        {/* API Status */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant={apiKeyValid ? 'default' : 'secondary'} className="flex items-center gap-2">
            {apiKeyValid ? (
              <Fragment>
                <CheckCircle className="h-3 w-3" />
                Google Places API Connected
              </Fragment>
            ) : (
              <Fragment>
                <AlertCircle className="h-3 w-3" />
                {fallbackMode ? 'Fallback Mode Active' : 'Checking API...'}
              </Fragment>
            )}
          </Badge>
          
          {fallbackMode && (
            <Badge variant="outline" className="flex items-center gap-2">
              <Navigation className="h-3 w-3" />
              Manual Entry Available
            </Badge>
          )}
        </div>
      </div>

      {/* Demo Tabs */}
      <Tabs value={demoMode} onValueChange={(value) => setDemoMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Basic Demo
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Form Integration
          </TabsTrigger>
        </TabsList>

        {/* Basic Demo */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Basic Address Autocomplete
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Start typing an address to see Google Places API suggestions in real-time.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddressAutocompleteInput
                label="Try Address Autocomplete"
                placeholder="Start typing an address... (e.g., 1600 Amphitheatre)"
                onChange={setSelectedAddress}
                showValidationStatus={true}
                debugMode={true}
                helperText="Type at least 3 characters to see suggestions"
              />

              {selectedAddress && (
                <div className="space-y-4">
                  <h3 className="font-medium">Selected Address Details:</h3>
                  
                  {/* Raw Address Data */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Formatted Address</h4>
                    <p className="text-sm font-mono bg-background p-2 rounded border">
                      {selectedAddress.formatted_address}
                    </p>
                  </div>

                  {/* Address Components */}
                  {addressComponents && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Parsed Components</h4>
                        <div className="space-y-2">
                          <div className="p-2 bg-background rounded border">
                            <div className="text-xs text-muted-foreground">Street Address</div>
                            <div className="font-medium">{addressComponents.streetAddress || 'N/A'}</div>
                          </div>
                          <div className="p-2 bg-background rounded border">
                            <div className="text-xs text-muted-foreground">City</div>
                            <div className="font-medium">{addressComponents.city || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Location Data</h4>
                        <div className="space-y-2">
                          <div className="p-2 bg-background rounded border">
                            <div className="text-xs text-muted-foreground">State</div>
                            <div className="font-medium">{addressComponents.state || 'N/A'}</div>
                          </div>
                          <div className="p-2 bg-background rounded border">
                            <div className="text-xs text-muted-foreground">ZIP Code</div>
                            <div className="font-medium">{addressComponents.zipCode || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Place ID and Source */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">Technical Details</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><strong>Place ID:</strong> {selectedAddress.place_id}</div>
                      <div><strong>Source:</strong> {selectedAddress.place_id.startsWith('manual_') ? 'Manual Entry' : 'Google Places API'}</div>
                      {selectedAddress.geometry && (
                        <div>
                          <strong>Coordinates:</strong> {selectedAddress.geometry.location.lat.toFixed(6)}, {selectedAddress.geometry.location.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Demo */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Address Validation & Completeness
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                See how addresses are validated and what completeness checks are performed.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddressAutocompleteInput
                label="Address for Validation"
                placeholder="Enter an address to see validation results..."
                onChange={setSelectedAddress}
                showValidationStatus={true}
                debugMode={true}
              />

              {selectedAddress && (
                <div className="space-y-4">
                  {/* Validation Status */}
                  <div className={`p-4 rounded-lg border ${
                    validation.isValid 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="font-medium">
                        Validation Status: {validation.isValid ? 'Valid' : 'Needs Attention'}
                      </span>
                    </div>
                    
                    {validation.missingFields.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                          Missing Required Fields:
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                          {validation.missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validation.warnings.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          Validation Warnings:
                        </div>
                        <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Completeness Score */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Address Completeness Checklist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { field: 'formatted_address', label: 'Formatted Address', value: selectedAddress.formatted_address },
                        { field: 'street_number', label: 'Street Number', value: selectedAddress.street_number },
                        { field: 'route', label: 'Street Name', value: selectedAddress.route },
                        { field: 'locality', label: 'City', value: selectedAddress.locality },
                        { field: 'administrative_area_level_1', label: 'State', value: selectedAddress.administrative_area_level_1 },
                        { field: 'postal_code', label: 'ZIP Code', value: selectedAddress.postal_code },
                        { field: 'country', label: 'Country', value: selectedAddress.country },
                      ].map((item) => (
                        <div key={item.field} className="flex items-center gap-2 p-2 bg-background rounded border">
                          {item.value ? (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.value || 'Not provided'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Integration Demo */}
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Complete Form Integration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                See how the address autocomplete integrates into a complete property setup form.
              </p>
            </CardHeader>
            <CardContent>
              <PropertyAddressFormExample />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Real-time Suggestions</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get instant address suggestions as you type, powered by Google Places API with 3+ character activation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Smart Validation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatic validation of address completeness with detailed feedback and missing field detection.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Navigation className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Fallback Support</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Seamless fallback to manual entry when API is unavailable, ensuring users can always complete forms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Mobile Optimized</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Fully responsive design with touch-friendly interactions and proper mobile keyboard handling.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Key className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Keyboard Navigation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Full keyboard support with arrow keys, enter to select, and escape to close suggestions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Smart Parsing</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatic parsing of address components into structured data for easy integration with property systems.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Implementation Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>API Key Setup:</strong> Make sure your Google Places API key is configured in the environment variables. 
                The system will automatically fall back to manual entry if the API is unavailable.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Key Features:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Google Places API autocomplete</li>
                  <li>Real-time address validation</li>
                  <li>Automatic component parsing</li>
                  <li>Keyboard and touch navigation</li>
                  <li>Manual entry fallback</li>
                  <li>Mobile-optimized interface</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Integration Points:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Property setup forms</li>
                  <li>Address verification flows</li>
                  <li>Contact information forms</li>
                  <li>Shipping address inputs</li>
                  <li>Location-based searches</li>
                  <li>Multi-step wizards</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddressAPIDemo;