import { Fragment } from 'react';
import React, { useState } from 'react';
import { BookOpen, Calculator, Video, FileText, CheckSquare, ExternalLink, Search, Star, Clock, Play, Download, Bookmark } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'calculator' | 'checklist' | 'guide';
  category: string;
  duration?: string;
  rating: number;
  views: number;
  featured: boolean;
  url?: string;
}

interface ResourcesProps {
  onNavigate?: (page: string) => void;
}

export default function Resources({ onNavigate }: ResourcesProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources: Resource[] = [
    {
      id: '1',
      title: 'First-Time Home Buyer\'s Complete Guide',
      description: 'Everything you need to know about buying your first home, from pre-approval to closing.',
      type: 'guide',
      category: 'getting-started',
      duration: '15 min read',
      rating: 4.8,
      views: 15420,
      featured: true
    },
    {
      id: '2',
      title: 'Mortgage Calculator',
      description: 'Calculate your monthly payments, total interest, and amortization schedule.',
      type: 'calculator',
      category: 'financing',
      rating: 4.9,
      views: 28350,
      featured: true,
      url: '/calculators/mortgage'
    },
    {
      id: '3',
      title: 'Understanding Home Inspections',
      description: 'Learn what to expect during a home inspection and how to interpret the results.',
      type: 'video',
      category: 'inspections',
      duration: '12 min',
      rating: 4.7,
      views: 9240,
      featured: false
    },
    {
      id: '4',
      title: 'Home Buying Checklist',
      description: 'Step-by-step checklist to ensure you don\'t miss any important steps in the buying process.',
      type: 'checklist',
      category: 'getting-started',
      rating: 4.6,
      views: 18750,
      featured: true
    },
    {
      id: '5',
      title: 'How to Get the Best Mortgage Rate',
      description: 'Tips and strategies for securing the lowest possible interest rate on your home loan.',
      type: 'article',
      category: 'financing',
      duration: '8 min read',
      rating: 4.5,
      views: 12680,
      featured: false
    },
    {
      id: '6',
      title: 'Closing Costs Calculator',
      description: 'Estimate your closing costs based on your loan amount and location.',
      type: 'calculator',
      category: 'financing',
      rating: 4.4,
      views: 7890,
      featured: false,
      url: '/calculators/closing-costs'
    },
    {
      id: '7',
      title: 'Negotiating Your Offer',
      description: 'Strategies for making competitive offers and negotiating favorable terms.',
      type: 'video',
      category: 'negotiations',
      duration: '18 min',
      rating: 4.8,
      views: 11230,
      featured: true
    },
    {
      id: '8',
      title: 'Understanding Property Insurance',
      description: 'Complete guide to homeowners, flood, and other property insurance types.',
      type: 'guide',
      category: 'insurance',
      duration: '12 min read',
      rating: 4.3,
      views: 6540,
      featured: false
    }
  ];

  const categories = [
    { value: 'all', label: 'All Resources', count: resources.length },
    { value: 'getting-started', label: 'Getting Started', count: resources.filter(r => r.category === 'getting-started').length },
    { value: 'financing', label: 'Financing', count: resources.filter(r => r.category === 'financing').length },
    { value: 'inspections', label: 'Inspections', count: resources.filter(r => r.category === 'inspections').length },
    { value: 'insurance', label: 'Insurance', count: resources.filter(r => r.category === 'insurance').length },
    { value: 'negotiations', label: 'Negotiations', count: resources.filter(r => r.category === 'negotiations').length }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'calculator': return <Calculator className="w-5 h-5" />;
      case 'checklist': return <CheckSquare className="w-5 h-5" />;
      case 'guide': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-600';
      case 'video': return 'bg-red-100 text-red-600';
      case 'calculator': return 'bg-green-100 text-green-600';
      case 'checklist': return 'bg-purple-100 text-purple-600';
      case 'guide': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const homeBasics = [
    { step: 'Get Pre-approved', completed: true, description: 'Secure financing pre-approval' },
    { step: 'Find an Agent', completed: true, description: 'Choose a qualified real estate agent' },
    { step: 'Start House Hunting', completed: true, description: 'Begin viewing properties' },
    { step: 'Make an Offer', completed: false, description: 'Submit competitive offer on chosen property' },
    { step: 'Get Inspections', completed: false, description: 'Schedule and complete home inspections' },
    { step: 'Secure Insurance', completed: false, description: 'Obtain homeowners insurance' },
    { step: 'Final Walkthrough', completed: false, description: 'Complete final property inspection' },
    { step: 'Closing', completed: false, description: 'Sign documents and get keys' }
  ];

  const completedSteps = homeBasics.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / homeBasics.length) * 100;

  const handleCalculatorClick = (resourceId: string) => {
    if (onNavigate) {
      if (resourceId === '2') {
        onNavigate('mortgage-calculator');
      } else if (resourceId === '6') {
        onNavigate('closing-calculator');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black">
            Stage-based guides, videos, checklists, calculators, and a glossary to support every step
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-7'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculators">Calculators</TabsTrigger>
          {!isMobile && (
            <Fragment>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="glossary">Glossary</TabsTrigger>
              <TabsTrigger value="stages">Stage Guides</TabsTrigger>
            </Fragment>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Featured Resources */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Featured Resources</h2>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {resources.filter(r => r.featured).slice(0, 6).map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}>
                        {getTypeIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1 line-clamp-2">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{resource.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{resource.views.toLocaleString()} views</span>
                      </div>
                      {resource.duration && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{resource.duration}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`w-full ${isMobile ? 'touch-target' : ''}`}
                      onClick={() => {
                        if (resource.type === 'calculator') {
                          handleCalculatorClick(resource.id);
                        }
                      }}
                    >
                      {resource.type === 'video' && <Play className="w-4 h-4 mr-2" />}
                      {resource.type === 'calculator' && <Calculator className="w-4 h-4 mr-2" />}
                      {resource.type === 'checklist' && <CheckSquare className="w-4 h-4 mr-2" />}
                      {resource.type === 'article' && <FileText className="w-4 h-4 mr-2" />}
                      {resource.type === 'guide' && <BookOpen className="w-4 h-4 mr-2" />}
                      {resource.type === 'video' ? 'Watch' : 
                       resource.type === 'calculator' ? 'Calculate' : 
                       resource.type === 'checklist' ? 'View Checklist' : 'Read'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Home Buying Progress */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Home Buying Journey</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Progress Overview</CardTitle>
                  <Badge variant="secondary">{completedSteps}/{homeBasics.length} Steps</Badge>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {homeBasics.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {step.completed ? <CheckSquare className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? 'text-green-600' : ''}`}>{step.step}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculators" className="space-y-6">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
            {resources.filter(r => r.type === 'calculator').map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}>
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{resource.rating}</span>
                        <span className="text-sm text-muted-foreground">• {resource.views.toLocaleString()} uses</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{resource.description}</p>
                  <Button 
                    className={`w-full ${isMobile ? 'touch-target' : ''}`}
                    onClick={() => handleCalculatorClick(resource.id)}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Open Calculator
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Calculator Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Payment Calculator</CardTitle>
              <CardDescription>Get an instant estimate of your monthly payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4 mb-4`}>
                <div>
                  <label className="text-sm font-medium mb-2 block">Home Price</label>
                  <Input placeholder="$450,000" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Down Payment</label>
                  <Input placeholder="$90,000" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Interest Rate</label>
                  <Input placeholder="6.75%" />
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                  <p className="text-2xl font-semibold text-primary">$2,347</p>
                  <p className="text-xs text-muted-foreground mt-1">Principal & Interest only</p>
                </div>
              </div>
              <Button 
                className={`w-full ${isMobile ? 'touch-target' : ''}`}
                onClick={() => handleCalculatorClick('2')}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Open Full Calculator
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {!isMobile && (
          <Fragment>
            <TabsContent value="glossary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Glossary</CardTitle>
                  <CardDescription>Plain-English definitions of common real estate terms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { term: 'Appraisal', def: 'A professional opinion of property value performed by a licensed appraiser.' },
                      { term: 'Contingency', def: 'A condition that must be met for the contract to proceed.' },
                      { term: 'Earnest Money', def: 'A deposit made to demonstrate good faith when making an offer.' },
                      { term: 'Escrow', def: 'A neutral third party that holds funds and documents until closing.' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="font-medium">{item.term}</div>
                        <div className="text-sm text-muted-foreground">{item.def}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stage-Based Guides</CardTitle>
                  <CardDescription>Learn what to expect at each stage of your transaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: 'Home Search', desc: 'How to evaluate listings, schedule tours, and compare properties.' },
                      { title: 'Making an Offer', desc: 'Offer strategy, contingencies, and negotiation tips.' },
                      { title: 'Diligence', desc: 'Inspections, appraisals, and addressing findings.' },
                      { title: 'Financing', desc: 'Underwriting, rate locks, and closing disclosures.' },
                      { title: 'Closing', desc: 'Final walkthrough, signing, and getting the keys.' }
                    ].map((stage, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="font-medium">{stage.title}</div>
                        <div className="text-sm text-muted-foreground">{stage.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="guides" className="space-y-6">
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="space-y-4">
                {resources.filter(r => r.type === 'guide' || r.type === 'article').map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}>
                          {getTypeIcon(resource.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{resource.title}</h3>
                            <Button variant="outline" size="sm">
                              <Bookmark className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                          </div>
                          <p className="text-muted-foreground mb-3">{resource.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{resource.rating} rating</span>
                            </div>
                            <span>•</span>
                            <span>{resource.views.toLocaleString()} views</span>
                            {resource.duration && (
                              <Fragment>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{resource.duration}</span>
                                </div>
                              </Fragment>
                            )}
                          </div>
                          <Button>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read Guide
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.filter(r => r.type === 'video').map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <Play className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{resource.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{resource.duration}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="checklists" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.filter(r => r.type === 'checklist').map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}>
                          {getTypeIcon(resource.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{resource.rating}</span>
                            <span className="text-sm text-muted-foreground">• {resource.views.toLocaleString()} downloads</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{resource.description}</p>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <CheckSquare className="w-4 h-4 mr-2" />
                          View Checklist
                        </Button>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Fragment>
        )}
      </Tabs>
    </div>
  );
}
