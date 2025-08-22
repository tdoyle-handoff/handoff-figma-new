import { Fragment } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, AlertTriangle, MapPin, FileText, TestTube, Loader2 } from 'lucide-react';
import { AddressInputEnhanced, AttomAddressComponents } from './AddressInputEnhanced';
import { useIsMobile } from './ui/use-mobile';
import { useAddressValidation } from '../hooks/useAddressValidation';

export function AddressValidationDemo() {
  const [selectedAddress, setSelectedAddress] = useState<AttomAddressComponents | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const isMobile = useIsMobile();
  const { validateAddress, isValidating, lastValidation, error: validationError, clearValidation } = useAddressValidation();

  const handleAddressSelect = (address: AttomAddressComponents | null) => {
    setSelectedAddress(address);
    clearValidation(); // Clear previous validation when address changes
  };

  const testAddresses = [
    '123 Main Street, New York, NY 10001',
    '5 Whitney Drive, Greenwich, CT 06831',
    '456 Oak Avenue, Los Angeles, CA 90210',
    '789 Pine Street, Chicago, IL 60601',
    'Invalid address format test'
  ];

  const loadTestAddress = (address: string) => {
    setManualAddress(address);
    clearValidation();
  };

  const testWithAttomAPI = async () => {
    if (!selectedAddress) return;
    await validateAddress(selectedAddress);
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'page-content-mobile' : 'page-content'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-8 h-8 text-primary" />
            <h1>Address Validation Demo</h1>
          </div>
          <p className="text-muted-foreground">
            Test the enhanced address input with ATTOM-compatible formatting and validation
          </p>
        </div>

        {/* Main Address Input */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <CardTitle>Enhanced Address Input</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddressInputEnhanced
              id="demo-address"
              label="Property Address"
              placeholder="Start typing or use test addresses below..."
              value={manualAddress}
              onChange={handleAddressSelect}
              onInputChange={setManualAddress}
              required={true}
              country="US"
              types={["address"]}
              showBreakdown={true}
              validateForAttom={true}
              debugMode={true}
            />
          </CardContent>
        </Card>

        {/* Test Address Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Addresses</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click any address below to test the validation
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testAddresses.map((address, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => loadTestAddress(address)}
                  className="justify-start text-left h-auto py-3 px-4"
                >
                  <div className="flex items-start gap-2 w-full">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">{address}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        {selectedAddress && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Validation Results</CardTitle>
                <div className="flex items-center gap-2">
                  {selectedAddress.is_valid ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Valid for ATTOM
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Has Issues
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Original vs ATTOM Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Original Input</h4>
                  <div className="p-3 bg-muted rounded font-mono text-sm">
                    {selectedAddress.formatted_address}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">ATTOM API Format</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      <strong>Line 1:</strong> {selectedAddress.address1}
                    </div>
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      <strong>Line 2:</strong> {selectedAddress.address2}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Address Components</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Number</div>
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      {selectedAddress.street_number || '?'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Street</div>
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      {selectedAddress.street_name ? (selectedAddress.street_name.substring(0, 12) + (selectedAddress.street_name.length > 12 ? '...' : '')) : '?'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">City</div>
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      {selectedAddress.city || '?'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">State</div>
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      {selectedAddress.state || '?'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">ZIP</div>
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      {selectedAddress.zip_code || '?'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Issues */}
              {selectedAddress.validation_errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Validation Issues</h4>
                  <div className="space-y-2">
                    {selectedAddress.validation_errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {/* ATTOM API Test Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">ATTOM API Validation Test</h4>
                  <Button
                    onClick={testWithAttomAPI}
                    disabled={!selectedAddress || !selectedAddress.is_valid || isValidating}
                    variant="outline"
                    size="sm"
                  >
                    {isValidating ? (
                      <Fragment>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </Fragment>
                    ) : (
                      <Fragment>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test with ATTOM
                      </Fragment>
                    )}
                  </Button>
                </div>

                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <div className="text-sm text-red-700">
                        <strong>Validation Error:</strong> {validationError}
                      </div>
                    </div>
                  </div>
                )}

                {lastValidation && (
                  <div className="space-y-3">
                    <div className={`p-4 border rounded ${
                      lastValidation.validation.attom_found 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        {lastValidation.validation.attom_found ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        <h5 className="font-medium">
                          {lastValidation.validation.attom_found 
                            ? 'Found in ATTOM Database' 
                            : 'Not Found in ATTOM Database'
                          }
                        </h5>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          {lastValidation.validation.address1_valid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <span>Address1 Format</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lastValidation.validation.address2_valid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <span>Address2 Format</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lastValidation.validation.formatted_valid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <span>Formatted Address</span>
                        </div>
                      </div>

                      {lastValidation.recommendations.length > 0 && (
                        <div>
                          <strong className="text-sm">Recommendations:</strong>
                          <ul className="mt-1 space-y-1">
                            {lastValidation.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {lastValidation.validation.errors.length > 0 && (
                        <div className="mt-3">
                          <strong className="text-sm text-red-600">Errors:</strong>
                          <ul className="mt-1 space-y-1">
                            {lastValidation.validation.errors.map((error, index) => (
                              <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedAddress.is_valid && !lastValidation && (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Ready for ATTOM API</h4>
                      <p className="text-sm text-green-700 mt-1">
                        This address is properly formatted and validated for use with ATTOM Data API.
                        Click "Test with ATTOM" to verify it exists in their database.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Output for Developers */}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-sm">Developer: View JSON Output</summary>
                <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto">
                  {JSON.stringify(selectedAddress, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}