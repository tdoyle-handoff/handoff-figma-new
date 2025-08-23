import React, { useState, Suspense } from 'react';
import { FileText, Upload, Download, Share, Eye, Trash2, Plus, Search, Filter, Calendar, User, CheckCircle, Clock, AlertCircle, Folder, Users, Copy, Mail, Link, Globe, Lock, Settings, UserPlus, UserMinus, Shield } from 'lucide-react';
import ContractAnalysis from './ContractAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useIsMobile } from './ui/use-mobile';

const OfferBuilder = React.lazy(() => import('./OfferBuilder'));

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
  permissions?: DocumentPermissions;
  sharedWith?: SharedUser[];
}

interface DocumentPermissions {
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
  canDownload: boolean;
  expiresAt?: string;
}

interface SharedUser {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'owner';
  avatar?: string;
  addedDate: string;
  lastAccessed?: string;
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
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showManageAccessDialog, setShowManageAccessDialog] = useState(false);
  const [shareDocument, setShareDocument] = useState<Document | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer');
  const [shareExpiration, setShareExpiration] = useState<string>('never');
  const [allowDownload, setAllowDownload] = useState(true);
  const [publicLink, setPublicLink] = useState('');
  const [linkExpiration, setLinkExpiration] = useState<string>('7days');
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
      required: true,
      sharedWith: [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@realty.com',
          role: 'editor',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c56495e2?w=32&h=32&fit=crop&crop=face',
          addedDate: '2025-01-10',
          lastAccessed: '2025-01-14'
        },
        {
          id: '2',
          name: 'Michael Torres',
          email: 'michael@torres.com',
          role: 'viewer',
          addedDate: '2025-01-12'
        }
      ]
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
      required: true,
      sharedWith: [
        {
          id: '3',
          name: 'Property Seller',
          email: 'seller@property.com',
          role: 'viewer',
          addedDate: '2025-01-14'
        }
      ]
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
      required: false,
      sharedWith: [
        {
          id: '4',
          name: 'Mike Thompson',
          email: 'mike@inspections.com',
          role: 'editor',
          addedDate: '2025-02-10'
        }
      ]
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
      required: true,
      sharedWith: [
        {
          id: '5',
          name: 'First Title Company',
          email: 'title@firsttitle.com',
          role: 'editor',
          addedDate: '2025-02-12'
        }
      ]
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

  // Document templates with real content
  const documentTemplates = [
    {
      id: 'purchase-agreement',
      name: 'Purchase Agreement',
      description: 'Standard residential purchase agreement template',
      category: 'contracts',
      content: generatePurchaseAgreementTemplate
    },
    {
      id: 'counter-offer',
      name: 'Counter Offer',
      description: 'Counter offer form for purchase negotiations',
      category: 'contracts',
      content: generateCounterOfferTemplate
    },
    {
      id: 'inspection-addendum',
      name: 'Inspection Addendum',
      description: 'Property inspection addendum form',
      category: 'inspections',
      content: generateInspectionAddendumTemplate
    },
    {
      id: 'repair-request',
      name: 'Repair Request',
      description: 'Request for repairs based on inspection findings',
      category: 'inspections',
      content: generateRepairRequestTemplate
    },
    {
      id: 'disclosure-statement',
      name: 'Property Disclosure Statement',
      description: 'Seller property disclosure form',
      category: 'disclosures',
      content: generateDisclosureStatementTemplate
    },
    {
      id: 'financing-contingency',
      name: 'Financing Contingency Addendum',
      description: 'Addendum for financing contingency terms',
      category: 'financing',
      content: generateFinancingContingencyTemplate
    }
  ];

  // Template generation functions
  function generatePurchaseAgreementTemplate() {
    const buyerName = setupData?.buyerName || '[BUYER NAME]';
    const buyerEmail = setupData?.buyerEmail || '[BUYER EMAIL]';

    return `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">RESIDENTIAL PURCHASE AGREEMENT</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px;">This document constitutes a legally binding agreement</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PROPERTY INFORMATION</h3>
          <p><strong>Property Address:</strong> _________________________________</p>
          <p><strong>Legal Description:</strong> To be inserted from title report</p>
          <p><strong>Assessor's Parcel Number (APN):</strong> _________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">BUYER INFORMATION</h3>
          <p><strong>Buyer Name:</strong> ${buyerName}</p>
          <p><strong>Email:</strong> ${buyerEmail}</p>
          <p><strong>Phone:</strong> _________________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PURCHASE TERMS</h3>
          <p><strong>Purchase Price:</strong> $ _________________________</p>
          <p><strong>Earnest Money Deposit:</strong> $ _________________ to be deposited within _____ business days</p>
          <p><strong>Down Payment:</strong> $ _________________________</p>
          <p><strong>Loan Amount:</strong> $ _________________________</p>
          <p><strong>Financing Type:</strong> _________________________</p>
          <p><strong>Closing Date:</strong> _________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">CONTINGENCIES</h3>
          <p>☐ <strong>Inspection Contingency:</strong> Buyer has _____ days to complete inspections</p>
          <p>☐ <strong>Appraisal Contingency:</strong> Property must appraise for at least the purchase price</p>
          <p>☐ <strong>Financing Contingency:</strong> Buyer has _____ days to obtain loan approval</p>
          <p>☐ <strong>Home Sale Contingency:</strong> Sale contingent upon buyer's existing home sale</p>
        </div>

        <div style="margin-bottom: 40px; border: 2px solid #000; padding: 15px;">
          <p style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">LEGAL NOTICE:</p>
          <p style="font-size: 12px; margin-bottom: 8px;">This is a legally binding contract. If not understood, seek competent legal advice before signing.</p>
          <p style="font-size: 12px;">Time is of the essence. All deadlines in this agreement are strictly enforced.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SIGNATURES</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div style="width: 45%;">
              <p><strong>BUYER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">${buyerName}</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
            <div style="width: 45%;">
              <p><strong>SELLER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">[Seller Name]</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} • Handoff Real Estate Platform</p>
        </div>
      </div>
    `;
  }

  function generateCounterOfferTemplate() {
    const buyerName = setupData?.buyerName || '[BUYER NAME]';

    return `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">COUNTER OFFER</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px;">Addendum to Purchase Agreement</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">REFERENCE INFORMATION</h3>
          <p><strong>Original Offer Date:</strong> _________________________</p>
          <p><strong>Property Address:</strong> _________________________________</p>
          <p><strong>Buyer:</strong> ${buyerName}</p>
          <p><strong>Seller:</strong> _________________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">COUNTER OFFER TERMS</h3>
          <p>The undersigned hereby submits the following counter offer to the original purchase agreement:</p>
          <br>
          <p>☐ <strong>Purchase Price:</strong> $ _________________________</p>
          <p>☐ <strong>Closing Date:</strong> _________________________</p>
          <p>☐ <strong>Earnest Money:</strong> $ _________________________</p>
          <p>☐ <strong>Inspection Period:</strong> _____ days</p>
          <p>☐ <strong>Financing Contingency:</strong> _____ days</p>
          <br>
          <p><strong>Additional Terms:</strong></p>
          <div style="border: 1px solid #ccc; min-height: 100px; padding: 10px; margin: 10px 0;">
            _________________________________________________________________<br>
            _________________________________________________________________<br>
            _________________________________________________________________<br>
            _________________________________________________________________<br>
            _________________________________________________________________
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">ACCEPTANCE DEADLINE</h3>
          <p>This counter offer must be accepted by: <strong>_________________ at _______ AM/PM</strong></p>
          <p>If not accepted by the deadline, this counter offer is automatically withdrawn.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SIGNATURES</h3>
          <div style="margin-bottom: 30px;">
            <p><strong>COUNTER OFFER SUBMITTED BY:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 30px; margin: 10px 0 5px 0;"></div>
            <p style="font-size: 12px;">Signature</p>
            <p style="font-size: 12px;">Date: _______________ Time: _______________</p>
          </div>

          <div style="margin-bottom: 30px;">
            <p><strong>COUNTER OFFER ACCEPTED BY:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 30px; margin: 10px 0 5px 0;"></div>
            <p style="font-size: 12px;">Signature</p>
            <p style="font-size: 12px;">Date: _______________ Time: _______________</p>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} • Handoff Real Estate Platform</p>
        </div>
      </div>
    `;
  }

  function generateInspectionAddendumTemplate() {
    const buyerName = setupData?.buyerName || '[BUYER NAME]';

    return `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">INSPECTION ADDENDUM</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px;">Property Inspection Terms and Conditions</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PROPERTY INFORMATION</h3>
          <p><strong>Property Address:</strong> _________________________________</p>
          <p><strong>Buyer:</strong> ${buyerName}</p>
          <p><strong>Seller:</strong> _________________________________</p>
          <p><strong>Purchase Agreement Date:</strong> _________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">INSPECTION TERMS</h3>
          <p><strong>Inspection Period:</strong> _____ days from acceptance of this agreement</p>
          <p><strong>Inspection Deadline:</strong> _________________ at 11:59 PM</p>
          <p><strong>Inspector Access:</strong> Seller shall provide reasonable access to the property</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">TYPES OF INSPECTIONS</h3>
          <p>Buyer may conduct the following inspections at Buyer's expense:</p>
          <p>☐ General Home Inspection</p>
          <p>☐ Pest/Termite Inspection</p>
          <p>☐ Roof Inspection</p>
          <p>☐ HVAC System Inspection</p>
          <p>☐ Electrical System Inspection</p>
          <p>☐ Plumbing Inspection</p>
          <p>☐ Foundation/Structural Inspection</p>
          <p>☐ Environmental Testing (Radon, Mold, etc.)</p>
          <p>☐ Well/Septic Inspection (if applicable)</p>
          <p>☐ Other: _________________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">BUYER'S OPTIONS</h3>
          <p>Upon completion of inspections, Buyer may:</p>
          <p>1. Accept the property in its current condition and proceed with the purchase</p>
          <p>2. Request repairs or credits from Seller (see Repair Request form)</p>
          <p>3. Cancel this agreement and receive a full refund of earnest money</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">NOTICE REQUIREMENTS</h3>
          <p>Any notice of inspection objections or cancellation must be delivered to Seller in writing by the inspection deadline.</p>
          <p>Failure to provide notice by the deadline constitutes acceptance of the property condition.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SIGNATURES</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div style="width: 45%;">
              <p><strong>BUYER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">${buyerName}</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
            <div style="width: 45%;">
              <p><strong>SELLER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">[Seller Name]</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} • Handoff Real Estate Platform</p>
        </div>
      </div>
    `;
  }

  function generateRepairRequestTemplate() {
    const buyerName = setupData?.buyerName || '[BUYER NAME]';

    return `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">REPAIR REQUEST</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px;">Based on Property Inspection Findings</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PROPERTY INFORMATION</h3>
          <p><strong>Property Address:</strong> _________________________________</p>
          <p><strong>Buyer:</strong> ${buyerName}</p>
          <p><strong>Seller:</strong> _________________________________</p>
          <p><strong>Inspection Date:</strong> _________________________</p>
          <p><strong>Inspector:</strong> _________________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">REQUESTED REPAIRS</h3>
          <p>Based on the inspection report, Buyer requests the following repairs be completed prior to closing:</p>
          <br>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Item #</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Location</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Issue Description</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Requested Action</th>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">1</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">2</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">3</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">4</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">5</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
              <td style="border: 1px solid #000; padding: 8px;">_______________</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">ALTERNATIVE OPTIONS</h3>
          <p>In lieu of completing the above repairs, Buyer will accept:</p>
          <p>☐ Credit at closing in the amount of $ _________________________</p>
          <p>☐ Reduction in purchase price of $ _________________________</p>
          <p>☐ Escrow holdback of $ _________________________ for completion of repairs after closing</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">RESPONSE DEADLINE</h3>
          <p>Seller must respond to this repair request by: <strong>_________________ at _______ AM/PM</strong></p>
          <p>If Seller does not respond by the deadline, Buyer may cancel the agreement and receive a full refund of earnest money.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SIGNATURES</h3>
          <div style="margin-bottom: 30px;">
            <p><strong>BUYER REQUEST:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 30px; margin: 10px 0 5px 0;"></div>
            <p style="font-size: 12px;">${buyerName}</p>
            <p style="font-size: 12px;">Date: _______________ Time: _______________</p>
          </div>

          <div style="margin-bottom: 30px;">
            <p><strong>SELLER RESPONSE:</strong></p>
            <p>☐ Agree to complete all requested repairs</p>
            <p>☐ Agree to alternative option (specify): ___________________________</p>
            <p>☐ Counter with different terms (attach separate document)</p>
            <p>☐ Decline repair request</p>
            <br>
            <div style="border-bottom: 1px solid #000; height: 30px; margin: 10px 0 5px 0;"></div>
            <p style="font-size: 12px;">[Seller Name]</p>
            <p style="font-size: 12px;">Date: _______________ Time: _______________</p>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} • Handoff Real Estate Platform</p>
        </div>
      </div>
    `;
  }

  function generateDisclosureStatementTemplate() {
    return `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">PROPERTY DISCLOSURE STATEMENT</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px;">Seller's Disclosure of Property Condition</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PROPERTY INFORMATION</h3>
          <p><strong>Property Address:</strong> _________________________________</p>
          <p><strong>Seller(s):</strong> _________________________________</p>
          <p><strong>Date of Disclosure:</strong> _________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">SELLER'S KNOWLEDGE</h3>
          <p>The following disclosures are made based on Seller's actual knowledge of the property as of the date of this disclosure:</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">STRUCTURAL CONDITIONS</h3>
          <p>Has the property ever had any issues with:</p>
          <p>Foundation: ☐ Yes ☐ No ☐ Unknown   If yes, describe: _________________________</p>
          <p>Roof: ☐ Yes ☐ No ☐ Unknown   If yes, describe: _________________________</p>
          <p>Walls/Ceilings: ☐ Yes ☐ No ☐ Unknown   If yes, describe: _________________________</p>
          <p>Windows/Doors: ☐ Yes ☐ No ☐ Unknown   If yes, describe: _________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">SYSTEMS</h3>
          <p>Electrical System: ☐ Yes ☐ No ☐ Unknown   Issues: _________________________</p>
          <p>Plumbing System: ☐ Yes ☐ No ☐ Unknown   Issues: _________________________</p>
          <p>HVAC System: ☐ Yes ☐ No ☐ Unknown   Issues: _________________________</p>
          <p>Security System: ☐ Yes ☐ No ☐ Unknown   Issues: _________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">ENVIRONMENTAL CONDITIONS</h3>
          <p>Water Damage: ☐ Yes ☐ No ☐ Unknown   Details: _________________________</p>
          <p>Mold/Mildew: ☐ Yes ☐ No ☐ Unknown   Details: _________________________</p>
          <p>Pest Infestation: ☐ Yes ☐ No ☐ Unknown   Details: _________________________</p>
          <p>Asbestos: ☐ Yes ☐ No ☐ Unknown   Details: _________________________</p>
          <p>Lead Paint: ☐ Yes ☐ No ☐ Unknown   Details: _________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">ADDITIONAL DISCLOSURES</h3>
          <div style="border: 1px solid #ccc; min-height: 100px; padding: 10px; margin: 10px 0;">
            Please describe any other material facts about the property that a buyer should know:
            <br><br>
            _________________________________________________________________<br>
            _________________________________________________________________<br>
            _________________________________________________________________<br>
            _________________________________________________________________
          </div>
        </div>

        <div style="margin-bottom: 30px; border: 2px solid #000; padding: 15px;">
          <p style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">SELLER CERTIFICATION:</p>
          <p style="font-size: 12px;">I certify that the information provided in this disclosure is true and complete to the best of my knowledge as of the date signed. I understand that this disclosure is not a warranty and that buyers should conduct their own inspections.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SIGNATURES</h3>
          <div style="margin-bottom: 30px;">
            <p><strong>SELLER:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 30px; margin: 10px 0 5px 0;"></div>
            <p style="font-size: 12px;">[Seller Name]</p>
            <p style="font-size: 12px;">Date: _______________</p>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} • Handoff Real Estate Platform</p>
        </div>
      </div>
    `;
  }

  function generateFinancingContingencyTemplate() {
    const buyerName = setupData?.buyerName || '[BUYER NAME]';

    return `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">FINANCING CONTINGENCY ADDENDUM</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px;">Addendum to Purchase Agreement</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PROPERTY INFORMATION</h3>
          <p><strong>Property Address:</strong> _________________________________</p>
          <p><strong>Buyer:</strong> ${buyerName}</p>
          <p><strong>Seller:</strong> _________________________________</p>
          <p><strong>Purchase Price:</strong> $ _________________________</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">FINANCING TERMS</h3>
          <p><strong>Loan Amount:</strong> $ _________________________</p>
          <p><strong>Loan Type:</strong> ☐ Conventional ☐ FHA ☐ VA ☐ USDA ☐ Other: ___________</p>
          <p><strong>Down Payment:</strong> $ _________________________ (_____% of purchase price)</p>
          <p><strong>Maximum Interest Rate:</strong> _____% (if applicable)</p>
          <p><strong>Loan Term:</strong> _____ years</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">CONTINGENCY DEADLINES</h3>
          <p><strong>Loan Application Deadline:</strong> _____ days from acceptance</p>
          <p><strong>Loan Approval Deadline:</strong> _____ days from acceptance</p>
          <p><strong>Final Loan Commitment Deadline:</strong> _____ days prior to closing</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">BUYER OBLIGATIONS</h3>
          <p>Buyer agrees to:</p>
          <p>• Submit complete loan application within _____ days</p>
          <p>• Provide all requested documentation to lender promptly</p>
          <p>• Not make any major purchases or changes to credit without lender approval</p>
          <p>• Maintain employment and income as represented in loan application</p>
          <p>• Pay all loan-related fees and costs</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">CONTINGENCY REMOVAL</h3>
          <p>This financing contingency will be considered satisfied when:</p>
          <p>☐ Buyer receives written loan commitment from lender</p>
          <p>☐ Buyer provides written notice of loan approval to Seller</p>
          <p>☐ Buyer fails to notify Seller of loan denial by the deadline</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">LOAN DENIAL</h3>
          <p>If Buyer's loan is denied and Buyer provides written notice to Seller within the deadline, Buyer may cancel this agreement and receive a full refund of earnest money.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SIGNATURES</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div style="width: 45%;">
              <p><strong>BUYER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">${buyerName}</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
            <div style="width: 45%;">
              <p><strong>SELLER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">[Seller Name]</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} • Handoff Real Estate Platform</p>
        </div>
      </div>
    `;
  }

  // Function to download template
  const downloadTemplate = (template: any) => {
    const htmlContent = template.content();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${template.name}</title>
            <style>
              @page { margin: 0.5in; }
              body { margin: 0; }
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
            <div class="no-print" style="text-align: center; margin: 20px; page-break-before: always;">
              <button onclick="window.print()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">Print/Save as PDF</button>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">Use your browser's print function to save as PDF</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Function to handle sharing
  const handleShare = (doc: Document) => {
    setShareDocument(doc);
    setShowShareDialog(true);
  };

  // Function to send share
  const sendShare = () => {
    if (shareDocument && shareEmail) {
      // Simulate sharing functionality
      const shareLink = `https://handoff.app/share/${shareDocument.id}`;
      const emailBody = shareMessage || `I'm sharing a document with you: ${shareDocument.name}`;

      // Create mailto link
      const mailtoLink = `mailto:${shareEmail}?subject=Shared Document: ${shareDocument.name}&body=${encodeURIComponent(emailBody + '\n\nView document: ' + shareLink)}`;

      // Open mail client
      window.location.href = mailtoLink;

      // Reset form
      setShareEmail('');
      setShareMessage('');
      setShowShareDialog(false);
      setShareDocument(null);

      // Show success message (in a real app, you'd use a toast notification)
      alert('Share link has been prepared in your email client!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
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
            <DialogContent aria-describedby="upload-dialog-description" className="bg-white border border-gray-300 shadow-xl">
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
                <div className="text-center border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-8">
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-700 mb-2">
                    Drag and drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 25MB)
                  </p>
                  <Button variant="outline" className="mt-4 mobile-button border-gray-400 text-gray-700 hover:bg-gray-100">
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
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 tab-container-multiline' : 'grid-cols-6'}`}>
          <TabsTrigger value="all" className={isMobile ? 'tab-multiline' : ''}>
            {isMobile ? 'Documents' : 'All Documents'}
          </TabsTrigger>
          <TabsTrigger value="contract" className={isMobile ? 'tab-multiline' : ''}>
            Contract Analysis
          </TabsTrigger>
          <TabsTrigger value="offer" className={isMobile ? 'tab-multiline' : ''}>
            Offer Builder
          </TabsTrigger>
          <TabsTrigger value="shared" className={isMobile ? 'tab-multiline' : ''}>Shared</TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="signatures" className="tab-multiline">Signatures Needed</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
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
                        onClick={() => handleShare(doc)}
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
                        onClick={() => handleShare(doc)}
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

        <TabsContent value="contract" className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading Contract Analysis...</p>
              </CardContent>
            </Card>
          }>
            <ContractAnalysis />
          </Suspense>
        </TabsContent>

        <TabsContent value="offer" className="space-y-6">
          <Suspense fallback={
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading Offer Builder...</p>
              </CardContent>
            </Card>
          }>
            <OfferBuilder />
          </Suspense>
        </TabsContent>

        {!isMobile && (
          <>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Templates</CardTitle>
                  <CardDescription>Professional real estate forms ready for download and customization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentTemplates.map((template) => (
                      <Card key={template.id} className="border-dashed hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-medium mb-1">{template.name}</div>
                              <div className="text-sm text-muted-foreground mb-2">{template.description}</div>
                              <Badge variant="outline" className="text-xs">
                                {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => downloadTemplate(template)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                const htmlContent = template.content();
                                const previewWindow = window.open('', '_blank');
                                if (previewWindow) {
                                  previewWindow.document.write(`
                                    <html>
                                      <head><title>${template.name} - Preview</title></head>
                                      <body style="padding: 20px;">
                                        ${htmlContent}
                                        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
                                          <button onclick="window.close()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Close Preview</button>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  previewWindow.document.close();
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">How to Use Templates</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Click "Preview" to view the template content</li>
                      <li>• Click "Download" to open in a new window for printing or saving as PDF</li>
                      <li>• Templates automatically include your buyer information when available</li>
                      <li>• All templates are legally compliant and professionally formatted</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </>
        )}
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-white shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              {shareDocument ? `Share "${shareDocument.name}" with others` : 'Share document'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
              <Textarea
                placeholder="Add a message to include with the shared document..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={sendShare}
                disabled={!shareEmail}
              >
                <Share className="w-4 h-4 mr-2" />
                Send Share Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(false);
                  setShareDocument(null);
                  setShareEmail('');
                  setShareMessage('');
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              A secure link will be sent to the recipient allowing them to view this document.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
