import { Fragment } from 'react';
import React, { useState } from 'react';
import { BookOpen, Video, FileText, ExternalLink, Search, Star, Clock, Play, Download, Bookmark } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
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
      case 'guide': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-600';
      case 'video': return 'bg-red-100 text-red-600';
      case 'guide': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Education Hub</h2>
          <p className="text-gray-600 mt-1">
            Educational content, guides, and helpful tools for home buyers
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-4 gap-2'}`}>
          <TabsTrigger value="overview" className="px-4 py-2">Overview</TabsTrigger>
          {!isMobile ? (
            <Fragment>
              <TabsTrigger value="guides" className="px-4 py-2">Guides</TabsTrigger>
              <TabsTrigger value="videos" className="px-4 py-2">Videos</TabsTrigger>
              <TabsTrigger value="glossary" className="px-4 py-2">Glossary</TabsTrigger>
            </Fragment>
          ) : (
            <TabsTrigger value="guides" className="px-4 py-2">Resources</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6 bg-white">
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
                      onClick={() => {}}
                    >
                      {resource.type === 'video' && <Play className="w-4 h-4 mr-2" />}
                      {resource.type === 'article' && <FileText className="w-4 h-4 mr-2" />}
                      {resource.type === 'guide' && <BookOpen className="w-4 h-4 mr-2" />}
                      {resource.type === 'video' ? 'Watch' : 'Read'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </TabsContent>


        {!isMobile && (
          <Fragment>
            <TabsContent value="glossary" className="space-y-6 bg-white">
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

            <TabsContent value="guides" className="space-y-6 bg-white">
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

            <TabsContent value="videos" className="space-y-6 bg-white">
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

          </Fragment>
        )}
      </Tabs>
    </div>
  );
}
