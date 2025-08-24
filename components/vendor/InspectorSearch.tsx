import React, { useMemo, useState } from 'react';
import { Search, Star, MapPin, Filter, Phone } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Inspector {
  id: string;
  name: string;
  company: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  specialties: string[];
  yearsExperience: number;
  licensed: boolean;
  basePrice: number;
  distance: number;
  availability: string;
  bio: string;
}

interface InspectorSearchProps {
  onSelect?: (inspector: Inspector) => void;
  defaultQuery?: string;
}

const MOCK_INSPECTORS: Inspector[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Elite Home Inspections',
    rating: 4.8,
    reviewCount: 127,
    phone: '(555) 123-4567',
    email: 'john@eliteinspections.com',
    specialties: ['General', 'Structural', 'HVAC'],
    yearsExperience: 15,
    licensed: true,
    basePrice: 450,
    distance: 2.3,
    availability: 'Available this week',
    bio: 'Certified home inspector with 15 years of experience. Specializes in older homes and structural assessments.'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    company: 'Bug Free Inspections',
    rating: 4.9,
    reviewCount: 89,
    phone: '(555) 987-6543',
    email: 'sarah@bugfree.com',
    specialties: ['Termite', 'Mold', 'Pest Control'],
    yearsExperience: 12,
    licensed: true,
    basePrice: 125,
    distance: 1.8,
    availability: 'Available tomorrow',
    bio: 'Expert in pest and mold inspections. Licensed in multiple states with extensive experience in residential properties.'
  },
  {
    id: '3',
    name: 'Mike Davis',
    company: 'Air Quality Testing',
    rating: 4.7,
    reviewCount: 156,
    phone: '(555) 456-7890',
    email: 'mike@airqualitytesting.com',
    specialties: ['Radon', 'Mold', 'Asbestos', 'Lead Paint'],
    yearsExperience: 10,
    licensed: true,
    basePrice: 200,
    distance: 3.1,
    availability: 'Available next week',
    bio: 'Environmental testing specialist focusing on indoor air quality and hazardous materials detection.'
  },
  {
    id: '4',
    name: 'Lisa Chen',
    company: 'Structural Solutions',
    rating: 4.9,
    reviewCount: 67,
    phone: '(555) 234-5678',
    email: 'lisa@structuralsolutions.com',
    specialties: ['Structural', 'Foundation', 'Engineering'],
    yearsExperience: 18,
    licensed: true,
    basePrice: 750,
    distance: 4.2,
    availability: 'Available in 2 weeks',
    bio: 'Licensed structural engineer with expertise in foundation issues and building integrity assessments.'
  }
];

export default function InspectorSearch({ onSelect, defaultQuery }: InspectorSearchProps) {
  const [query, setQuery] = useState(defaultQuery || '');

  const filteredInspectors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_INSPECTORS;
    return MOCK_INSPECTORS.filter((inspector) =>
      inspector.name.toLowerCase().includes(q) ||
      inspector.company.toLowerCase().includes(q) ||
      inspector.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <h3 className="font-semibold">Find Inspectors</h3>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by name, company, or specialty..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredInspectors.map((inspector) => (
          <Card key={inspector.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{inspector.name}</h3>
                    {inspector.licensed && (
                      <Badge variant="secondary">Licensed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{inspector.company}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{inspector.rating} ({inspector.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{inspector.distance} miles away</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    {inspector.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{inspector.bio}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">{inspector.availability}</span>
                    <span>Starting at ${inspector.basePrice}</span>
                    <span>{inspector.yearsExperience} years experience</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `tel:${inspector.phone}`}
                      title="Call inspector"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `mailto:${inspector.email}?subject=Home Inspection Inquiry&body=Hi ${inspector.name},%0A%0AI am interested in scheduling a home inspection with ${inspector.company}.%0A%0AProperty details:%0A- Address: [Property Address]%0A- Inspection type: ${inspector.specialties.join(', ')}%0A%0APlease let me know your availability.%0A%0AThank you!`}
                      title="Email inspector"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Create a booking email with more details
                      const bookingEmail = `mailto:${inspector.email}?subject=Home Inspection Booking Request&body=Hi ${inspector.name},%0A%0AI would like to book a home inspection with ${inspector.company}.%0A%0AProperty Information:%0A- Address: [Property Address]%0A- Square Footage: [Property Size]%0A- Property Type: [Single Family/Condo/etc]%0A%0AInspection Requirements:%0A- ${inspector.specialties.join('%0A- ')}%0A%0APreferred dates/times:%0A- Option 1: [Date/Time]%0A- Option 2: [Date/Time]%0A- Option 3: [Date/Time]%0A%0AStarting rate: $${inspector.basePrice}%0A%0APlease confirm availability and provide any additional information needed.%0A%0AThank you!`;

                      window.location.href = bookingEmail;
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredInspectors.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 border rounded-lg">
            No inspectors found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
}
