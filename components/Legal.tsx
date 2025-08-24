import React, { useState } from 'react';
import { Search, FileText, AlertTriangle, CheckCircle, Download, Upload, Eye, Bot, Star, MapPin, Phone, Mail, ExternalLink, DollarSign, Calendar, Clock, Shield, FileX, AlertCircle, TrendingUp, Users, Scale, ChevronRight, User, HelpCircle } from 'lucide-react';
import ContractAnalysis from './ContractAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { useTaskContext, Task } from './TaskContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface Lawyer {
  id: string;
  name: string;
  firm: string;
  experience: number;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  email: string;
  specialties: string[];
  hourlyRate: number;
  photo: string;
  verified: boolean;
}

const mockLawyers: Lawyer[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    firm: 'Mitchell & Associates',
    experience: 12,
    rating: 4.9,
    reviewCount: 127,
    location: 'Riverside Heights, CA',
    phone: '(555) 123-4567',
    email: 'sarah@mitchelllaw.com',
    specialties: ['Real Estate Law', 'Property Transactions', 'Title Issues'],
    hourlyRate: 350,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616c56495e2?w=64&h=64&fit=crop&crop=face',
    verified: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    firm: 'Chen Law Group',
    experience: 8,
    rating: 4.7,
    reviewCount: 89,
    location: 'Riverside Heights, CA',
    phone: '(555) 987-6543',
    email: 'mchen@chenlawgroup.com',
    specialties: ['Real Estate Law', 'Contract Review', 'Closings'],
    hourlyRate: 295,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    verified: true,
  },
  {
    id: '3',
    name: 'Jennifer Rodriguez',
    firm: 'Rodriguez Legal Services',
    experience: 15,
    rating: 4.8,
    reviewCount: 203,
    location: 'Downtown, CA',
    phone: '(555) 456-7890',
    email: 'j.rodriguez@rlslaw.com',
    specialties: ['Real Estate Law', 'Litigation', 'Title Defense'],
    hourlyRate: 425,
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face',
    verified: true,
  },
];

// Task Instruction Card Component
const TaskInstructionCard = ({ task }: { task: Task }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
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
            {task.assignedTo && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assignedTo}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.instructions && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost" className="p-2">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
          {task.linkedPage && (
            <Button size="sm" variant="outline">
              <ExternalLink className="w-4 h-4 mr-1" />
              Action
            </Button>
          )}
        </div>
      </div>
      
      {task.instructions && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="px-3 pb-3">
            <div className="border-t pt-3 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Overview</h4>
                <p className="text-sm text-muted-foreground">{task.instructions.overview}</p>
              </div>
              
              {task.instructions.steps && task.instructions.steps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Step-by-Step Instructions</h4>
                  <div className="space-y-3">
                    {task.instructions.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step.important ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-sm text-muted-foreground mb-1">{step.description}</div>
                          <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            <strong>Action:</strong> {step.action}
                          </div>
                          {step.duration && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Duration: {step.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {task.instructions.tips && task.instructions.tips.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tips & Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {task.instructions.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {task.instructions.requiredDocuments && task.instructions.requiredDocuments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Required Documents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {task.instructions.requiredDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {task.instructions.contacts && task.instructions.contacts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Contacts</h4>
                  <div className="space-y-2">
                    {task.instructions.contacts.map((contact, index) => (
                      <div key={index} className="text-sm border rounded-lg p-2">
                        <div className="font-medium">{contact.name} - {contact.role}</div>
                        <div className="text-muted-foreground text-xs">{contact.when}</div>
                        {contact.phone && (
                          <div className="text-xs text-blue-600">{contact.phone}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                {task.instructions.timeline && (
                  <div>
                    <h5 className="font-medium text-sm">Timeline</h5>
                    <p className="text-xs text-muted-foreground">{task.instructions.timeline}</p>
                  </div>
                )}
                {task.instructions.cost && (
                  <div>
                    <h5 className="font-medium text-sm">Expected Cost</h5>
                    <p className="text-xs text-muted-foreground">{task.instructions.cost}</p>
                  </div>
                )}
              </div>
              
              {task.instructions.nextSteps && task.instructions.nextSteps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">What Happens Next</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {task.instructions.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

// Legal Progress Tracker Component
export const LegalProgressTracker = () => {
  const taskContext = useTaskContext();
  const [selectedStageInfo, setSelectedStageInfo] = useState(null);
  
  // Get legal-related tasks
  const legalTasks = taskContext.tasks.filter(task => 
    task.subcategory === 'legal' || 
    task.category === 'contract' ||
    task.category === 'offer' ||
    task.category === 'closing'
  );
  
  const completedLegalTasks = legalTasks.filter(task => task.status === 'completed').length;
  const activeLegalTasks = legalTasks.filter(task => 
    ['active', 'in-progress', 'overdue'].includes(task.status)
  ).length;
  const upcomingLegalTasks = legalTasks.filter(task => 
    ['upcoming', 'pending'].includes(task.status)
  ).length;
  
  const totalLegalTasks = legalTasks.length;
  const legalProgress = totalLegalTasks > 0 ? (completedLegalTasks / totalLegalTasks) * 100 : 0;
  
  // Define legal process stages
  const legalStages = [
    {
      id: 'attorney-selection',
      title: 'Attorney Selection',
      description: 'Choose your legal representation',
      icon: User,
      status: 'completed'
    },
    {
      id: 'contract-review',
      title: 'Contract Review',
      description: 'Review and negotiate purchase agreement',
      icon: FileText,
      status: 'current'
    },
    {
      id: 'title-search',
      title: 'Title Search',
      description: 'Verify property ownership and liens',
      icon: Search,
      status: 'pending'
    },
    {
      id: 'closing-prep',
      title: 'Closing Preparation',
      description: 'Prepare final documents and settlement',
      icon: CheckCircle,
      status: 'pending'
    }
  ];

  // Stage expectations information
  const stageExpectations = {
    'attorney-selection': {
      timeline: '1-2 days',
      tasks: [
        'Research qualified attorneys',
        'Interview potential candidates',
        'Select and retain attorney'
      ],
      tips: 'Choose an attorney with local real estate experience and good reviews from recent clients.'
    },
    'contract-review': {
      timeline: '3-5 days',
      tasks: [
        'Review purchase agreement terms',
        'Negotiate contingencies',
        'Finalize contract details'
      ],
      tips: 'Pay special attention to contingency dates and ensure all terms protect your interests.'
    },
    'title-search': {
      timeline: '7-10 days',
      tasks: [
        'Order title search',
        'Review title report',
        'Resolve any title issues'
      ],
      tips: 'Address any title concerns promptly to avoid delays at closing.'
    },
    'closing-prep': {
      timeline: '5-7 days',
      tasks: [
        'Prepare settlement statement',
        'Review closing documents',
        'Coordinate final walkthrough'
      ],
      tips: 'Review all documents carefully before closing day and bring proper identification.'
    }
  };

  const currentStage = legalStages.find(stage => stage.status === 'current')?.id || 'attorney-selection';
  const currentStageInfo = stageExpectations[currentStage];
  
  // Update stages based on current progress
  const updatedStages = legalStages.map(stage => {
    const stageIndex = legalStages.findIndex(s => s.id === stage.id);
    const currentIndex = legalStages.findIndex(s => s.id === currentStage);
    
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
  const nextLegalActions = legalTasks
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
            <Scale className="w-5 h-5" />
            Your Legal Process Journey
          </CardTitle>
          <CardDescription>
            Track your progress through each stage of the legal process
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
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="font-medium text-sm text-red-900 mb-1">⚖️ Legal Tip</div>
              <div className="text-sm text-red-800">{currentStageInfo?.tips}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Actions */}
      {nextLegalActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Next Legal Actions
            </CardTitle>
            <CardDescription>Priority legal tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextLegalActions.map((task) => (
                <TaskInstructionCard key={task.id} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Legal Milestones
          </CardTitle>
          <CardDescription>Key legal milestones in your transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'Attorney Selected', completed: legalTasks.some(t => t.id.includes('select-lawyer') && t.status === 'completed') },
              { title: 'Contract Executed', completed: legalTasks.some(t => t.id.includes('contract-acceptance') && t.status === 'completed') },
              { title: 'Title Search Complete', completed: legalTasks.some(t => t.id.includes('title-search') && t.status === 'completed') },
              { title: 'Settlement Ready', completed: legalTasks.some(t => t.id.includes('settlement-statement') && t.status === 'completed') },
              { title: 'Closing Documents Signed', completed: legalTasks.some(t => t.id.includes('closing') && t.status === 'completed') }
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
    </div>
  );
};

export const LawyerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState<string | null>(null);

  const filteredLawyers = mockLawyers.filter(lawyer =>
    lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Find a Real Estate Attorney</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect with qualified real estate attorneys in your area to help with your transaction.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, firm, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredLawyers.map((lawyer) => (
          <Card key={lawyer.id} className={`shadow-sm transition-all hover:shadow-md ${selectedLawyer === lawyer.id ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={lawyer.photo} alt={lawyer.name} />
                  <AvatarFallback>{lawyer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{lawyer.name}</h4>
                    {lawyer.verified && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{lawyer.firm}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{lawyer.rating}</span>
                      <span className="text-muted-foreground">({lawyer.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{lawyer.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>${lawyer.hourlyRate}/hour</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lawyer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setSelectedLawyer(selectedLawyer === lawyer.id ? null : lawyer.id)}
                      variant={selectedLawyer === lawyer.id ? "default" : "outline"}
                    >
                      {selectedLawyer === lawyer.id ? 'Selected' : 'Select Attorney'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};


export const TitleSearch = () => {
  const [titleSearchComplete, setTitleSearchComplete] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Title Search & Review</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Review title search results, liens, easements, and other property encumbrances.
        </p>
      </div>

      {!titleSearchComplete ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">Title Search in Progress</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Our title company is conducting a comprehensive search of public records.
            </p>
            <Progress value={60} className="mb-4" />
            <p className="text-xs text-muted-foreground">Expected completion: 2-3 business days</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Title Status Overview */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Title Search Results</CardTitle>
                <Badge variant="softSuccess">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">Clean Title</p>
                  <p className="text-xs text-muted-foreground">No major issues</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">2 Easements</p>
                  <p className="text-xs text-muted-foreground">Utility access</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <FileX className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">No Liens</p>
                  <p className="text-xs text-muted-foreground">Clear of debts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Findings */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Easements */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Easements Found</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-sm">Utility Easement</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pacific Gas & Electric - Rear property line
                  </p>
                  <p className="text-xs">
                    Standard utility easement for electrical service. Does not impact buildable area.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-sm">Drainage Easement</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    City of Riverside Heights - Side yard
                  </p>
                  <p className="text-xs">
                    Storm water drainage access. 5-foot wide easement along east property line.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Chain of Title */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Chain of Title</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium">Current Owner</p>
                      <p className="text-xs text-muted-foreground">Robert & Lisa Martinez</p>
                    </div>
                    <p className="text-xs text-muted-foreground">2018 - Present</p>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium">Previous Owner</p>
                      <p className="text-xs text-muted-foreground">Johnson Family Trust</p>
                    </div>
                    <p className="text-xs text-muted-foreground">2005 - 2018</p>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-sm font-medium">Original Owner</p>
                      <p className="text-xs text-muted-foreground">Riverside Development Co.</p>
                    </div>
                    <p className="text-xs text-muted-foreground">1998 - 2005</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Title Insurance */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Title Insurance</CardTitle>
              <CardDescription>
                Protect your investment with title insurance coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Owner's Policy</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Protects your ownership rights and covers legal costs for title disputes.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coverage: $750,000</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Recommended</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Lender's Policy</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Required by your lender to protect their financial interest.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coverage: $600,000</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export const SettlementReview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Settlement Statement & Wire Instructions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Review your closing disclosure and secure wire transfer instructions.
        </p>
      </div>

      {/* Settlement Statement */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Closing Disclosure (CD)</CardTitle>
              <CardDescription>Final settlement statement with all costs and fees</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your closing disclosure will be available 3 business days before closing (Jan 28, 2025).
            </AlertDescription>
          </Alert>

          {/* Preview of key costs */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <h5 className="font-medium mb-3">Estimated Closing Costs</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Purchase Price</span>
                <span className="font-medium">$750,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Down Payment</span>
                <span>-$150,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Loan Amount</span>
                <span>$600,000.00</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Title Insurance</span>
                <span>$1,875.00</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow/Attorney Fees</span>
                <span>$1,200.00</span>
              </div>
              <div className="flex justify-between">
                <span>Recording Fees</span>
                <span>$150.00</span>
              </div>
              <div className="flex justify-between">
                <span>Prepaid Taxes & Insurance</span>
                <span>$3,500.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Cash to Close (Est.)</span>
                <span>$156,725.00</span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule CD Review Meeting
          </Button>
        </CardContent>
      </Card>

      {/* Wire Instructions */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Secure Wire Instructions</CardTitle>
          </div>
          <CardDescription>
            Verified wire transfer details for closing funds
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Wire instructions will only be provided through secure, encrypted channels. Never trust wire instructions received via email.
            </AlertDescription>
          </Alert>

          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <h5 className="font-medium mb-1">Secure Instructions Pending</h5>
            <p className="text-sm text-muted-foreground mb-3">
              Wire instructions will be provided 24-48 hours before closing through our secure portal.
            </p>
            <Button variant="outline" size="sm">
              Request Early Access
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h6 className="font-medium text-sm mb-1">Escrow Company</h6>
              <p className="text-sm">Pacific Coast Escrow</p>
              <p className="text-xs text-muted-foreground">License #12345678</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h6 className="font-medium text-sm mb-1">Escrow Officer</h6>
              <p className="text-sm">Maria Santos</p>
              <p className="text-xs text-muted-foreground">(555) 246-8135</p>
            </div>
          </div>

          <div className="space-y-2">
            <h6 className="font-medium text-sm">Wire Transfer Security Tips</h6>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>• Always verify wire instructions by phone before sending</li>
              <li>• Use the phone number from official documents, not emails</li>
              <li>• Wire fraud is common - be extremely cautious</li>
              <li>• Report any suspicious communications immediately</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Legal() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Legal</h2>
        <p className="text-gray-600 mt-1">
          Contract management, legal documentation, and attorney services
        </p>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start">
          <TabsTrigger
            value="progress"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Progress
          </TabsTrigger>
          <TabsTrigger
            value="attorney"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Attorney
          </TabsTrigger>
          <TabsTrigger
            value="contract"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Contract
          </TabsTrigger>
          <TabsTrigger
            value="title"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Title
          </TabsTrigger>
          <TabsTrigger
            value="settlement"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200"
          >
            Settlement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6 bg-white">
          <LegalProgressTracker />
        </TabsContent>

        <TabsContent value="attorney" className="space-y-6 bg-white">
          <LawyerSearch />
        </TabsContent>

        <TabsContent value="contract" className="space-y-6 bg-white">
          <ContractAnalysis />
        </TabsContent>

        <TabsContent value="title" className="space-y-6 bg-white">
          <TitleSearch />
        </TabsContent>

        <TabsContent value="settlement" className="space-y-6 bg-white">
          <SettlementReview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
