import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Calculator } from 'lucide-react';

export default function InsuranceCalculator() {
  return (
<Card className="shadow-sm">
      <CardHeader>
<CardTitle className="text-base">Insurance Calculator</CardTitle>
        <CardDescription>
          Estimate your insurance costs based on your property details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Home Value</label>
              <Input placeholder="$450,000" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Year Built</label>
              <Input placeholder="2018" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Square Footage</label>
              <Input placeholder="2,400" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Construction Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select construction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frame">Frame</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                  <SelectItem value="brick">Brick</SelectItem>
                  <SelectItem value="steel">Steel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Location Risk Factors</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Flood zone</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Hurricane zone</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Earthquake zone</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Safety Features</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Security system</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Fire sprinkler system</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Storm shutters</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-4">Estimated Annual Premiums</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Homeowners Insurance</span>
              <span className="font-medium">$1,500</span>
            </div>
            <div className="flex justify-between">
              <span>Flood Insurance</span>
              <span className="font-medium">$540</span>
            </div>
            <div className="flex justify-between">
              <span>Wind/Hurricane Insurance</span>
              <span className="font-medium">$720</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Bundle Discount</span>
              <span>-$180</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Estimated Cost</span>
              <span>$2,580/year</span>
            </div>
            <p className="text-sm text-muted-foreground">*This is an estimate. Actual rates may vary based on additional factors.</p>
          </div>
        </div>

        <Button className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Get Accurate Quotes
        </Button>
      </CardContent>
    </Card>
  );
}
