import React, { useState } from 'react';
import { FileText, Upload, Download, Share, Eye, Trash2, Plus, Search, Filter, Calendar, User, CheckCircle, Clock, AlertCircle, Folder } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { useIsMobile } from './ui/use-mobile';

interface Document {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'requires_signature' | 'signed' | 'needs_review';
  type: 'pdf' | 'doc' | 'image' | 'other';
  description?: string;
  shared: boolean;
  required: boolean;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  file?: File | null;
}

interface SetupData {
  buyerEmail: string;
  buyerName: string;
}

interface DocumentsProps {
  setupData?: SetupData | null;
}

export default function Documents({ setupData }: DocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const isMobile = useIsMobile();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileTypeFromMimeType = (mimeType: string): 'pdf' | 'doc' | 'image' | 'other' => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('image')) return 'image';
    return 'other';
  };

  // No agent agreement documents from setup wizard anymore
  const agentAgreementDocs: Document[] = [];

  const baseDocuments: Document[] = [
    {
      id: '1',
      name: 'Purchase Agreement.pdf',
      category: 'contracts',
      size: '2.3 MB',
      uploadDate: '2025-01-15',
      uploadedBy: 'Sarah Johnson (Agent)',
      status: 'requires_signature',
      type: 'pdf',
      description: 'Main purchase contract for 123 Oak Street',
      shared: true,
      required: true
    },
    {
      id: '2',
      name: 'Property Disclosure.pdf',
      category: 'disclosures',
      size: '1.8 MB',
      uploadDate: '2025-01-14',
      uploadedBy: 'Seller',
      status: 'approved',
      type: 'pdf',
      shared: true,
      required: true
    },
    {
      id: '3',
      name: 'Home Inspection Report.pdf',
      category: 'inspections',
      size: '4.2 MB',
      uploadDate: '2025-02-10',
      uploadedBy: 'Mike Thompson (Inspector)',
      status: 'approved',
      type: 'pdf',
      description: 'General home inspection completed 2/10/2025',
      shared: true,
      required: false
    },
    {
      id: '4',
      name: 'Loan Application.pdf',
      category: 'financing',
      size: '3.1 MB',
      uploadDate: '2025-01-20',
      uploadedBy: 'You',
      status: 'approved',
      type: 'pdf',
      shared: false,
      required: true
    },
    {
      id: '5',
      name: 'Insurance Quote - State Farm.pdf',
      category: 'insurance',
      size: '892 KB',
      uploadDate: '2025-02-05',
      uploadedBy: 'You',
      status: 'needs_review',
      type: 'pdf',
      shared: false,
      required: false
    },
    {
      id: '6',
      name: 'Title Report.pdf',
      category: 'title',
      size: '1.5 MB',
      uploadDate: '2025-02-12',
      uploadedBy: 'First Title Company',
      status: 'pending',
      type: 'pdf',
      description: 'Preliminary title report',
      shared: true,
      required: true
    }
  ];

  // Combine base documents with agent agreement documents
  const documents = [...baseDocuments, ...agentAgreementDocs];

  const categories = [
    { value: 'all', label: 'All Documents', count: documents.length },
    { value: 'contracts', label: 'Contracts', count: documents.filter(d => d.category === 'contracts').length },
    { value: 'disclosures', label: 'Disclosures', count: documents.filter(d => d.category === 'disclosures').length },
    { value: 'financing', label: 'Financing', count: documents.filter(d => d.category === 'financing').length },
    { value: 'inspections', label: 'Inspections', count: documents.filter(d => d.category === 'inspections').length },
    { value: 'insurance', label: 'Insurance', count: documents.filter(d => d.category === 'insurance').length },
    { value: 'title', label: 'Title & Escrow', count: documents.filter(d => d.category === 'title').length },
    { value: 'agent-agreements', label: 'Agent Agreements', count: documents.filter(d => d.category === 'agent-agreements').length }
  ].filter(cat => cat.count > 0); // Only show categories with documents

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'requires_signature': return 'bg-orange-100 text-orange-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'signed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'requires_signature': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'needs_review': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };

  const requiredDocs = documents.filter(doc => doc.required);
  const completedRequired = requiredDocs.filter(doc => doc.status === 'approved' || doc.status === 'signed');
  const completionPercentage = requiredDocs.length > 0 ? (completedRequired.length / requiredDocs.length) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Offer & Document Hub</h1>
          <p className="text-black">
            Smart offer builder, templates, and e-sign integration
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="mobile-button">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="upload-dialog-description">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription id="upload-dialog-description">
                  Add a new document to your transaction folder
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="disclosures">Disclosures</SelectItem>
                      <SelectItem value="financing">Financing</SelectItem>
                      <SelectItem value="inspections">Inspections</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="title">Title & Escrow</SelectItem>
                      <SelectItem value="agent-agreements">Agent Agreements</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                  <Input placeholder="Brief description of the document" />
                </div>
                <div className="text-center border-2 border-dashed border-border rounded-lg p-8">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Drag and drop files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 25MB)
                  </p>
                  <Button variant="outline" className="mt-4 mobile-button">
                    Choose Files
                  </Button>
                </div>
                <div className="flex gap-2 mobile-device:mobile-stack-buttons">
                  <Button className="flex-1 mobile-button">Upload</Button>
                  <Button variant="outline" onClick={() => setShowUpload(false)} className="mobile-button">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Alert */}
      <Alert>
        <Folder className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Required documents completion: {completedRequired.length}/{requiredDocs.length}</span>
            <div className="w-32">
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Agent Agreement Documents Alert */}
      {agentAgreementDocs.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Agent Agreement Documents:</strong> {agentAgreementDocs.length} document{agentAgreementDocs.length !== 1 ? 's' : ''} from your setup process {agentAgreementDocs.length === 1 ? 'is' : 'are'} now available in your document library.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 tab-container-multiline' : 'grid-cols-7'}`}>
          <TabsTrigger value="all" className={isMobile ? 'tab-multiline' : ''}>All Documents</TabsTrigger>
          <TabsTrigger value="shared" className={isMobile ? 'tab-multiline' : ''}>Shared</TabsTrigger>
          <TabsTrigger value="signatures" className={isMobile ? 'tab-multiline' : ''}>Signatures Needed</TabsTrigger>
          <TabsTrigger value="archive" className={isMobile ? 'tab-multiline' : ''}>Archive</TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="offer">Offer Builder</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="esign">E-Sign</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="mobile-button-sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`flex items-start ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
                    <div className={`flex items-start gap-4 ${isMobile ? 'w-full' : 'flex-1'}`}>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getFileTypeIcon(doc.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{doc.name}</h3>
                          {doc.required && <Badge variant="secondary">Required</Badge>}
                          {doc.shared && <Badge variant="outline">Shared</Badge>}
                          {doc.category === 'agent-agreements' && <Badge className="bg-blue-100 text-blue-800">Setup</Badge>}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                        )}
                        <div className={`flex items-center ${isMobile ? 'flex-wrap' : 'gap-4'} text-sm text-muted-foreground ${isMobile ? 'gap-2' : ''}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(doc.status)}
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <span>{doc.size}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className={isMobile ? 'truncate max-w-32' : ''}>{doc.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-end' : 'ml-4'}`}>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "icon" : "sm"} 
                        className={`${isMobile ? 'mobile-button-sm w-9 h-9' : 'mobile-button-sm'}`}
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                        {!isMobile && <span className="ml-2">View</span>}
                      </Button>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "icon" : "sm"} 
                        className={`${isMobile ? 'mobile-button-sm w-9 h-9' : 'mobile-button-sm'}`}
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                        {!isMobile && <span className="ml-2">Download</span>}
                      </Button>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "icon" : "sm"} 
                        className={`${isMobile ? 'mobile-button-sm w-9 h-9' : 'mobile-button-sm'}`}
                        title="Share Document"
                      >
                        <Share className="w-4 h-4" />
                        {!isMobile && <span className="ml-2">Share</span>}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          <div className="space-y-4">
            {documents.filter(doc => doc.shared).map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
                    <div className={`flex items-center gap-4 ${isMobile ? 'w-full' : ''}`}>
                      <span className="text-2xl">{getFileTypeIcon(doc.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Shared with all parties • Uploaded by {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className={`flex gap-2 ${isMobile ? 'w-full justify-end' : ''}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mobile-button-sm"
                      >
                        {isMobile ? 'Manage' : 'Manage Access'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "icon" : "sm"}
                        className={`${isMobile ? 'mobile-button-sm w-9 h-9' : 'mobile-button-sm'}`}
                        title="Share Document"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-6">
          <div className="space-y-4">
            {documents.filter(doc => doc.status === 'requires_signature').map((doc) => (
              <Card key={doc.id} className="border-orange-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
                    <div className={`flex items-center gap-4 ${isMobile ? 'w-full' : ''}`}>
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getFileTypeIcon(doc.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Your signature is required to proceed
                        </p>
                      </div>
                    </div>
                    <div className={`flex gap-2 ${isMobile ? 'w-full justify-end' : ''}`}>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "icon" : "sm"}
                        className={`${isMobile ? 'mobile-button-sm w-9 h-9' : 'mobile-button-sm'}`}
                        title="Review Document"
                      >
                        <Eye className="w-4 h-4" />
                        {!isMobile && <span className="ml-2">Review</span>}
                      </Button>
                      <Button 
                        size="sm"
                        className="mobile-button-sm"
                      >
                        {isMobile ? 'Sign' : 'Sign Document'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No archived documents</h3>
              <p className="text-muted-foreground">
                Completed or outdated documents will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {!isMobile && (
          <>
            <TabsContent value="offer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Offer Builder</CardTitle>
                  <CardDescription>Draft offers with templates, contingencies, and auto-filled details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                    Offer builder coming soon — create offers faster with reusable templates and e-sign support.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Templates</CardTitle>
                  <CardDescription>Standard forms and reusable documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Purchase Agreement', 'Counter Offer', 'Inspection Addendum', 'Repair Request'].map((tpl, idx) => (
                      <Card key={idx} className="border-dashed">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{tpl}</div>
                            <div className="text-sm text-muted-foreground">Preconfigured template</div>
                          </div>
                          <Button variant="outline" size="sm">Use</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="esign" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>E-Sign</CardTitle>
                  <CardDescription>Send documents for electronic signature</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                    Connect your preferred e-sign provider to send and track signature requests.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}