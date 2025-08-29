import React, { useState, Suspense } from 'react';
import { Folder, Users, Copy, Mail, Link, Globe, Lock, Settings, UserPlus, UserMinus, Shield, ChevronDown, AlertCircle } from 'lucide-react';
import { DownloadButton, DarkDownloadButton } from './ui/download-button';
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
import { DocumentTemplateManager } from './documents/DocumentTemplateManager';

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

interface SetupData {
  buyerEmail: string;
  buyerName: string;
}

interface DocumentsProps {
  setupData?: SetupData | null;
}

export default function Documents({ setupData }: DocumentsProps) {
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


  // Document templates (empty for now)
  const documentTemplates: any[] = [];

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
          <p>�� Foundation/Structural Inspection</p>
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
          <p>��� Credit at closing in the amount of $ _________________________</p>
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
          <p>Water Damage: ☐ Yes ☐ No �� Unknown   Details: _________________________</p>
          <p>Mold/Mildew: ☐ Yes ☐ No ☐ Unknown   Details: _________________________</p>
          <p>Pest Infestation: �� Yes ☐ No ☐ Unknown   Details: _________________________</p>
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

  // Function to handle manage access
  const handleManageAccess = (doc: Document) => {
    setShareDocument(doc);
    setShowManageAccessDialog(true);
  };

  // Function to generate public link
  const generatePublicLink = () => {
    const linkId = Math.random().toString(36).substr(2, 9);
    const link = `https://handoff.app/shared/${shareDocument?.id}/${linkId}`;
    setPublicLink(link);
    return link;
  };

  // Function to copy link to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Function to add user to document
  const addUserToDocument = () => {
    if (!shareEmail || !shareDocument) return;

    const newUser: SharedUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: shareEmail.split('@')[0],
      email: shareEmail,
      role: shareRole,
      addedDate: new Date().toISOString().split('T')[0]
    };

    // In a real app, this would update the backend
    alert(`Access granted to ${shareEmail} as ${shareRole}`);
    setShareEmail('');
    setShowShareDialog(false);
  };

  // Function to remove user access
  const removeUserAccess = (userId: string, userName: string) => {
    if (confirm(`Remove access for ${userName}?`)) {
      // In a real app, this would update the backend
      alert(`Access removed for ${userName}`);
    }
  };

  // Function to change user role
  const changeUserRole = (userId: string, newRole: 'viewer' | 'editor') => {
    // In a real app, this would update the backend
    alert(`User role changed to ${newRole}`);
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

      <Tabs defaultValue="contract" className="w-full">
        <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start overflow-x-auto">
          <TabsTrigger
            value="contract"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Contract Analysis
          </TabsTrigger>
          <TabsTrigger
            value="offer"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Offer Builder
          </TabsTrigger>
          {/* Hidden temporarily - signatures and shared tabs */}
          {/* <TabsTrigger
            value="shared"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Shared
          </TabsTrigger> */}
          {!isMobile && (
            <>
              {/* <TabsTrigger
                value="signatures"
                className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
              >
                Signatures Needed
              </TabsTrigger> */}
              <TabsTrigger
                value="templates"
                className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
              >
                Templates
              </TabsTrigger>
            </>
          )}
        </TabsList>


        {/* Hidden temporarily - shared tab content */}
        {/* <TabsContent value="shared" className="space-y-6 bg-white">
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
                        onClick={() => handleManageAccess(doc)}
                      >
                        <Users className="w-4 h-4 mr-1" />
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
        </TabsContent> */}

        {/* Hidden temporarily - signatures tab content */}
        {/* <TabsContent value="signatures" className="space-y-6 bg-white">
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
        </TabsContent> */}

        <TabsContent value="archive" className="space-y-6 bg-white">
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

        <TabsContent value="contract" className="space-y-6 bg-white">
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

        <TabsContent value="offer" className="space-y-6 bg-white">
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

            <TabsContent value="templates" className="space-y-6 bg-white">
              <DocumentTemplateManager
                onDocumentCreated={(document) => {
                  console.log('Document created:', document);
                  // In a real app, you would add this to your documents state
                }}
                onDocumentUpdated={(document) => {
                  console.log('Document updated:', document);
                  // In a real app, you would update this in your documents state
                }}
              />
            </TabsContent>

          </>
        )}
      </Tabs>

      {/* Manage Access Dialog */}
      <Dialog open={showManageAccessDialog} onOpenChange={setShowManageAccessDialog}>
        <DialogContent className="max-w-2xl bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage Document Access
            </DialogTitle>
            <DialogDescription>
              {shareDocument ? `Manage access and permissions for "${shareDocument.name}"` : 'Manage document access'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Current Users */}
            {shareDocument?.sharedWith && shareDocument.sharedWith.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  People with access ({shareDocument.sharedWith.length})
                </h4>
                <div className="space-y-3">
                  {shareDocument.sharedWith.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {user.addedDate}
                            {user.lastAccessed && ` • Last accessed ${user.lastAccessed}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(newRole: 'viewer' | 'editor') => changeUserRole(user.id, newRole)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeUserAccess(user.id, user.name)}
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove access</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Add New User */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add People
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="md:col-span-2"
                  />
                  <Select value={shareRole} onValueChange={(value: 'viewer' | 'editor') => setShareRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="allow-download"
                      checked={allowDownload}
                      onCheckedChange={setAllowDownload}
                    />
                    <label htmlFor="allow-download" className="text-sm">Allow download</label>
                  </div>
                  <Select value={shareExpiration} onValueChange={setShareExpiration}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">No expiry</SelectItem>
                      <SelectItem value="7days">7 days</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={addUserToDocument}
                  disabled={!shareEmail}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Person
                </Button>
              </div>
            </div>

            <Separator />

            {/* Public Link Sharing */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Share with Link
              </h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={publicLink}
                    placeholder="Generate a shareable link"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => generatePublicLink()}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                {publicLink && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(publicLink)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const mailtoLink = `mailto:?subject=Shared Document: ${shareDocument?.name}&body=${encodeURIComponent(`View document: ${publicLink}`)}`;
                        window.location.href = mailtoLink;
                      }}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Link
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <Select value={linkExpiration} onValueChange={setLinkExpiration}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 days</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="never">No expiry</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">Link expires in {linkExpiration === 'never' ? 'no time limit' : linkExpiration}</span>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Anyone with this link can access the document. Only share with trusted recipients.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowManageAccessDialog(false);
                  setShareDocument(null);
                  setShareEmail('');
                  setPublicLink('');
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-white border-gray-200 shadow-xl">
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
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={shareRole} onValueChange={(value: 'viewer' | 'editor') => setShareRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Can view only</SelectItem>
                  <SelectItem value="editor">Editor - Can view and edit</SelectItem>
                </SelectContent>
              </Select>
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
                onClick={addUserToDocument}
                disabled={!shareEmail}
              >
                <Share className="w-4 h-4 mr-2" />
                Share Document
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
              The recipient will receive an email with access to view this document.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
