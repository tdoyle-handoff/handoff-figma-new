import React, { useState } from 'react';
import { AddressInput } from './AddressInput';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, CheckCircle2, Home } from 'lucide-react';
import type { AddressDetails } from '../hooks/useAddressAutocomplete';

export function AddressDemo() {
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleAddressChange = (address: AddressDetails | null) => {
    setSelectedAddress(address);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <Home className="w-8 h-8 text-blue-600 mx-auto" />
        <h2 className="text-2xl">Address Autocomplete Demo</h2>
        <p className="text-gray-600">
          Start typing an address to see suggested addresses appear as you type
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Property Address</h3>
            <p className="text-sm text-gray-600">
              Type at least 3 characters to see address suggestions
            </p>
          </div>

          <AddressInput
            label="Address"
            placeholder="Start typing an address... (e.g., 123 Main St)"
            value={inputValue}
            onChange={handleAddressChange}
            onInputChange={handleInputChange}
            required
            autoFocus
            debugMode={true}
          />

          {/* Status indicators */}
          <div className="flex gap-2">
            {inputValue.length > 0 && inputValue.length < 3 && (
              <Badge variant="secondary">
                Type {3 - inputValue.length} more characters
              </Badge>
            )}
            {inputValue.length >= 3 && !selectedAddress && (
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                Searching for addresses...
              </Badge>
            )}
            {selectedAddress && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Address selected
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Selected address details */}
      {selectedAddress && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-800">Selected Address Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Full Address:</span> {selectedAddress.formatted_address}
              </div>
              {selectedAddress.street_number && selectedAddress.route && (
                <div>
                  <span className="font-medium">Street:</span> {selectedAddress.street_number} {selectedAddress.route}
                </div>
              )}
              {selectedAddress.locality && (
                <div>
                  <span className="font-medium">City:</span> {selectedAddress.locality}
                </div>
              )}
              {selectedAddress.administrative_area_level_1 && (
                <div>
                  <span className="font-medium">State:</span> {selectedAddress.administrative_area_level_1}
                </div>
              )}
              {selectedAddress.postal_code && (
                <div>
                  <span className="font-medium">ZIP Code:</span> {selectedAddress.postal_code}
                </div>
              )}
              {selectedAddress.geometry && (
                <div>
                  <span className="font-medium">Coordinates:</span> {selectedAddress.geometry.location.lat.toFixed(6)}, {selectedAddress.geometry.location.lng.toFixed(6)}
                </div>
              )}
              <div>
                <span className="font-medium">Place ID:</span> {selectedAddress.place_id}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-800">How to Use Address Autocomplete</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="font-medium text-blue-600">1.</span>
              Start typing an address in the input field above
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-blue-600">2.</span>
              After typing 3+ characters, suggested addresses will appear
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-blue-600">3.</span>
              Click on a suggestion or use arrow keys + Enter to select
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-blue-600">4.</span>
              The selected address details will be displayed below
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}