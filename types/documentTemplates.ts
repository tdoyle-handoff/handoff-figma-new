export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'purchase-agreement' | 'termination' | 'counter-offer' | 'disclosure' | 'inspection';
  fields: TemplateField[];
  sections?: TemplateSection[];
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'currency' | 'checkbox' | 'signature';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface TemplateSection {
  id: string;
  title: string;
  fields: string[]; // field IDs
  description?: string;
}

// Form data interfaces for each template type
export interface PurchaseAgreementData {
  // Parties
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  
  // Property
  propertyAddress: string;
  city: string;
  county: string;
  state: string;
  lotSize: string;
  
  // Items
  itemsIncluded: string;
  itemsExcluded: string;
  
  // Purchase Price
  purchasePrice: number;
  depositAmount: number;
  additionalDeposit: number;
  additionalDepositDate: string;
  cashAtClosing: number;
  otherPayment: string;
  
  // Mortgage
  mortgageAmount: number;
  mortgageTerm: number;
  interestRate: number;
  mortgageType: 'conventional' | 'fha' | 'va';
  businessDaysToApply: number;
  mortgageContingencyDate: string;
  sellerContribution: number;
  
  // Other Terms
  otherTerms: string;
  
  // Title and Survey
  titleInsurance: 'purchaser' | 'seller';
  intendedUse: string;
  
  // Deed
  deedType: string;
  
  // Closing
  closingDate: string;
  
  // Deposits
  listingBroker: string;
  
  // Time Period
  offerExpirationDate: string;
  offerExpirationTime: string;
  
  // Brokers
  realEstateBroker: string;
  cooperatingBroker: string;
  cooperatingBrokerCommission: number;
  
  // Attorney Approval
  attorneyApprovalDate: string;
  
  // Inspections
  structuralInspection: boolean;
  pestInspection: boolean;
  septicInspection: boolean;
  wellWaterTest: boolean;
  radonInspection: boolean;
  inspectionDate: string;
  
  // Contact Information
  purchaserAttorney: string;
  sellerAttorney: string;
  purchaserEmail: string;
  sellerEmail: string;
  purchaserPhone: string;
  sellerPhone: string;
}

export interface TerminationLetterData {
  sellerName: string;
  buyerName: string;
  propertyAddress: string;
  contractDate: string;
  distributionDetails: {
    amount: number;
    recipient: string;
  }[];
  sellerSignature: string;
  sellerDate: string;
  buyerSignature: string;
  buyerDate: string;
}

export interface CounterOfferData {
  originalOfferDate: string;
  propertyAddress: string;
  sellerName: string;
  buyerName: string;
  counterOfferTerms: string;
  expirationTime: string;
  expirationDate: string;
  acceptanceType: 'accepts' | 'rejects' | 'partially-accepts';
  additionalChanges: string;
  sellerSignature: string;
  sellerDate: string;
  buyerSignature: string;
  buyerDate: string;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  fileName: string;
  data: any;
  createdAt: string;
  pdfUrl?: string;
  status: 'draft' | 'completed' | 'signed';
}
