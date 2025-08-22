import { useState, useCallback } from 'react';
import { projectId, SUPABASE_ANON_KEY } from '../utils/supabase/info';
import type { AttomAddressComponents } from '../components/AddressInputEnhanced';

interface AddressValidationResult {
  address1_valid: boolean;
  address2_valid: boolean;
  formatted_valid: boolean;
  attom_found: boolean;
  errors: string[];
}

interface AddressValidationResponse {
  success: boolean;
  validation: AddressValidationResult;
  recommendations: string[];
  timestamp: string;
}

export function useAddressValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<AddressValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAddress = useCallback(async (addressComponents: AttomAddressComponents): Promise<AddressValidationResponse | null> => {
    if (!addressComponents) return null;

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a24396d5/attom/validate-address`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            address1: addressComponents.address1,
            address2: addressComponents.address2,
            formatted_address: addressComponents.formatted_address
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const data: AddressValidationResponse = await response.json();
      console.log('Address validation result:', data);
      
      setLastValidation(data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Address validation error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setLastValidation(null);
    setError(null);
  }, []);

  return {
    validateAddress,
    isValidating,
    lastValidation,
    error,
    clearValidation
  };
}