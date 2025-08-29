import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Plus, 
  FileText, 
  Edit3, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  FileSignature,
  FileX,
  Filter,
  Search
} from 'lucide-react';
import { DocumentTemplate, GeneratedDocument } from '../../types/documentTemplates';
import { DOCUMENT_TEMPLATES, getTemplateById } from '../../utils/documentTemplates';
import { DocumentTemplateForm } from './DocumentTemplateForm';
import { generateDocumentPDF } from '../../utils/pdfGenerator';
import { cn } from '../ui/utils';

interface DocumentTemplateManagerProps {
  onDocumentCreated?: (document: GeneratedDocument) => void;
  onDocumentUpdated?: (document: GeneratedDocument) => void;
}

export function DocumentTemplateManager({ 
  onDocumentCreated, 
  onDocumentUpdated 
}: DocumentTemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [editingDocument, setEditingDocument] = useState<GeneratedDocument | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load generated documents from localStorage (in a real app, this would be from your backend)
  useEffect(() => {
    const savedDocuments = localStorage.getItem('generatedDocuments');
    if (savedDocuments) {
      setGeneratedDocuments(JSON.parse(savedDocuments));
    }
  }, []);

  // Save documents to localStorage
  const saveDocuments = (documents: GeneratedDocument[]) => {
    localStorage.setItem('generatedDocuments', JSON.stringify(documents));
    setGeneratedDocuments(documents);
  };

  const getTemplateIcon = (category: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'purchase-agreement': FileText,
      'termination': FileX,
      'counter-offer': FileSignature,
      'disclosure': FileCheck,
      'inspection': FileCheck
    };
    return iconMap[category] || FileText;
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'draft': Clock,
      'completed': CheckCircle2,
      'signed': FileCheck
    };
    return iconMap[status] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'signed': 'bg-blue-100 text-blue-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateDocument = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setEditingDocument(null);
    setIsDialogOpen(true);
  };

  const handleEditDocument = (document: GeneratedDocument) => {
    const template = getTemplateById(document.templateId);
    if (template) {
      setSelectedTemplate(template);
      setEditingDocument(document);
      setIsDialogOpen(true);
    }
  };

  const handleSaveDocument = async (data: any, isDraft: boolean) => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (editingDocument) {
        // Update existing document
        const updatedDocument: GeneratedDocument = {
          ...editingDocument,
          data,
          status: isDraft ? 'draft' : 'completed'
        };
        
        const updatedDocuments = generatedDocuments.map(doc => 
          doc.id === editingDocument.id ? updatedDocument : doc
        );
        
        saveDocuments(updatedDocuments);
        onDocumentUpdated?.(updatedDocument);
      } else {
        // Create new document
        const newDocument: GeneratedDocument = {
          id: `doc_${Date.now()}`,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          fileName: `${selectedTemplate.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
          data,
          createdAt: now,
          status: isDraft ? 'draft' : 'completed'
        };
        
        const updatedDocuments = [...generatedDocuments, newDocument];
        saveDocuments(updatedDocuments);
        onDocumentCreated?.(newDocument);
      }
      
      if (!isDraft) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async (data: any): Promise<string> => {
    if (!selectedTemplate) throw new Error('No template selected');

    try {
      const pdfUrl = await generateDocumentPDF(selectedTemplate, data);
      
      // Update document with PDF URL if editing
      if (editingDocument) {
        const updatedDocument = { ...editingDocument, pdfUrl, data };
        const updatedDocuments = generatedDocuments.map(doc => 
          doc.id === editingDocument.id ? updatedDocument : doc
        );
        saveDocuments(updatedDocuments);
      }
      
      return pdfUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleDownloadDocument = async (document: GeneratedDocument) => {
    try {
      if (document.pdfUrl) {
        // If we already have a PDF URL, use it
        const link = document.createElement('a');
        link.href = document.pdfUrl;
        link.download = document.fileName;
        link.click();
      } else {
        // Generate PDF on demand
        const template = getTemplateById(document.templateId);
        if (template) {
          const pdfUrl = await generateDocumentPDF(template, document.data, document.fileName);
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = document.fileName;
          link.click();
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    const updatedDocuments = generatedDocuments.filter(doc => doc.id !== documentId);
    saveDocuments(updatedDocuments);
  };

  // Filter documents
  const filteredDocuments = generatedDocuments.filter(doc => {
    const matchesSearch = doc.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const template = getTemplateById(doc.templateId);
    const matchesCategory = categoryFilter === 'all' || template?.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(DOCUMENT_TEMPLATES.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Document Templates</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {DOCUMENT_TEMPLATES.length} Available
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCUMENT_TEMPLATES.map((template) => {
            const Icon = getTemplateIcon(template.category);
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {template.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2 mb-3">
                    {template.description}
                  </CardDescription>
                  <Button 
                    onClick={() => handleCreateDocument(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Document
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Generated Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Generated Documents</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {generatedDocuments.length} Documents
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 text-center max-w-sm">
                {generatedDocuments.length === 0 
                  ? "Create your first document using one of the templates above."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => {
              const template = getTemplateById(document.templateId);
              const Icon = getTemplateIcon(template?.category || 'purchase-agreement');
              const StatusIcon = getStatusIcon(document.status);
              
              return (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{document.templateName}</h3>
                            <Badge className={getStatusColor(document.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {document.fileName}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground gap-4">
                            <span>Created: {new Date(document.createdAt).toLocaleDateString()}</span>
                            {template && (
                              <Badge variant="outline">
                                {template.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDocument(document)}
                          title="Edit Document"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(document)}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? 'Edit Document' : 'Create Document'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-6">
            {selectedTemplate && (
              <DocumentTemplateForm
                template={selectedTemplate}
                initialData={editingDocument?.data || {}}
                onSave={handleSaveDocument}
                onGeneratePDF={handleGeneratePDF}
                isLoading={isLoading}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
