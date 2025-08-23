import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Search, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const salesAnalyticsData = [
  { day: 'THU', value: 45 },
  { day: 'WED', value: 52 },
  { day: 'TUE', value: 38 },
  { day: 'FRI', value: 65 },
  { day: 'SAT', value: 72 },
];

const propertyTypeData = [
  { name: 'House', value: 29, color: '#3B82F6' },
  { name: 'Apartment', value: 36, color: '#60A5FA' },
  { name: 'Villa', value: 15, color: '#93C5FD' },
  { name: 'Other', value: 20, color: '#E5E7EB' },
];

const soldAllTimeData = [
  { name: 'Sold', value: 25, color: '#3B82F6' },
  { name: 'Available', value: 50, color: '#60A5FA' },
  { name: 'Pending', value: 15, color: '#93C5FD' },
  { name: 'Reserved', value: 10, color: '#E5E7EB' },
];

const propertyListings = [
  {
    id: 1,
    name: 'Opulence Oasis',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=80&fit=crop&crop=center',
    price: 75860,
    change: '+5%',
    changeType: 'positive'
  },
  {
    id: 2,
    name: 'Golden Apartment',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=100&h=80&fit=crop&crop=center',
    price: 24490,
    change: '-3%',
    changeType: 'negative'
  },
  {
    id: 3,
    name: 'Lakeview Lofts',
    image: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=100&h=80&fit=crop&crop=center',
    price: 75860,
    change: '+12%',
    changeType: 'positive'
  },
];

const tableData = [
  { name: 'Opulence Oasis', type: 'Sale', price: 9548.00 },
  { name: 'Golden Apartment', type: 'Rent', price: 2207.87 },
  { name: 'Mountain View', type: 'Rent', price: 3105.06 },
  { name: 'Ridge Apartments', type: 'Sale', price: 7167.50 },
];

export default function AnalyticsDashboard() {
  const [selectedWeek, setSelectedWeek] = useState('Week');

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm">{`${label}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search something here..."
            className="w-80 pl-10 bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-600 text-white text-xs">TD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sales Analytics */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Sales Analytics</CardTitle>
                <Button variant="outline" size="sm" className="text-sm">
                  {selectedWeek} <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesAnalyticsData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ReTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Unit Pie Chart */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Total Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">36,950</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {propertyTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                    <span className="ml-auto text-gray-900 font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Listings */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Total Unit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {propertyListings.map((property) => (
                <div key={property.id} className="flex items-center gap-3">
                  <img 
                    src={property.image} 
                    alt={property.name}
                    className="w-12 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{property.name}</div>
                    <div className="text-xs text-gray-500">{formatCurrency(property.price)}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    property.changeType === 'positive' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {property.change}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(property.price)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Pie Chart */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={soldAllTimeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {soldAllTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">36,950</div>
                    <div className="text-sm text-gray-500">Sold all the time</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">15%</div>
                <div className="text-right text-gray-600">25%</div>
                <div className="text-gray-600">50%</div>
                <div className="text-right text-gray-600"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Table */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Property Name</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-50">
                        <td className="py-4 text-sm text-gray-900">{item.name}</td>
                        <td className="py-4">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            item.type === 'Sale' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'bg-orange-50 text-orange-700'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
