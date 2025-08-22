import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InspectionIssue {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  description: string;
  recommendation: string;
  cost: string;
  status: 'identified' | 'negotiating' | 'resolved' | 'accepted';
  resolution?: string;
  negotiationNotes?: string[];
}

export interface Inspection {
  id: string;
  title: string;
  type: string;
  status: 'scheduled' | 'completed' | 'pending' | 'cancelled';
  date: string;
  time: string;
  inspector: string;
  company: string;
  phone: string;
  cost: string;
  duration: string;
  description: string;
  result?: string;
  issues?: InspectionIssue[];
}

interface InspectionStore {
  inspections: Inspection[];
  setInspections: React.Dispatch<React.SetStateAction<Inspection[]>>;
}

const InspectionContext = createContext<InspectionStore | undefined>(undefined);

const initialInspections: Inspection[] = [
  {
    id: 'general',
    title: 'General Home Inspection',
    type: 'general',
    status: 'completed',
    date: '2025-07-15',
    time: '10:00 AM',
    inspector: 'John Smith',
    company: 'Elite Home Inspections',
    phone: '(555) 123-4567',
    cost: '$450',
    duration: '2-3 hours',
    description: 'Comprehensive inspection of all major systems and structures',
    result: 'completed',
    issues: [
      {
        id: '1',
        category: 'Electrical',
        severity: 'high',
        issue: 'GFCI outlets missing in bathroom',
        description: 'Bathroom outlets should have GFCI protection for safety',
        recommendation: 'Install GFCI outlets in all bathroom locations',
        cost: '$150-300',
        status: 'negotiating',
        negotiationNotes: ['Seller agreed to credit $200 toward repairs', 'Waiting for contractor quote']
      },
      {
        id: '2',
        category: 'Plumbing',
        severity: 'medium',
        issue: 'Minor leak under kitchen sink',
        description: 'Small water stain observed under kitchen sink',
        recommendation: 'Have plumber inspect and repair leak',
        cost: '$100-200',
        status: 'resolved',
        resolution: 'Seller completed repair before closing'
      },
      {
        id: '3',
        category: 'HVAC',
        severity: 'low',
        issue: 'Air filter needs replacement',
        description: 'HVAC air filter is dirty and should be replaced',
        recommendation: 'Replace air filter and schedule regular maintenance',
        cost: '$20-40',
        status: 'accepted',
        resolution: 'Minor issue - buyer will handle after closing'
      }
    ]
  },
  {
    id: 'termite',
    title: 'Termite Inspection',
    type: 'termite',
    status: 'completed',
    date: '2025-07-14',
    time: '2:00 PM',
    inspector: 'Sarah Wilson',
    company: 'Bug Free Inspections',
    phone: '(555) 987-6543',
    cost: '$125',
    duration: '1 hour',
    description: 'Inspection for termites and other wood-destroying insects',
    result: 'passed'
  },
  {
    id: 'radon',
    title: 'Radon Testing',
    type: 'radon',
    status: 'scheduled',
    date: '2025-07-18',
    time: '9:00 AM',
    inspector: 'Mike Davis',
    company: 'Air Quality Testing',
    phone: '(555) 456-7890',
    cost: '$200',
    duration: '48 hours',
    description: 'Test for radon gas levels in the basement and living areas'
  }
];

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
  return (
    <InspectionContext.Provider value={{ inspections, setInspections }}>
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspectionStore() {
  const ctx = useContext(InspectionContext);
  if (!ctx) throw new Error('useInspectionStore must be used within an InspectionProvider');
  return ctx;
}

