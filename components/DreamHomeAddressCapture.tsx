import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useAddressValidation } from '../hooks/useAddressValidation';
import type { AttomAddressComponents } from './AddressInputEnhanced';

interface Props {
  className?: string;
  onValidated?: (addr: AttomAddressComponents) => void;
  onStartOnboarding?: () => void;
}

export default function DreamHomeAddressCapture({ className = '', onValidated, onStartOnboarding }: Props) {
  const [streetNumber, setStreetNumber] = React.useState('');
  const [streetName, setStreetName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [zip, setZip] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState<string>('');

  const { validateAddress, isValidating } = useAddressValidation();

  const composeAttomAddress = (): AttomAddressComponents => {
    const address1 = `${streetNumber.trim()} ${streetName.trim()}`.trim();
    const address2 = `${city.trim()}, ${state.trim()} ${zip.trim()}`.trim();
    const formatted_address = [address1, address2].filter(Boolean).join(', ');
    return {
      address1,
      address2,
      street_number: streetNumber.trim(),
      street_name: streetName.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      zip_code: zip.trim(),
      formatted_address,
      is_valid: false,
      validation_errors: []
    };
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('validating');
    setMessage('');

    const attomAddr = composeAttomAddress();

    // Quick client checks
    const errs: string[] = [];
    if (!attomAddr.street_number) errs.push('Street number is required');
    if (!attomAddr.street_name) errs.push('Street name is required');
    if (!attomAddr.city) errs.push('City is required');
    if (!attomAddr.state || attomAddr.state.length !== 2) errs.push('State must be 2 letters');
    if (!attomAddr.zip_code || !/^\d{5}(?:-\d{4})?$/.test(attomAddr.zip_code)) errs.push('Valid ZIP is required');
    if (errs.length) {
      setStatus('error');
      setMessage(errs.join('\n'));
      return;
    }

    try {
      const result = await validateAddress(attomAddr);
      if (result?.success && result.validation?.formatted_valid) {
        setStatus('success');
        setMessage('Address validated!');
        try {
          sessionStorage.setItem('preOnboardingAddress', JSON.stringify(attomAddr));
        } catch {}
        onValidated?.(attomAddr);
      } else {
        setStatus('error');
        const errs = result?.validation?.errors?.join('\n') || 'Address could not be validated.';
        setMessage(errs);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Validation failed.');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Found your dream home?</CardTitle>
        <CardDescription>Enter the address to learn more. We’ll format it for ATTOM automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleValidate}>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="streetNumber">Street No.</Label>
              <Input id="streetNumber" value={streetNumber} onChange={e => setStreetNumber(e.target.value)} placeholder="123" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="streetName">Street Name</Label>
              <Input id="streetName" value={streetName} onChange={e => setStreetName(e.target.value)} placeholder="Main St" />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={e => setState(e.target.value.toUpperCase().slice(0,2))} placeholder="NY" maxLength={2} />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" value={zip} onChange={e => setZip(e.target.value)} placeholder="10001" />
            </div>
          </div>

          {status !== 'idle' && (
            <div className={`text-sm ${status === 'error' ? 'text-red-600' : status === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
              {message}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" disabled={isValidating}>
              {isValidating ? 'Checking…' : 'Check address'}
            </Button>
            {status === 'success' && (
              <Button type="button" variant="outline" onClick={onStartOnboarding}>
                Start onboarding
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

