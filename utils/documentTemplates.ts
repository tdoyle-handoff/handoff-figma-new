import { DocumentTemplate } from '../types/documentTemplates';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'purchase-agreement',
    name: 'Standard Form Contract for Purchase and Sale of Real Estate',
    description: 'Complete purchase agreement for real estate transactions in New York State',
    category: 'purchase-agreement',
    sections: [
      { id: 'parties', title: 'Identification of Parties', description: 'Information about the seller and purchaser', fields: ['sellerName', 'sellerAddress', 'buyerName', 'buyerAddress'] },
      { id: 'property', title: 'Property to be Sold', description: 'Details about the property being purchased', fields: ['propertyAddress', 'city', 'county', 'state', 'lotSize'] },
      { id: 'items', title: 'Items Included/Excluded', description: 'Items included and excluded from the sale', fields: ['itemsIncluded', 'itemsExcluded'] },
      { id: 'purchase-price', title: 'Purchase Price', description: 'Payment terms and amounts', fields: ['purchasePrice', 'depositAmount', 'additionalDeposit', 'additionalDepositDate', 'cashAtClosing', 'otherPayment'] },
      { id: 'mortgage', title: 'Mortgage Contingency', description: 'Mortgage financing details', fields: ['mortgageAmount', 'mortgageTerm', 'interestRate', 'mortgageType', 'businessDaysToApply', 'mortgageContingencyDate', 'sellerContribution'] },
      { id: 'other-terms', title: 'Other Terms', description: 'Additional contract terms', fields: ['otherTerms'] },
      { id: 'title-survey', title: 'Title and Survey', description: 'Title insurance and property use', fields: ['titleInsurance', 'intendedUse'] },
      { id: 'closing', title: 'Transfer of Title/Possession', description: 'Closing date and arrangements', fields: ['closingDate'] },
      { id: 'inspections', title: 'Inspections', description: 'Property inspection requirements', fields: ['structuralInspection', 'pestInspection', 'septicInspection', 'wellWaterTest', 'radonInspection', 'inspectionDate'] },
      { id: 'contact-info', title: 'Contact Information', description: 'Attorney and party contact details', fields: ['purchaserAttorney', 'sellerAttorney', 'purchaserEmail', 'sellerEmail', 'purchaserPhone', 'sellerPhone'] }
    ],
    fields: [
      { id: 'sellerName', name: 'sellerName', label: 'Seller Name', type: 'text', required: true },
      { id: 'sellerAddress', name: 'sellerAddress', label: 'Seller Address', type: 'textarea', required: true },
      { id: 'buyerName', name: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
      { id: 'buyerAddress', name: 'buyerAddress', label: 'Buyer Address', type: 'textarea', required: true },
      { id: 'propertyAddress', name: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { id: 'city', name: 'city', label: 'City/Village/Town', type: 'text', required: true },
      { id: 'county', name: 'county', label: 'County', type: 'text', required: true },
      { id: 'state', name: 'state', label: 'State', type: 'text', defaultValue: 'New York', required: true },
      { id: 'lotSize', name: 'lotSize', label: 'Lot Size (approximately)', type: 'text' },
      { id: 'itemsIncluded', name: 'itemsIncluded', label: 'Items Included in Sale', type: 'textarea', placeholder: 'List all items included in the sale...' },
      { id: 'itemsExcluded', name: 'itemsExcluded', label: 'Items Excluded from Sale', type: 'textarea', placeholder: 'List all items excluded from the sale...' },
      { id: 'purchasePrice', name: 'purchasePrice', label: 'Purchase Price ($)', type: 'currency', required: true },
      { id: 'depositAmount', name: 'depositAmount', label: 'Deposit Amount ($)', type: 'currency', required: true },
      { id: 'additionalDeposit', name: 'additionalDeposit', label: 'Additional Deposit ($)', type: 'currency' },
      { id: 'additionalDepositDate', name: 'additionalDepositDate', label: 'Additional Deposit Date', type: 'date' },
      { id: 'cashAtClosing', name: 'cashAtClosing', label: 'Cash at Closing ($)', type: 'currency', required: true },
      { id: 'otherPayment', name: 'otherPayment', label: 'Other Payment Terms', type: 'text' },
      { id: 'mortgageAmount', name: 'mortgageAmount', label: 'Mortgage Amount ($)', type: 'currency' },
      { id: 'mortgageTerm', name: 'mortgageTerm', label: 'Mortgage Term (years)', type: 'number' },
      { id: 'interestRate', name: 'interestRate', label: 'Maximum Interest Rate (%)', type: 'number' },
      { id: 'mortgageType', name: 'mortgageType', label: 'Mortgage Type', type: 'select', options: ['Conventional', 'FHA', 'VA'] },
      { id: 'businessDaysToApply', name: 'businessDaysToApply', label: 'Business Days to Apply', type: 'number' },
      { id: 'mortgageContingencyDate', name: 'mortgageContingencyDate', label: 'Mortgage Contingency Date', type: 'date' },
      { id: 'sellerContribution', name: 'sellerContribution', label: 'Seller Contribution ($)', type: 'currency' },
      { id: 'otherTerms', name: 'otherTerms', label: 'Other Terms', type: 'textarea' },
      { id: 'titleInsurance', name: 'titleInsurance', label: 'Title Insurance Paid By', type: 'select', options: ['Purchaser', 'Seller'], required: true },
      { id: 'intendedUse', name: 'intendedUse', label: 'Intended Use of Property', type: 'text' },
      { id: 'closingDate', name: 'closingDate', label: 'Closing Date', type: 'date', required: true },
      { id: 'structuralInspection', name: 'structuralInspection', label: 'Structural Inspection', type: 'checkbox' },
      { id: 'pestInspection', name: 'pestInspection', label: 'Pest/Termite Inspection', type: 'checkbox' },
      { id: 'septicInspection', name: 'septicInspection', label: 'Septic System Inspection', type: 'checkbox' },
      { id: 'wellWaterTest', name: 'wellWaterTest', label: 'Well Water Flow/Quality Tests', type: 'checkbox' },
      { id: 'radonInspection', name: 'radonInspection', label: 'Radon Inspection', type: 'checkbox' },
      { id: 'inspectionDate', name: 'inspectionDate', label: 'Inspection Completion Date', type: 'date' },
      { id: 'purchaserAttorney', name: 'purchaserAttorney', label: 'Purchaser Attorney', type: 'text' },
      { id: 'sellerAttorney', name: 'sellerAttorney', label: 'Seller Attorney', type: 'text' },
      { id: 'purchaserEmail', name: 'purchaserEmail', label: 'Purchaser Email', type: 'text' },
      { id: 'sellerEmail', name: 'sellerEmail', label: 'Seller Email', type: 'text' },
      { id: 'purchaserPhone', name: 'purchaserPhone', label: 'Purchaser Phone', type: 'text' },
      { id: 'sellerPhone', name: 'sellerPhone', label: 'Seller Phone', type: 'text' }
    ]
  },
  {
    id: 'termination-letter',
    name: 'Letter of Termination of Purchase and Sale',
    description: 'Letter to terminate a purchase and sale agreement',
    category: 'termination',
    sections: [
      { id: 'parties', title: 'Parties Information', description: 'Information about the parties and property', fields: ['sellerName', 'buyerName', 'propertyAddress', 'contractDate'] },
      { id: 'distribution', title: 'Distribution of Funds', description: 'How deposits and funds will be distributed', fields: ['distributionDetails'] },
      { id: 'signatures', title: 'Signatures', description: 'Seller and buyer signatures with dates', fields: ['sellerSignature', 'sellerDate', 'buyerSignature', 'buyerDate'] }
    ],
    fields: [
      { id: 'sellerName', name: 'sellerName', label: 'Seller Name(s)', type: 'text', required: true },
      { id: 'buyerName', name: 'buyerName', label: 'Buyer Name(s)', type: 'text', required: true },
      { id: 'propertyAddress', name: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { id: 'contractDate', name: 'contractDate', label: 'Original Contract Date', type: 'date', required: true },
      { id: 'distributionDetails', name: 'distributionDetails', label: 'Fund Distribution', type: 'textarea', placeholder: 'Describe how deposits and other monies will be distributed...' },
      { id: 'sellerSignature', name: 'sellerSignature', label: 'Seller Signature', type: 'signature' },
      { id: 'sellerDate', name: 'sellerDate', label: 'Seller Date', type: 'date' },
      { id: 'buyerSignature', name: 'buyerSignature', label: 'Buyer Signature', type: 'signature' },
      { id: 'buyerDate', name: 'buyerDate', label: 'Buyer Date', type: 'date' }
    ]
  },
  {
    id: 'counter-offer',
    name: 'Counteroffer to Purchase',
    description: 'Counteroffer response to a purchase offer',
    category: 'counter-offer',
    sections: [
      { id: 'reference', title: 'Original Offer Reference', description: 'Reference to the original purchase offer', fields: ['originalOfferDate', 'propertyAddress', 'sellerName', 'buyerName'] },
      { id: 'counteroffer', title: 'Counteroffer Terms', description: 'Details of the counteroffer', fields: ['counterOfferTerms', 'expirationTime', 'expirationDate'] },
      { id: 'response', title: 'Buyer Response', description: 'Buyer acceptance or rejection', fields: ['acceptanceType', 'additionalChanges'] },
      { id: 'signatures', title: 'Signatures', description: 'Seller and buyer signatures with dates', fields: ['sellerSignature', 'sellerDate', 'buyerSignature', 'buyerDate'] }
    ],
    fields: [
      { id: 'originalOfferDate', name: 'originalOfferDate', label: 'Original Offer Date', type: 'date', required: true },
      { id: 'propertyAddress', name: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { id: 'sellerName', name: 'sellerName', label: 'Seller Name(s)', type: 'text', required: true },
      { id: 'buyerName', name: 'buyerName', label: 'Buyer Name(s)', type: 'text', required: true },
      { id: 'counterOfferTerms', name: 'counterOfferTerms', label: 'Counteroffer Terms', type: 'textarea', required: true, placeholder: 'Describe the specific terms of the counteroffer...' },
      { id: 'expirationTime', name: 'expirationTime', label: 'Expiration Time', type: 'text', placeholder: 'e.g., 5:00 PM' },
      { id: 'expirationDate', name: 'expirationDate', label: 'Expiration Date', type: 'date', required: true },
      { id: 'acceptanceType', name: 'acceptanceType', label: 'Buyer Response', type: 'select', options: ['Accepts', 'Rejects', 'Partially Accepts'], required: true },
      { id: 'additionalChanges', name: 'additionalChanges', label: 'Additional Changes (if partially accepting)', type: 'textarea' },
      { id: 'sellerSignature', name: 'sellerSignature', label: 'Seller Signature', type: 'signature' },
      { id: 'sellerDate', name: 'sellerDate', label: 'Seller Date', type: 'date' },
      { id: 'buyerSignature', name: 'buyerSignature', label: 'Buyer Signature', type: 'signature' },
      { id: 'buyerDate', name: 'buyerDate', label: 'Buyer Date', type: 'date' }
    ]
  }
];

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return DOCUMENT_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): DocumentTemplate[] => {
  return DOCUMENT_TEMPLATES.filter(template => template.category === category);
};
