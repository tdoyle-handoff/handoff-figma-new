import React, { useState } from 'react';
import { Search, Calendar, Clock, CheckCircle, AlertTriangle, FileText, Camera, Shield, Zap, Droplets, Star, MapPin, Phone, Mail, Plus, MessageSquare, DollarSign, Filter, TrendingUp, Users, ClipboardCheck, Home, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { useTaskContext } from './TaskContext';
import { useInspectionStore } from './InspectionContext';
import { statusToBadgeVariant, severityToBadgeVariant, issueStatusToBadgeVariant, priorityToOutlineVariant } from './lib/badgeVariants';

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

interface InspectionIssue {
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

interface Inspection {
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

// Inspections Progress Tracker Component
export const InspectionsProgressTracker = () => {
  const taskContext = useTaskContext();
  const [selectedStageInfo, setSelectedStageInfo] = useState(null);
  
  // Get inspection-related tasks
  const inspectionTasks = taskContext.tasks.filter(task => 
    task.subcategory === 'inspections' || 
    task.category === 'diligence' ||
    task.category === 'pre-closing'
  ).filter(task => 
    task.title.toLowerCase().includes('inspection') ||
    task.title.toLowerCase().includes('walkthrough') ||
    task.title.toLowerCase().includes('accessibility') ||
    task.title.toLowerCase().includes('remedies') ||
    task.title.toLowerCase().includes('findings')
  );
  
  const completedInspectionTasks = inspectionTasks.filter(task => task.status === 'completed').length;
  const activeInspectionTasks = inspectionTasks.filter(task => 
    ['active', 'in-progress', 'overdue'].includes(task.status)
  ).length;
  const upcomingInspectionTasks = inspectionTasks.filter(task => 
    ['upcoming', 'pending'].includes(task.status)
  ).length;
  
  const totalInspectionTasks = inspectionTasks.length;
  const inspectionProgress = totalInspectionTasks > 0 ? (completedInspectionTasks / totalInspectionTasks) * 100 : 0;
  
  // Define inspection process stages
  const inspectionStages = [
    {
      id: 'scheduling',
      title: 'Scheduling',
      description: 'Schedule inspection appointments',
      icon: Calendar,
      status: 'completed'
    },
    {
      id: 'inspection',
      title: 'Inspection',
      description: 'Complete property inspections',
      icon: ClipboardCheck,
      status: 'current'
    },
    {
      id: 'review-negotiate',
      title: 'Review & Negotiate',
      description: 'Review findings and negotiate',
      icon: AlertTriangle,
      status: 'pending'
    },
    {
      id: 'final-walkthrough',
      title: 'Final Walkthrough',
      description: 'Confirm all issues resolved',
      icon: CheckCircle,
      status: 'pending'
    }
  ];

  // Stage expectations information
  const stageExpectations = {
    'scheduling': {
      timeline: '1-2 days',
      tasks: [
        'Research qualified inspectors',
        'Schedule general inspection',
        'Arrange specialized inspections'
      ],
      tips: 'Book inspections early as good inspectors get booked quickly, especially during busy seasons.'
    },
    'inspection': {
      timeline: '7-10 days',
      tasks: [
        'Attend general home inspection',
        'Complete specialized inspections',
        'Receive inspection reports'
      ],
      tips: 'Attend the inspection if possible to ask questions and understand any issues firsthand.'
    },
    'review-negotiate': {
      timeline: '3-5 days',
      tasks: [
        'Review all inspection reports',
        'Identify major issues',
        'Negotiate repairs or credits'
      ],
      tips: 'Focus on major structural, safety, or expensive issues rather than minor cosmetic items.'
    },
    'final-walkthrough': {
      timeline: '1 day',
      tasks: [
        'Schedule final walkthrough',
        'Verify repairs completed',
        'Confirm property condition'
      ],
      tips: 'Walk through systematically and test all agreed-upon repairs before closing.'
    }
  };

  const currentStage = inspectionStages.find(stage => stage.status === 'current')?.id || 'scheduling';
  const currentStageInfo = stageExpectations[currentStage];
  
  // Update stages based on current progress
  const updatedStages = inspectionStages.map(stage => {
    const stageIndex = inspectionStages.findIndex(s => s.id === stage.id);
    const currentIndex = inspectionStages.findIndex(s => s.id === currentStage);
    
    if (stageIndex < currentIndex) {
      return { ...stage, status: 'completed' };
    } else if (stageIndex === currentIndex) {
      return { ...stage, status: 'current' };
    } else {
      return { ...stage, status: 'pending' };
    }
  });

  const handleStageClick = (stageId) => {
    setSelectedStageInfo(stageExpectations[stageId]);
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStageIconColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'current':
        return 'text-blue-600';
      default:
        return 'text-gray-400';
    }
  };

  // Get next action items
  const nextInspectionActions = inspectionTasks
    .filter(task => ['active', 'in-progress', 'overdue'].includes(task.status))
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 3);
  
  return (
    <div className="space-y-6">
      {/* Enhanced Progress Tracker */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Your Inspection Journey
          </CardTitle>
          <CardDescription>
            Track your progress through each stage of the inspection process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Horizontal Progress Tracker */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {updatedStages.map((stage, index) => {
                const Icon = stage.icon;
                const isLast = index === updatedStages.length - 1;
                
                return (
                  <div key={stage.id} className="flex items-center">
                    {/* Stage Item */}
                    <button
                      onClick={() => handleStageClick(stage.id)}
                      className={`
                        flex flex-col items-center p-2 gap-2 
                        transition-all duration-200 hover:scale-105
                        ${stage.status === 'current' ? 'ring-2 ring-blue-200' : ''}
                      `}
                    >
                      {/* Icon Circle */}
                      <div className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center
                        ${getStageColor(stage.status)} transition-all duration-200
                      `}>
                        <Icon className={`w-5 h-5 ${getStageIconColor(stage.status)}`} />
                      </div>
                      
                      {/* Stage Info */}
                      <div className="text-center">
                        <div className="font-medium text-xs">
                          {stage.title}
                        </div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {stage.description}
                        </div>
                      </div>

                      {/* Status Badge */}
                      {stage.status === 'current' && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {stage.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </button>

                    {/* Arrow */}
                    {!isLast && (
                      <div className="flex items-center mx-4">
                        <div className={`progress-arrow ${
                          stage.status === 'completed' ? 'progress-arrow-completed' : 'progress-arrow-pending'
                        }`}>
                          <div className="progress-arrow-line"></div>
                          <div className="progress-arrow-head"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* What to Expect Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">What to Expect: {updatedStages.find(s => s.id === currentStage)?.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Timeline */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Timeline</div>
                  <div className="text-sm text-muted-foreground">{currentStageInfo?.timeline}</div>
                </div>
              </div>

              {/* Key Tasks */}
              <div className="col-span-2">
                <div className="font-medium text-sm mb-2">Key Tasks</div>
                <ul className="space-y-1">
                  {currentStageInfo?.tasks.map((task, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-sm text-blue-900 mb-1">🔍 Inspection Tip</div>
              <div className="text-sm text-blue-800">{currentStageInfo?.tips}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-xl font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-xl font-semibold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-semibold">$775</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Actions */}
      {nextInspectionActions.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Next Inspection Actions
            </CardTitle>
            <CardDescription>Priority inspection tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextInspectionActions.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={priorityToOutlineVariant(task.priority) as any}>
                        {task.priority} priority
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="outline" className="text-xs">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {task.linkedPage && (
                    <Button size="sm" variant="outline">
                      <ClipboardCheck className="w-4 h-4 mr-1" />
                      Action
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Inspection Milestones
          </CardTitle>
          <CardDescription>Key milestones in your inspection process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'General Inspection Scheduled', completed: inspectionTasks.some(t => t.title.includes('inspection') && ['completed', 'active'].includes(t.status)) },
              { title: 'Inspection Report Received', completed: inspectionTasks.some(t => t.title.includes('inspection') && t.status === 'completed') },
              { title: 'Issues Negotiated', completed: inspectionTasks.some(t => t.title.includes('remedies') && t.status === 'completed') },
              { title: 'Final Walkthrough Complete', completed: inspectionTasks.some(t => t.title.includes('walkthrough') && t.status === 'completed') }
            ].map((milestone, index) => (
              <div key={index} className="flex items-center gap-3">
                {milestone.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className={milestone.completed ? 'text-green-700 font-medium' : 'text-muted-foreground'}>
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issue Resolution Status */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Issue Resolution Status
          </CardTitle>
          <CardDescription>Status of identified inspection issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-yellow-600" />
                <div>
                  <div className="font-medium">GFCI Outlets Missing</div>
                  <div className="text-sm text-muted-foreground">Electrical safety concern</div>
                </div>
              </div>
              <Badge variant="softWarning">Negotiating</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Droplets className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">Kitchen Sink Leak</div>
                  <div className="text-sm text-muted-foreground">Minor plumbing issue</div>
                </div>
              </div>
              <Badge variant="softSuccess">Resolved</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600" />
                <div>
                  <div className="font-medium">Air Filter Replacement</div>
                  <div className="text-sm text-muted-foreground">HVAC maintenance item</div>
                </div>
              </div>
              <Badge variant="softInfo">Accepted</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInspectionType, setSelectedInspectionType] = useState('');
  const [showInspectorSearch, setShowInspectorSearch] = useState(false);
  const [showAddInspection, setShowAddInspection] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(null);

  const inspectionTypes = [
    { value: 'general', label: 'General Home Inspection' },
    { value: 'termite', label: 'Termite Inspection' },
    { value: 'radon', label: 'Radon Testing' },
    { value: 'septic', label: 'Septic System Inspection' },
    { value: 'well-water', label: 'Well Water Testing' },
    { value: 'structural', label: 'Structural Engineering' },
    { value: 'mold', label: 'Mold Inspection' },
    { value: 'lead-paint', label: 'Lead Paint Testing' },
    { value: 'asbestos', label: 'Asbestos Testing' },
    { value: 'chimney', label: 'Chimney Inspection' },
    { value: 'pool-spa', label: 'Pool/Spa Inspection' },
    { value: 'hvac', label: 'HVAC System Inspection' }
  ];

  const inspectors: Inspector[] = [
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

  const { inspections, setInspections } = useInspectionStore();

  const filteredInspectors = inspectors.filter(inspector =>
    inspector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspector.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspector.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );




  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const addInspection = (type: string, inspector: Inspector) => {
    const inspectionType = inspectionTypes.find(t => t.value === type);
    if (!inspectionType) return;

    const newInspection: Inspection = {
      id: Date.now().toString(),
      title: inspectionType.label,
      type: type,
      status: 'pending',
      date: '',
      time: '',
      inspector: inspector.name,
      company: inspector.company,
      phone: inspector.phone,
      cost: `${inspector.basePrice}`,
      duration: '1-2 hours',
      description: `Professional ${inspectionType.label.toLowerCase()} service`
    };

    setInspections([...inspections, newInspection]);
    setShowAddInspection(false);
    setSelectedInspector(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Inspections</h1>
          <p className="text-muted-foreground">
            Schedule and track all property inspections for your new home
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showInspectorSearch} onOpenChange={setShowInspectorSearch}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Find Inspectors
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="inspector-search-dialog-description">
              <DialogHeader>
                <DialogTitle>Find Inspectors in Your Area</DialogTitle>
                <DialogDescription id="inspector-search-dialog-description">
                  Search for qualified inspectors near Riverside Heights, CA
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name, company, or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInspector(inspector)}
                            >
                              View Profile
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedInspector(inspector);
                                setShowInspectorSearch(false);
                                setShowAddInspection(true);
                              }}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddInspection} onOpenChange={setShowAddInspection}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Inspection
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-inspection-dialog-description">
              <DialogHeader>
                <DialogTitle>Add New Inspection</DialogTitle>
                <DialogDescription id="add-inspection-dialog-description">
                  {selectedInspector ? `Book with ${selectedInspector.name}` : 'Select an inspection type'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Inspection Type</label>
                  <Select value={selectedInspectionType} onValueChange={setSelectedInspectionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inspection type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inspectionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedInspector && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{selectedInspector.name}</h4>
                      <span className="text-sm text-muted-foreground">${selectedInspector.basePrice}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedInspector.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{selectedInspector.phone}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddInspection(false);
                      setShowInspectorSearch(true);
                    }}
                  >
                    Choose Inspector
                  </Button>
                  <Button
                    onClick={() => selectedInspector && selectedInspectionType && addInspection(selectedInspectionType, selectedInspector)}
                    disabled={!selectedInspector || !selectedInspectionType}
                  >
                    Add Inspection
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alert for upcoming inspection */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Your radon testing is scheduled for <strong>Friday, July 18th at 9:00 AM</strong>. 
          The testing equipment will be placed for 48 hours.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <InspectionsProgressTracker />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {inspections.map((inspection) => (
              <Card key={inspection.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getStatusIcon(inspection.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{inspection.title}</h3>
                          <Badge variant={statusToBadgeVariant(inspection.status) as any}>
                            {inspection.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {inspection.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date &amp; Time</p>
                            <p className="font-medium">
                              {inspection.date ? new Date(inspection.date).toLocaleDateString() : 'TBD'} 
                              {inspection.time && ` at ${inspection.time}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{inspection.duration}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Inspector</p>
                            <p className="font-medium">{inspection.inspector}</p>
                            <p className="text-xs text-muted-foreground">{inspection.company}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cost</p>
                            <p className="font-medium">{inspection.cost}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      {inspection.status === 'pending' && (
                        <Button size="sm">
                          Schedule
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Inspection Results Summary</CardTitle>
              <CardDescription>
                Overview of completed inspections and identified issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passed</p>
                    <p className="text-2xl font-semibold">1</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issues Found</p>
                    <p className="text-2xl font-semibold">3</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold">1</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Negotiating</p>
                    <p className="text-2xl font-semibold">1</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Identified Issues</h4>
                {inspections.find(i => i.issues)?.issues?.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {issue.category === 'Electrical' && <Zap className="w-4 h-4 text-yellow-600" />}
                          {issue.category === 'Plumbing' && <Droplets className="w-4 h-4 text-blue-600" />}
                          {issue.category === 'HVAC' && <Shield className="w-4 h-4 text-green-600" />}
                          <span className="font-medium">{issue.category}</span>
                        </div>
                        <Badge variant={severityToBadgeVariant(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                        <Badge variant={issueStatusToBadgeVariant(issue.status) as any}>
                          {issue.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{issue.cost}</span>
                    </div>
                    <h5 className="font-medium mb-1">{issue.issue}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    <p className="text-sm mb-2">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                    
                    {issue.status === 'resolved' && issue.resolution && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Resolution:</p>
                        <p className="text-sm text-green-700">{issue.resolution}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negotiations" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Issue Negotiations &amp; Remedies</CardTitle>
              <CardDescription>
                Track negotiations and resolutions for identified issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {inspections.find(i => i.issues)?.issues?.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {issue.category === 'Electrical' && <Zap className="w-4 h-4 text-yellow-600" />}
                          {issue.category === 'Plumbing' && <Droplets className="w-4 h-4 text-blue-600" />}
                          {issue.category === 'HVAC' && <Shield className="w-4 h-4 text-green-600" />}
                          {issue.issue}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                      </div>
                      <Badge variant={issueStatusToBadgeVariant(issue.status) as any}>
                        {issue.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Severity</p>
                        <Badge variant={severityToBadgeVariant(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estimated Cost: {issue.cost}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Recommendation</h5>
                        <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                      </div>

                      {issue.status === 'negotiating' && issue.negotiationNotes && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">Negotiation Notes</h5>
                          <ul className="space-y-1">
                            {issue.negotiationNotes.map((note, noteIndex) => (
                              <li key={noteIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                <MessageSquare className="w-3 h-3 mt-1 flex-shrink-0" />
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {issue.status === 'resolved' && issue.resolution && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm text-green-800 mb-1">Resolution</h5>
                          <p className="text-sm text-green-700">{issue.resolution}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Inspection Reports</CardTitle>
              <CardDescription>
                Download and review detailed inspection reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections.filter(i => i.status === 'completed').map((inspection) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-medium">{inspection.title} Report</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed on {new Date(inspection.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Inspector: {inspection.inspector}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Photos
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
