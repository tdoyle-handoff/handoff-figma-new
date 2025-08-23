import React, { useState, useRef } from 'react';
import { FileText, Upload, Eye, Download, Bot, AlertTriangle, CheckCircle, Clock, Calendar, DollarSign, AlertCircle, FileCheck, Search, Filter, Trash2, Share, User, MapPin, Info, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useIsMobile } from './ui/use-mobile';

interface ContractDocument {
  id: string;
  name: string;
  type: 'purchase-agreement' | 'counter-offer' | 'addendum' | 'disclosure' | 'other';
  size: string;
  uploadDate: string;
  status: 'analyzing' | 'analyzed' | 'error' | 'pending-review';
  file?: File;
  analysisComplete: boolean;
  keyPoints?: ContractKeyPoints;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ContractKeyPoints {
  summary: string;
  purchasePrice: string;
  earnestMoney: string;
  closingDate: string;
  inspectionPeriod: string;
  financingContingency: string;
  appraisalContingency: string;
  contingencies: ContingencyItem[];
  importantDates: ImportantDate[];
  risks: RiskItem[];
  recommendations: string[];
  keyTerms: KeyTerm[];
}

interface ContingencyItem {
  name: string;
  deadline: string;
  status: 'active' | 'expired' | 'waived' | 'satisfied';
  description: string;
  daysRemaining?: number;
  critical: boolean;
}

interface ImportantDate {
  event: string;
  date: string;
  description: string;
  status: 'upcoming' | 'completed' | 'overdue';
  daysUntil?: number;
}

interface RiskItem {
  level: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  recommendation: string;
}

interface KeyTerm {
  term: string;
  value: string;
  section: string;
  importance: 'critical' | 'important' | 'standard';
  explanation?: string;
}

// Sample purchase agreement for demonstration
const generateSamplePurchaseAgreement = (): ContractDocument => {
  const today = new Date();
  const closingDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days from now
  
  return {
    id: 'sample-pa-001',
    name: 'Purchase_Agreement_123_Oak_Street.pdf',
    type: 'purchase-agreement',
    size: '2.3 MB',
    uploadDate: today.toISOString(),
    status: 'analyzed',
    analysisComplete: true,
    riskLevel: 'medium',
    keyPoints: {
      summary: 'Standard residential purchase agreement for a single-family home at 123 Oak Street. Contains typical buyer protections including inspection, financing, and appraisal contingencies. Some terms require attention regarding timeline and deposit amount.',
      purchasePrice: '$750,000',
      earnestMoney: '$15,000 (2%)',
      closingDate: closingDate.toLocaleDateString(),
      inspectionPeriod: '10 days',
      financingContingency: '30 days',
      appraisalContingency: '25 days',
      contingencies: [
        {
          name: 'Home Inspection',
          deadline: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'active',
          description: 'Buyer has 10 days to complete home inspection and provide notice of any objections',
          daysRemaining: 10,
          critical: true
        },
        {
          name: 'Financing Approval',
          deadline: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'active',
          description: 'Buyer must obtain written loan commitment within 30 days',
          daysRemaining: 30,
          critical: true
        },
        {
          name: 'Appraisal',
          deadline: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'active',
          description: 'Property must appraise for at least the purchase price',
          daysRemaining: 25,
          critical: true
        },
        {
          name: 'Title Review',
          deadline: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'active',
          description: 'Review preliminary title report and resolve any title issues',
          daysRemaining: 20,
          critical: false
        }
      ],
      importantDates: [
        {
          event: 'Inspection Deadline',
          date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          description: 'Last day to complete inspection and submit objections',
          status: 'upcoming',
          daysUntil: 10
        },
        {
          event: 'Financing Deadline',
          date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          description: 'Loan commitment must be received',
          status: 'upcoming',
          daysUntil: 30
        },
        {
          event: 'Final Walkthrough',
          date: new Date(today.getTime() + 43 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          description: 'Final property inspection before closing',
          status: 'upcoming',
          daysUntil: 43
        },
        {
          event: 'Closing',
          date: closingDate.toLocaleDateString(),
          description: 'Final settlement and transfer of ownership',
          status: 'upcoming',
          daysUntil: 45
        }
      ],
      risks: [
        {
          level: 'high',
          category: 'Timeline Risk',
          description: 'Inspection period is only 10 days, which may be tight for scheduling and completing thorough inspections',
          recommendation: 'Schedule inspections immediately and consider requesting extension if needed'
        },
        {
          level: 'medium',
          category: 'Financial Risk',
          description: 'Earnest money deposit is 2% ($15,000) which is higher than typical 1-1.5%',
          recommendation: 'Ensure all contingencies are met to protect earnest money deposit'
        },
        {
          level: 'medium',
          category: 'Appraisal Risk',
          description: 'No appraisal gap coverage specified - buyer may need to cover difference if appraisal comes in low',
          recommendation: 'Consider negotiating appraisal gap coverage or have funds available for potential shortfall'
        },
        {
          level: 'low',
          category: 'Seller Disclosure',
          description: 'Standard seller disclosure timeframe provided',
          recommendation: 'Review all disclosures carefully upon receipt'
        }
      ],
      recommendations: [
        'Schedule home inspection within 2-3 days to allow time for re-inspection if needed',
        'Submit loan application immediately to ensure 30-day financing deadline is met',
        'Review all seller disclosures carefully when received',
        'Confirm homeowners insurance can be obtained at reasonable rates',
        'Schedule final walkthrough 24-48 hours before closing',
        'Have attorney review any unusual terms or addendums'
      ],
      keyTerms: [
        {
          term: 'Purchase Price',
          value: '$750,000',
          section: 'Section 2.1',
          importance: 'critical',
          explanation: 'Total amount buyer will pay for the property'
        },
        {
          term: 'Earnest Money',
          value: '$15,000',
          section: 'Section 2.2',
          importance: 'critical',
          explanation: 'Good faith deposit held in escrow, credited toward purchase at closing'
        },
        {
          term: 'Down Payment',
          value: '$150,000 (20%)',
          section: 'Section 3.1',
          importance: 'critical',
          explanation: 'Cash amount buyer will pay at closing, excluding earnest money'
        },
        {
          term: 'Closing Date',
          value: closingDate.toLocaleDateString(),
          section: 'Section 4.1',
          importance: 'critical',
          explanation: 'Date when ownership transfers and transaction completes'
        },
        {
          term: 'Property Taxes',
          value: 'Prorated at closing',
          section: 'Section 6.2',
          importance: 'important',
          explanation: 'Seller pays taxes through closing date, buyer responsible after'
        },
        {
          term: 'Home Warranty',
          value: 'Not included',
          section: 'Section 7.3',
          importance: 'standard',
          explanation: 'No home warranty provided by seller'
        },
        {
          term: 'Possession',
          value: 'At closing',
          section: 'Section 8.1',
          importance: 'important',
          explanation: 'Buyer takes possession immediately upon closing completion'
        }
      ]
    }
  };
};

interface ContractAnalysisProps {
  onNavigate?: (page: string) => void;
}

export default function ContractAnalysis({ onNavigate }: ContractAnalysisProps) {
  const [contracts, setContracts] = useState<ContractDocument[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractDocument | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Load sample contract on component mount
  React.useEffect(() => {
    const sampleContract = generateSamplePurchaseAgreement();
    setContracts([sampleContract]);
    setSelectedContract(sampleContract);
  }, []);

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (file.type !== 'application/pdf' && !file.type.includes('document')) {
        alert('Please upload PDF or document files only.');
        continue;
      }

      if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB.');
        continue;
      }

      const newContract: ContractDocument = {
        id: `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: 'purchase-agreement',
        size: formatFileSize(file.size),
        uploadDate: new Date().toISOString(),
        status: 'analyzing',
        file,
        analysisComplete: false,
        riskLevel: 'medium'
      };

      setContracts(prev => [...prev, newContract]);
      setAnalyzing(true);

      // Simulate analysis
      setTimeout(() => {
        setContracts(prev => prev.map(contract => 
          contract.id === newContract.id 
            ? { ...contract, status: 'analyzed', analysisComplete: true, keyPoints: generateSamplePurchaseAgreement().keyPoints }
            : contract
        ));
        setAnalyzing(false);
      }, 3000);
    }

    setShowUpload(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContingencyColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'waived': return 'bg-gray-100 text-gray-800';
      case 'satisfied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending-review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Contract Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Upload and analyze purchase agreements, addendums, and contract documents
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Contract
        </Button>
      </div>

      {/* Contract List */}
      {contracts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-4">
            {contracts
              .filter(contract => contract.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((contract) => (
                <Card 
                  key={contract.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedContract?.id === contract.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedContract(contract)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{contract.name}</h3>
                            <Badge className={getStatusColor(contract.status)}>
                              {contract.status === 'analyzing' && <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1"></div>}
                              {contract.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getRiskColor(contract.riskLevel)}>
                              {contract.riskLevel} risk
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{contract.size}</span>
                            <span>{new Date(contract.uploadDate).toLocaleDateString()}</span>
                            <span className="capitalize">{contract.type.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowDocumentViewer(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Contract Analysis */}
      {selectedContract && selectedContract.analysisComplete && selectedContract.keyPoints && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'}`}>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="contingencies">Contingencies</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="terms">Key Terms</TabsTrigger>
                <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Actions</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">AI Contract Summary</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Analysis Complete
                  </Badge>
                </div>
                <CardDescription>
                  Comprehensive analysis of contract terms and conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Contract Overview</h4>
                  <p className="text-sm text-blue-900">{selectedContract.keyPoints.summary}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Purchase Price</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedContract.keyPoints.purchasePrice}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Earnest Money</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedContract.keyPoints.earnestMoney}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Closing Date</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedContract.keyPoints.closingDate}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">Inspection Period</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedContract.keyPoints.inspectionPeriod}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Critical Contingencies</h4>
                  <div className="grid gap-3">
                    {selectedContract.keyPoints.contingencies
                      .filter(c => c.critical)
                      .map((contingency, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{contingency.name}</span>
                              <Badge className={getContingencyColor(contingency.status)}>
                                {contingency.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contingency.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{contingency.deadline}</p>
                            {contingency.daysRemaining && (
                              <p className="text-xs text-muted-foreground">
                                {contingency.daysRemaining} days left
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contingencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contract Contingencies</CardTitle>
                <CardDescription>
                  Track all contingency deadlines and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedContract.keyPoints.contingencies.map((contingency, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{contingency.name}</h4>
                          <Badge className={getContingencyColor(contingency.status)}>
                            {contingency.status}
                          </Badge>
                          {contingency.critical && (
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{contingency.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{contingency.deadline}</p>
                        {contingency.daysRemaining && contingency.status === 'active' && (
                          <p className={`text-sm ${contingency.daysRemaining <= 3 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {contingency.daysRemaining} days remaining
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {contingency.daysRemaining && contingency.status === 'active' && (
                      <div className="space-y-2">
                        <Progress 
                          value={Math.max(0, 100 - (contingency.daysRemaining / 30 * 100))} 
                          className="h-2"
                        />
                        {contingency.daysRemaining <= 5 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Action Required:</strong> This contingency expires soon. Ensure all requirements are met.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Important Dates & Milestones</CardTitle>
                <CardDescription>
                  Critical dates and deadlines for your transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedContract.keyPoints.importantDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        date.status === 'completed' ? 'bg-green-500' :
                        date.status === 'overdue' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{date.event}</h4>
                          <Badge variant={
                            date.status === 'completed' ? 'secondary' :
                            date.status === 'overdue' ? 'destructive' :
                            'default'
                          }>
                            {date.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{date.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{date.date}</p>
                        {date.daysUntil && date.status === 'upcoming' && (
                          <p className={`text-sm ${date.daysUntil <= 7 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {date.daysUntil} days away
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {!isMobile && (
            <>
              <TabsContent value="terms" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Contract Terms</CardTitle>
                    <CardDescription>
                      Important terms and conditions from your contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedContract.keyPoints.keyTerms.map((term, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{term.term}</h4>
                              <Badge variant={
                                term.importance === 'critical' ? 'destructive' :
                                term.importance === 'important' ? 'default' :
                                'secondary'
                              }>
                                {term.importance}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{term.value}</p>
                              <p className="text-xs text-muted-foreground">{term.section}</p>
                            </div>
                          </div>
                          {term.explanation && (
                            <p className="text-sm text-muted-foreground">{term.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>
                      Potential risks and concerns identified in the contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedContract.keyPoints.risks.map((risk, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              risk.level === 'high' ? 'bg-red-500' :
                              risk.level === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{risk.category}</h4>
                                <Badge className={getRiskColor(risk.level)}>
                                  {risk.level} risk
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-900">
                                  <strong>Recommendation:</strong> {risk.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                    <CardDescription>
                      AI-powered recommendations for next steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedContract.keyPoints.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{recommendation}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Zap className="w-3 h-3 mr-1" />
                            Act
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Contract</DialogTitle>
            <DialogDescription>
              Upload your purchase agreement, addendums, or other contract documents for AI analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Document Type</label>
              <Select defaultValue="purchase-agreement">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase-agreement">Purchase Agreement</SelectItem>
                  <SelectItem value="counter-offer">Counter Offer</SelectItem>
                  <SelectItem value="addendum">Contract Addendum</SelectItem>
                  <SelectItem value="disclosure">Property Disclosure</SelectItem>
                  <SelectItem value="other">Other Contract Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h4 className="font-medium mb-2">Upload Contract Documents</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: PDF, DOC, DOCX (Max 25MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Files
              </Button>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Notice:</strong> Your contract documents are analyzed securely and are not stored permanently. Analysis is completed locally and privately.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentViewer} onOpenChange={setShowDocumentViewer}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Contract Viewer</DialogTitle>
            <DialogDescription>
              {selectedContract?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Contract Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full document viewer would be implemented here
              </p>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {contracts.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Contracts Uploaded</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your purchase agreement or other contract documents to get started with AI-powered analysis
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Contract
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
