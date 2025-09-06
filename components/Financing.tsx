import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, FileText, CheckCircle, Clock, AlertCircle, Building, Phone, Mail, Star, Users, Search, Plus, Calculator, CreditCard, Target, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { useTaskContext } from './TaskContext';
import { statusToBadgeVariant, lenderTypeToOutlineVariant } from './lib/badgeVariants';

interface LoanProcessor {
  id: string;
  name: string;
  company: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  specialties: string[];
  yearsExperience: number;
  avgClosingTime: number;
  rates: {
    conventional30: number;
    conventional15: number;
    fha: number;
    va: number;
  };
  features: string[];
  lenderType: 'bank' | 'credit-union' | 'online' | 'broker';
}

// Financing Progress Tracker Component
const FinancingProgressTracker = () => {
  const taskContext = useTaskContext();
  const [selectedStageInfo, setSelectedStageInfo] = useState(null);
  
  // Get financing-related tasks
  const financingTasks = taskContext.tasks.filter(task => 
    task.subcategory === 'financing' || 
    task.category === 'search' ||
    task.category === 'diligence' ||
    task.category === 'pre-closing' ||
    task.category === 'closing'
  ).filter(task => 
    task.title.toLowerCase().includes('mortgage') ||
    task.title.toLowerCase().includes('loan') ||
    task.title.toLowerCase().includes('financing') ||
    task.title.toLowerCase().includes('appraisal') ||
    task.title.toLowerCase().includes('pre-approval') ||
    task.title.toLowerCase().includes('lender') ||
    task.title.toLowerCase().includes('funds') ||
    task.title.toLowerCase().includes('wire')
  );
  
  const completedFinancingTasks = financingTasks.filter(task => task.status === 'completed').length;
  const activeFinancingTasks = financingTasks.filter(task => 
    ['active', 'in-progress', 'overdue'].includes(task.status)
  ).length;
  const upcomingFinancingTasks = financingTasks.filter(task => 
    ['upcoming', 'pending'].includes(task.status)
  ).length;
  
  const totalFinancingTasks = financingTasks.length;
  const financingProgress = totalFinancingTasks > 0 ? (completedFinancingTasks / totalFinancingTasks) * 100 : 0;
  
  // Define financing process stages
  const financingStages = [
    {
      id: 'pre-approval',
      title: 'Pre-Approval',
      description: 'Get pre-approved for mortgage',
      icon: Target,
      status: 'completed'
    },
    {
      id: 'application',
      title: 'Application',
      description: 'Submit loan application',
      icon: FileText,
      status: 'current'
    },
    {
      id: 'underwriting',
      title: 'Underwriting',
      description: 'Lender reviews application',
      icon: TrendingUp,
      status: 'pending'
    },
    {
      id: 'closing-funds',
      title: 'Closing Funds',
      description: 'Prepare funds for closing',
      icon: DollarSign,
      status: 'pending'
    }
  ];

  // Stage expectations information
  const stageExpectations = {
    'pre-approval': {
      timeline: '1-3 days',
      tasks: [
        'Submit financial documents',
        'Credit check and verification',
        'Receive pre-approval letter'
      ],
      tips: 'Gather income statements, tax returns, and bank statements to speed up the process.'
    },
    'application': {
      timeline: '7-14 days',
      tasks: [
        'Complete full loan application',
        'Submit additional documents',
        'Review loan terms and rates'
      ],
      tips: 'Respond quickly to lender requests for additional documentation to avoid delays.'
    },
    'underwriting': {
      timeline: '14-21 days',
      tasks: [
        'Lender reviews application',
        'Property appraisal ordered',
        'Final approval decision'
      ],
      tips: 'Avoid making large purchases or opening new credit accounts during this period.'
    },
    'closing-funds': {
      timeline: '3-5 days',
      tasks: [
        'Receive closing disclosure',
        'Arrange wire transfer',
        'Confirm fund availability'
      ],
      tips: 'Verify wire instructions with your lender and arrange funds 2-3 days before closing.'
    }
  };

  const currentStage = financingStages.find(stage => stage.status === 'current')?.id || 'pre-approval';
  const currentStageInfo = stageExpectations[currentStage];
  
  // Update stages based on current progress
  const updatedStages = financingStages.map(stage => {
    const stageIndex = financingStages.findIndex(s => s.id === stage.id);
    const currentIndex = financingStages.findIndex(s => s.id === currentStage);
    
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
  const nextFinancingActions = financingTasks
    .filter(task => ['active', 'in-progress', 'overdue'].includes(task.status))
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 3);
  
  return (
    <div className="space-y-6">
      {/* Enhanced Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Your Financing Journey
          </CardTitle>
          <CardDescription>
            Track your progress through each stage of the mortgage process
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
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-sm text-green-900 mb-1">💰 Financing Tip</div>
              <div className="text-sm text-green-800">{currentStageInfo?.tips}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-xl font-semibold">$600,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-xl font-semibold">6.75%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-xl font-semibold">$3,542</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Down Payment</p>
                <p className="text-xl font-semibold">$150,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Actions */}
      {nextFinancingActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Next Financing Actions
            </CardTitle>
            <CardDescription>Priority financing tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextFinancingActions.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={
                        task.priority === 'high' ? 'border-red-200 text-red-800' :
                        task.priority === 'medium' ? 'border-yellow-200 text-yellow-800' :
                        'border-green-200 text-green-800'
                      }>
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
                      <Calculator className="w-4 h-4 mr-1" />
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
            <Award className="w-5 h-5 text-green-600" />
            Financing Milestones
          </CardTitle>
          <CardDescription>Key milestones in your mortgage process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'Pre-Approval Obtained', completed: financingTasks.some(t => t.title.includes('Pre-Approval') && t.status === 'completed') },
              { title: 'Application Submitted', completed: financingTasks.some(t => t.title.includes('Application') && t.status === 'completed') },
              { title: 'Documents Submitted', completed: financingTasks.some(t => t.title.includes('Documents') && t.status === 'completed') },
              { title: 'Appraisal Scheduled', completed: financingTasks.some(t => t.title.includes('Appraisal') && t.status === 'completed') },
              { title: 'Closing Funds Ready', completed: financingTasks.some(t => t.title.includes('Funds') && t.status === 'completed') }
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

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Loan Timeline
          </CardTitle>
          <CardDescription>Expected timeline for remaining steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Document Review</div>
                <div className="text-sm text-muted-foreground">Lender reviewing submitted documents</div>
              </div>
              <Badge variant="softWarning">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Appraisal</div>
                <div className="text-sm text-muted-foreground">Property appraisal scheduling</div>
              </div>
              <Badge variant="outline">5-7 days</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Final Approval</div>
                <div className="text-sm text-muted-foreground">Underwriter final decision</div>
              </div>
              <Badge variant="outline">10-14 days</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Financing() {
  const [showLenderSearch, setShowLenderSearch] = useState(false);
  const [selectedLender, setSelectedLender] = useState<LoanProcessor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loanProcessors: LoanProcessor[] = [
    {
      id: '1',
      name: 'Mike Johnson',
      company: 'Wells Fargo',
      rating: 4.8,
      reviewCount: 324,
      phone: '(555) 123-4567',
      email: 'mike.johnson@wellsfargo.com',
      specialties: ['Conventional', 'FHA', 'VA', 'Jumbo'],
      yearsExperience: 12,
      avgClosingTime: 28,
      rates: {
        conventional30: 6.75,
        conventional15: 6.25,
        fha: 6.50,
        va: 6.25
      },
      features: ['Rate Lock Guarantee', 'Digital Application', 'Express Processing'],
      lenderType: 'bank'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      company: 'Quicken Loans',
      rating: 4.9,
      reviewCount: 567,
      phone: '(555) 234-5678',
      email: 'sarah.chen@quickenloans.com',
      specialties: ['Conventional', 'FHA', 'USDA', 'Online Processing'],
      yearsExperience: 8,
      avgClosingTime: 25,
      rates: {
        conventional30: 6.80,
        conventional15: 6.30,
        fha: 6.55,
        va: 6.30
      },
      features: ['100% Online Process', 'Real-time Updates', '24/7 Support'],
      lenderType: 'online'
    },
    {
      id: '3',
      name: 'David Rodriguez',
      company: 'Navy Federal Credit Union',
      rating: 4.7,
      reviewCount: 189,
      phone: '(555) 345-6789',
      email: 'david.rodriguez@navyfederal.org',
      specialties: ['VA', 'Conventional', 'Military Benefits'],
      yearsExperience: 15,
      avgClosingTime: 32,
      rates: {
        conventional30: 6.65,
        conventional15: 6.15,
        fha: 6.40,
        va: 6.00
      },
      features: ['Military Specialist', 'No Origination Fees', 'Member Benefits'],
      lenderType: 'credit-union'
    },
    {
      id: '4',
      name: 'Jennifer Kim',
      company: 'Better Mortgage',
      rating: 4.6,
      reviewCount: 892,
      phone: '(555) 456-7890',
      email: 'jennifer.kim@better.com',
      specialties: ['Conventional', 'FHA', 'Digital-First', 'Low Fees'],
      yearsExperience: 7,
      avgClosingTime: 21,
      rates: {
        conventional30: 6.70,
        conventional15: 6.20,
        fha: 6.45,
        va: 6.20
      },
      features: ['No Origination Fees', 'Digital Process', 'Fast Approval'],
      lenderType: 'online'
    }
  ];

  const currentLender = loanProcessors[0]; // Default to first lender
  
  const filteredLenders = loanProcessors.filter(lender =>
    lender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lender.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lender.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getLenderTypeColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'credit-union': return 'bg-green-100 text-green-800';
      case 'online': return 'bg-purple-100 text-purple-800';
      case 'broker': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loanProgress = [
    { step: 'Pre-approval', status: 'completed', date: '2025-01-05' },
    { step: 'Application submitted', status: 'completed', date: '2025-02-12' },
    { step: 'Document review', status: 'current', date: '2025-02-15' },
    { step: 'Underwriting', status: 'pending', date: '2025-02-20' },
    { step: 'Appraisal', status: 'pending', date: '2025-02-25' },
    { step: 'Final approval', status: 'pending', date: '2025-03-01' },
    { step: 'Closing preparation', status: 'pending', date: '2025-03-10' },
  ];

  const documents = [
    { name: 'Loan Application', status: 'submitted', required: true },
    { name: 'Pay Stubs (2 most recent)', status: 'submitted', required: true },
    { name: 'Bank Statements (2 months)', status: 'submitted', required: true },
    { name: 'Tax Returns (2 years)', status: 'submitted', required: true },
    { name: 'Employment Verification', status: 'pending', required: true },
    { name: 'Asset Verification', status: 'pending', required: true },
    { name: 'Insurance Binder', status: 'needed', required: true },
    { name: 'Homeowners Association (HOA) Documents', status: 'needed', required: false },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'current':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Financing</h1>
          <p className="text-muted-foreground">
            Track your mortgage application progress and manage required documents
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showLenderSearch} onOpenChange={setShowLenderSearch}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Find Lenders
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="lender-search-dialog-description">
              <DialogHeader>
                <DialogTitle>Find Loan Processors &amp; Lenders</DialogTitle>
                <DialogDescription id="lender-search-dialog-description">
                  Compare rates and services from top-rated mortgage professionals
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search by name, company, or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Lender Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="bank">Banks</SelectItem>
                      <SelectItem value="credit-union">Credit Unions</SelectItem>
                      <SelectItem value="online">Online Lenders</SelectItem>
                      <SelectItem value="broker">Brokers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {filteredLenders.map((lender) => (
                    <Card key={lender.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{lender.name}</h3>
                              <Badge className={getLenderTypeColor(lender.lenderType)}>
                                {lender.lenderType.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{lender.company}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{lender.rating} ({lender.reviewCount} reviews)</span>
                              </div>
                              <span>{lender.yearsExperience} years experience</span>
                              <span>Avg. {lender.avgClosingTime} days to close</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <h4 className="font-medium text-sm mb-1">Specialties</h4>
                                <div className="flex flex-wrap gap-1">
                                  {lender.specialties.map((specialty, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm mb-1">Current Rates</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>30-Year Fixed:</span>
                                    <span className="font-medium">{lender.rates.conventional30}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>15-Year Fixed:</span>
                                    <span className="font-medium">{lender.rates.conventional15}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{lender.phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>{lender.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button size="sm">
                              Get Quote
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Switch Lender
          </Button>
        </div>
      </div>

      {/* Current Lender Alert */}
      <Alert>
        <Building className="h-4 w-4" />
        <AlertDescription>
          You're currently working with <strong>{currentLender.name}</strong> at {currentLender.company}. 
          Contact them at {currentLender.phone} for any questions about your application.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="rates">Rate Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <FinancingProgressTracker />
        </TabsContent>

        <TabsContent value="application" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Application Progress</CardTitle>
              <CardDescription>Track your mortgage application through each step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loanProgress.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(step.status)}
                      {index < loanProgress.length - 1 && (
                        <div className={`w-0.5 h-8 mt-2 ${
                          step.status === 'completed' ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          step.status === 'current' ? 'text-primary' : 
                          step.status === 'completed' ? 'text-green-600' : 
                          'text-muted-foreground'
                        }`}>
                          {step.step}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {step.status === 'completed' ? 'Completed' : 
                           step.status === 'current' ? 'In Progress' : 
                           `Expected: ${new Date(step.date).toLocaleDateString()}`}
                        </span>
                      </div>
                      {step.status === 'current' && (
                        <div className="mt-2">
                          <Progress value={65} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Your lender is reviewing your submitted documents
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Document Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Your lender is currently reviewing all submitted documents. This process typically takes 3-5 business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Employment Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Your lender will contact your employer to verify your employment and income. Make sure your HR department is aware.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Appraisal Scheduling</h4>
                  <p className="text-sm text-muted-foreground">
                    Once document review is complete, your lender will order an appraisal of the property.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Track the status of all required documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        {!doc.required && (
                          <p className="text-xs text-muted-foreground">Optional</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusToBadgeVariant(doc.status) as any}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Drag and drop files here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Accepted formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Type</p>
                    <p className="font-semibold">Conventional</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Term</p>
                    <p className="font-semibold">30 years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment</p>
                    <p className="font-semibold">$150,000 (20%)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LTV Ratio</p>
                    <p className="font-semibold">80%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Principal &amp; Interest</span>
                  <span className="font-semibold">$3,542</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Property Tax</span>
                  <span className="font-semibold">$562</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Homeowners Insurance</span>
                  <span className="font-semibold">$125</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Homeowners Association (HOA) Fee</span>
                  <span className="font-semibold">$75</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Monthly Payment</span>
                    <span>$4,304</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Loan Processor</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowLenderSearch(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Change Lender
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{currentLender.name}</h3>
                    <Badge variant={lenderTypeToOutlineVariant(currentLender.lenderType) as any}>
                      {currentLender.lenderType.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{currentLender.company}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{currentLender.rating} rating • {currentLender.reviewCount} reviews</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentLender.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{currentLender.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{currentLender.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Experience:</span>
                      <span className="font-medium">{currentLender.yearsExperience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Closing:</span>
                      <span className="font-medium">{currentLender.avgClosingTime} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Your Rate:</span>
                      <span className="font-medium">{currentLender.rates.conventional30}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Comparison</CardTitle>
              <CardDescription>
                Compare current rates from different lenders in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loanProcessors.slice(0, 4).map((lender) => (
                  <div key={lender.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{lender.name}</h4>
                        <p className="text-sm text-muted-foreground">{lender.company}</p>
                      </div>
                      <Badge variant={lenderTypeToOutlineVariant(lender.lenderType) as any}>
                        {lender.lenderType.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">30-Year Fixed</p>
                        <p className="font-semibold text-lg">{lender.rates.conventional30}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">15-Year Fixed</p>
                        <p className="font-semibold text-lg">{lender.rates.conventional15}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Closing</p>
                        <p className="font-semibold">{lender.avgClosingTime} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{lender.rating}</span>
                        </div>
                      </div>
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