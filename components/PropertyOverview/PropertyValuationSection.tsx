import { Fragment } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { DollarSign, TrendingUp, Calendar, PieChart, Receipt } from 'lucide-react';
import { PropertyBasicProfileData } from '../../types/propertyBasicProfile';

interface PropertyValuationSectionProps {
  propertyData: PropertyBasicProfileData;
  mappedData?: any;
}

export function PropertyValuationSection({ propertyData, mappedData }: PropertyValuationSectionProps) {
  // FIXED: Improved helper function to get mapped value or fallback to original
  const getMappedValue = (targetField: string, fallback: any) => {
    if (mappedData && targetField) {
      const keys = targetField.split('.');
      let value = mappedData;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          break;
        }
      }
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return fallback;
  };

  // FIXED: Helper to safely access expanded profile data
  const getExpandedValue = (path: string) => {
    if (!propertyData) return null;
    
    const keys = path.split('.');
    let value = propertyData;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  };

  // FIXED: Get the best available value with proper precedence
  const getBestValue = (mappedField: string, ...fallbackPaths: string[]) => {
    const mappedValue = getMappedValue(mappedField, null);
    if (mappedValue !== null && mappedValue !== undefined && mappedValue !== '') {
      return mappedValue;
    }
    
    for (const path of fallbackPaths) {
      const value = getExpandedValue(path);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    
    return null;
  };

  // Format currency values
  const formatCurrency = (value: any) => {
    if (value === null || value === undefined || value === '') return 'Not available';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'Not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Format date values
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Check if we have any valuation data to display
  const hasValuationData = getExpandedValue('assessment') || getExpandedValue('market') || getExpandedValue('avm');

  if (!hasValuationData) {
    return null;
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Property Valuation & Financial Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FIXED: Current Market Value with expanded profile data */}
          {(getExpandedValue('avm') || getExpandedValue('market')) && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Current Market Value
              </h4>
              <div className="space-y-3">
                {/* AVM Estimate */}
                {(getExpandedValue('avm.amount.value') || getExpandedValue('avm.amount')) && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-green-600 font-medium">AVM Estimated Value</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(getBestValue('property.valuation.estimatedValue', 
                          'avm.amount.value', 
                          'avm.amount'))}
                      </p>
                      {getExpandedValue('avm.eventDate') && (
                        <p className="text-sm text-green-600">
                          As of {formatDate(getExpandedValue('avm.eventDate'))}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Market indicators */}
                <div className="space-y-2 text-sm">
                  {getBestValue('property.valuation.pricePerSquareFoot', 'avm.amount.pricePerSqft') && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per Sq Ft:</span>
                      <span className="font-semibold">
                        {formatCurrency(getBestValue('property.valuation.pricePerSquareFoot', 'avm.amount.pricePerSqft'))}
                      </span>
                    </div>
                  )}

                  {/* Value range */}
                  {(getExpandedValue('avm.amount.high') || getExpandedValue('avm.amount.low')) && (
                    <Fragment>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Value Range:</span>
                        <span className="font-semibold">
                          {formatCurrency(getExpandedValue('avm.amount.low'))} - {formatCurrency(getExpandedValue('avm.amount.high'))}
                        </span>
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FIXED: Sale History with expanded profile data */}
          {getExpandedValue('market') && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Sale History
              </h4>
              <div className="space-y-3">
                {/* Most recent sale */}
                {(getExpandedValue('market.saleHistory') && Array.isArray(getExpandedValue('market.saleHistory'))) && (
                  <Fragment>
                    {getExpandedValue('market.saleHistory').slice(0, 3).map((sale: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {formatCurrency(getBestValue(`property.saleHistory[${index}].price`, `market.saleHistory[${index}].saleAmt`))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(getBestValue(`property.saleHistory[${index}].date`, `market.saleHistory[${index}].saleTransDate`))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {getBestValue(`property.saleHistory[${index}].type`, `market.saleHistory[${index}].saleTransType`, 'Sale')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Fragment>
                )}

                {/* FIXED: Single sale data fallback */}
                {(!getExpandedValue('market.saleHistory') || !Array.isArray(getExpandedValue('market.saleHistory'))) && (
                  <Fragment>
                    {(getBestValue('property.sale.lastPrice', 'market.saleAmt') || getBestValue('property.sale.lastDate', 'market.saleTransDate')) && (
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {formatCurrency(getBestValue('property.sale.lastPrice', 'market.saleAmt'))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(getBestValue('property.sale.lastDate', 'market.saleTransDate'))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {getBestValue('property.sale.lastType', 'market.saleTransType', 'Last Sale')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Fragment>
                )}
              </div>
            </div>
          )}

          {/* FIXED: Assessment Data with expanded profile data */}
          {getExpandedValue('assessment') && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Tax Assessment
              </h4>
              <div className="space-y-2 text-sm">
                {/* Assessed values */}
                {getBestValue('property.assessment.totalValue', 'assessment.assessed.assdTtlValue') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assessed Value:</span>
                    <span className="font-semibold">
                      {formatCurrency(getBestValue('property.assessment.totalValue', 'assessment.assessed.assdTtlValue'))}
                    </span>
                  </div>
                )}

                {getBestValue('property.assessment.landValue', 'assessment.assessed.assdLandValue') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Land Value:</span>
                    <span className="font-semibold">
                      {formatCurrency(getBestValue('property.assessment.landValue', 'assessment.assessed.assdLandValue'))}
                    </span>
                  </div>
                )}

                {getBestValue('property.assessment.improvementValue', 'assessment.assessed.assdImpValue') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Improvement Value:</span>
                    <span className="font-semibold">
                      {formatCurrency(getBestValue('property.assessment.improvementValue', 'assessment.assessed.assdImpValue'))}
                    </span>
                  </div>
                )}

                <Separator className="my-2" />

                {/* Tax information */}
                {getBestValue('property.tax.annualAmount', 'assessment.tax.taxAmt') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Tax:</span>
                    <span className="font-semibold">
                      {formatCurrency(getBestValue('property.tax.annualAmount', 'assessment.tax.taxAmt'))}
                    </span>
                  </div>
                )}

                {getBestValue('property.tax.taxYear', 'assessment.tax.taxYear') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Year:</span>
                    <span className="font-semibold">
                      {getBestValue('property.tax.taxYear', 'assessment.tax.taxYear')}
                    </span>
                  </div>
                )}

                {getBestValue('property.assessment.year', 'assessment.assessed.assdYear') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assessment Year:</span>
                    <span className="font-semibold">
                      {getBestValue('property.assessment.year', 'assessment.assessed.assdYear')}
                    </span>
                  </div>
                )}

                {/* FIXED: Add tax rate and exemptions from expanded data */}
                {getExpandedValue('assessment.tax.taxRate') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Rate:</span>
                    <span className="font-semibold">
                      {getExpandedValue('assessment.tax.taxRate')}%
                    </span>
                  </div>
                )}

                {getBestValue('property.assessment.exemptions', 'assessment.tax.exemptions') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exemptions:</span>
                    <span className="font-semibold">
                      {formatCurrency(getBestValue('property.assessment.exemptions', 'assessment.tax.exemptions'))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FIXED: Market Value vs Assessment Comparison */}
          {(getExpandedValue('assessment') && getExpandedValue('avm')) && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Value Comparison
              </h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Value:</span>
                      <span className="font-semibold">
                        {formatCurrency(getBestValue('property.valuation.estimatedValue', 'avm.amount.value', 'avm.amount'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assessed Value:</span>
                      <span className="font-semibold">
                        {formatCurrency(getBestValue('property.assessment.totalValue', 'assessment.assessed.assdTtlValue'))}
                      </span>
                    </div>
                    
                    {/* Calculate ratio if both values exist */}
                    {(() => {
                      const marketValue = getBestValue('property.valuation.estimatedValue', 'avm.amount.value', 'avm.amount');
                      const assessedValue = getBestValue('property.assessment.totalValue', 'assessment.assessed.assdTtlValue');
                      
                      if (marketValue && assessedValue) {
                        const ratio = (assessedValue / marketValue * 100).toFixed(1);
                        return (
                          <div className="flex justify-between pt-1 border-t">
                            <span className="text-muted-foreground text-xs">Assessment Ratio:</span>
                            <span className="font-semibold text-xs">{ratio}%</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}