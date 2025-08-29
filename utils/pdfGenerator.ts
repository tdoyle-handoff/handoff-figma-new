import jsPDF from 'jspdf';
import { DocumentTemplate, PurchaseAgreementData, TerminationLetterData, CounterOfferData } from '../types/documentTemplates';

interface PDFGeneratorOptions {
  template: DocumentTemplate;
  data: any;
  fileName?: string;
}

export class PDFGenerator {
  private doc: jsPDF;
  private yPosition: number = 20;
  private pageHeight: number = 280;
  private leftMargin: number = 20;
  private rightMargin: number = 190;
  private lineHeight: number = 6;

  constructor() {
    this.doc = new jsPDF();
  }

  private checkPageBreak(height: number = 10): void {
    if (this.yPosition + height > this.pageHeight) {
      this.doc.addPage();
      this.yPosition = 20;
    }
  }

  private addText(text: string, x: number = this.leftMargin, fontSize: number = 10, style: 'normal' | 'bold' = 'normal'): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', style);
    
    const lines = this.doc.splitTextToSize(text, this.rightMargin - x);
    const textHeight = lines.length * this.lineHeight;
    
    this.checkPageBreak(textHeight);
    
    this.doc.text(lines, x, this.yPosition);
    this.yPosition += textHeight;
  }

  private addTitle(text: string): void {
    this.checkPageBreak(15);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.leftMargin, this.yPosition);
    this.yPosition += 15;
  }

  private addSubtitle(text: string): void {
    this.checkPageBreak(10);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.leftMargin, this.yPosition);
    this.yPosition += 10;
  }

  private addField(label: string, value: string, inline: boolean = false): void {
    if (inline) {
      this.checkPageBreak();
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label}: `, this.leftMargin, this.yPosition);
      
      const labelWidth = this.doc.getTextWidth(`${label}: `);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value || '________________________', this.leftMargin + labelWidth, this.yPosition);
      this.yPosition += this.lineHeight;
    } else {
      this.addText(`${label}:`, this.leftMargin, 10, 'bold');
      this.addText(value || '________________________', this.leftMargin + 5);
      this.yPosition += 3;
    }
  }

  private addSection(title: string): void {
    this.yPosition += 5;
    this.addSubtitle(title);
    this.yPosition += 2;
  }

  private addSignatureLine(label: string, date: string = ''): void {
    this.checkPageBreak(20);
    
    // Signature line
    this.doc.line(this.leftMargin, this.yPosition + 10, this.leftMargin + 60, this.yPosition + 10);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(label, this.leftMargin, this.yPosition + 16);
    
    // Date line
    this.doc.line(this.leftMargin + 80, this.yPosition + 10, this.leftMargin + 120, this.yPosition + 10);
    this.doc.text('Date', this.leftMargin + 80, this.yPosition + 16);
    
    if (date) {
      this.doc.text(date, this.leftMargin + 80, this.yPosition + 8);
    }
    
    this.yPosition += 25;
  }

  private formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '$0.00' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private generatePurchaseAgreement(data: PurchaseAgreementData): void {
    this.addTitle('STANDARD FORM CONTRACT FOR PURCHASE AND SALE OF REAL ESTATE');
    
    this.addText('THIS IS A LEGALLY BINDING CONTRACT. IF NOT FULLY UNDERSTOOD, WE RECOMMEND ALL PARTIES TO THE CONTRACT CONSULT AN ATTORNEY BEFORE SIGNING.', this.leftMargin, 9, 'bold');
    this.yPosition += 5;

    // Section 1: Identification of Parties
    this.addSection('1. IDENTIFICATION OF PARTIES TO THE CONTRACT');
    this.addField('A. SELLER - The seller is', data.sellerName, true);
    this.addField('B. Residing at', data.sellerAddress);
    this.addText('(The word "Seller" refers to each and all parties who have an ownership interest in the property.)', this.leftMargin, 9);
    this.addField('C. PURCHASER - The purchaser is', data.buyerName, true);
    this.addField('D. Residing at', data.buyerAddress);
    this.addText('(The word "Purchaser" refers to each and all of those who signed below as Purchaser.)', this.leftMargin, 9);

    // Section 2: Property to be Sold
    this.addSection('2. PROPERTY TO BE SOLD');
    this.addText(`The property and improvements which the Seller is agreeing to sell and which the Purchaser is agreeing to purchase is known as ${data.propertyAddress || '_________________'}, located in the city, village or town of ${data.city || '_________________'} in ${data.county || '_________________'} County, in the State of ${data.state || 'New York'}. This property includes all the Seller's rights and privileges, if any, to all land, water, streets and roads annexed to, and on all sides of the property.`);
    this.addField('The lot size of the property is approximately', data.lotSize);

    // Section 3: Items Included in Sale
    this.addSection('3. ITEMS INCLUDED IN SALE');
    this.addText(data.itemsIncluded || 'No specific items listed.');
    this.addText('The items listed above if now in or on said premises, and owned by the Seller free from all liens and encumbrances, are included in the sale "as is", on the date of this offer.');

    // Section 4: Items Excluded from Sale
    this.addSection('4. ITEMS EXCLUDED FROM SALE');
    this.addText(`The following items are excluded from the sale: ${data.itemsExcluded || 'None specified'}.`);

    // Section 5: Purchase Price
    this.addSection('5. PURCHASE PRICE');
    this.addText(`The purchase price is ${this.formatCurrency(data.purchasePrice)} DOLLARS (${this.formatCurrency(data.purchasePrice)}). The Purchaser shall pay the purchase price as follows:`);
    this.addField('A. Deposit with this contract and held pursuant to paragraph 16 herein', this.formatCurrency(data.depositAmount));
    this.addField('B. Additional deposit on', `${this.formatCurrency(data.additionalDeposit)} on ${data.additionalDepositDate || '_________________'}`);
    this.addField('C. In cash, certified check, bank draft or attorney escrow account check at closing', this.formatCurrency(data.cashAtClosing));
    this.addField('D. (Other)', data.otherPayment || 'None specified');

    // Section 6: Mortgage Contingency
    this.addSection('6. MORTGAGE CONTINGENCY');
    if (data.mortgageAmount && data.mortgageAmount > 0) {
      this.addText(`A. This agreement is contingent upon Purchaser obtaining approval of a ${data.mortgageType || 'Conventional'} mortgage loan of ${this.formatCurrency(data.mortgageAmount)} for a term of no more than ${data.mortgageTerm || '_____'} years at an initial fixed or adjustable nominal interest rate not to exceed ${data.interestRate || '_____'}% (percent). Purchaser agrees to use diligent efforts to obtain said approval and shall apply for the mortgage loan within ${data.businessDaysToApply || '_____'} business days after the Seller has accepted this contract.`);
      
      if (data.mortgageContingencyDate) {
        this.addText(`In the event notice as called for in the preceding sentence has not been received on or before ${data.mortgageContingencyDate}, then either Purchaser or Seller may within five business days of such date terminate, or the parties may mutually agree to extend, this contract by written notice.`);
      }
      
      if (data.sellerContribution && data.sellerContribution > 0) {
        this.addField('B. Seller\'s Contribution: At closing, as a credit toward prepaids, closing costs and/or points, Seller shall credit to Purchaser', this.formatCurrency(data.sellerContribution));
      }
    } else {
      this.addText('No mortgage contingency specified.');
    }

    // Additional sections would continue here...
    
    // Transfer of Title/Possession
    this.addSection('15. TRANSFER OF TITLE/POSSESSION');
    this.addText(`The transfer of title to the property from Seller to Purchaser will take place at the office of the lender's attorney if the Purchaser obtains a mortgage loan from a lending institution. Otherwise, the closing will be at the office of the attorney for the Seller. The closing will be on or before ${data.closingDate || '_________________'}. Possession shall be granted upon transfer of title unless otherwise mutually agreed upon in writing signed by both parties.`);

    // Inspections
    if (data.structuralInspection || data.pestInspection || data.septicInspection || data.wellWaterTest || data.radonInspection) {
      this.addSection('21. INSPECTIONS');
      this.addText('This agreement is contingent upon all of the following provisions marked with the parties\' initials:');
      
      if (data.structuralInspection) this.addText('✓ STRUCTURAL INSPECTION: A determination by a New York State licensed home inspector that the premises are free from any substantial structural defects.');
      if (data.pestInspection) this.addText('✓ WOOD DESTROYING ORGANISMS (PEST, TERMITE INSPECTION): A determination by a Certified Exterminator that the premises are free from infestation or damage by wood destroying organisms.');
      if (data.septicInspection) this.addText('✓ SEPTIC SYSTEM INSPECTION: A test of the septic system indicating that the system is in working order.');
      if (data.wellWaterTest) this.addText('✓ WELL WATER FLOW AND/OR QUALITY TESTS: Water quality and flow tests to meet required standards.');
      if (data.radonInspection) this.addText('✓ RADON INSPECTION: Testing for radon gas presence.');
      
      if (data.inspectionDate) {
        this.addText(`All tests and/or inspections contemplated pursuant to this paragraph "21" shall be completed on or before ${data.inspectionDate}.`);
      }
    }

    // Signature section
    this.yPosition += 10;
    this.addSection('SIGNATURES');
    this.addSignatureLine('Purchaser');
    this.addSignatureLine('Purchaser');
    this.addSignatureLine('Seller');
    this.addSignatureLine('Seller');
  }

  private generateTerminationLetter(data: TerminationLetterData): void {
    this.addTitle('Letter of Termination of Purchase and Sale');
    this.yPosition += 10;

    this.addField('Name of Seller(s)', data.sellerName, true);
    this.yPosition += 5;
    this.addField('Name of Buyer(s)', data.buyerName, true);
    this.yPosition += 5;
    this.addField('Property Address', data.propertyAddress, true);
    this.yPosition += 10;

    this.addText(`The Seller(s) and Buyer(s) listed above entered into a Purchase and Sale Agreement on ${data.contractDate || '_________________'} (date).`);
    this.yPosition += 5;

    this.addText('The Buyer(s) hereby unconditionally waives and releases any claim against the Seller(s) arising under the Purchase and Sale Agreement or by reason of its termination.');
    this.yPosition += 5;

    this.addText('The Seller(s) hereby unconditionally waives and releases any claim against the Buyer(s) arising under the Purchase and Sale Agreement or by reason of its termination.');
    this.yPosition += 5;

    this.addText('The Seller(s) and Buyer(s) hereby agree that any deposit, earnest money or other monies held by any real estate broker or attorney with regard to the purchase and sale of the above-referenced property shall be distributed in the following amounts to the following persons:');
    this.yPosition += 5;

    if (data.distributionDetails) {
      this.addText(data.distributionDetails);
    } else {
      for (let i = 0; i < 4; i++) {
        this.addText(`$ ___________________ to _______________________________________________`);
      }
    }

    this.yPosition += 10;
    this.addText('I/We understand agree to the above explanations and all terms.');
    this.yPosition += 15;

    this.addSignatureLine('Seller (print)', data.sellerDate);
    this.addSignatureLine('Seller (print)', data.sellerDate);
    this.addSignatureLine('Buyer (print)', data.buyerDate);
    this.addSignatureLine('Buyer (print)', data.buyerDate);
  }

  private generateCounterOffer(data: CounterOfferData): void {
    this.addTitle('Counteroffer to Purchase');
    
    this.addText('THIS IS A LEGALLY BINDING CONTRACT. IF NOT FULLY UNDERSTOOD, WE RECOMMEND ALL PARTIES TO THE CONTRACT CONSULT AN ATTORNEY BEFORE SIGNING.', this.leftMargin, 9, 'bold');
    this.yPosition += 10;

    this.addText(`The following counter offer is in response to the Offer to Purchase dated ${data.originalOfferDate || '_________________'}, for the property located at ${data.propertyAddress || '_______________________________________________'}, between the seller(s) ${data.sellerName || '_______________________________________________'} and the buyer(s) ${data.buyerName || '_______________________________________________'}.`);
    this.yPosition += 10;

    this.addText('The following counteroffer is as follows:');
    this.yPosition += 5;
    this.addText(data.counterOfferTerms || '_'.repeat(200));
    this.yPosition += 10;

    this.addText('All other items of the original offer remain the same.');
    this.yPosition += 10;

    this.addSection('EXPIRATION');
    this.addText(`If this counter offer is not signed and delivered to the buyer and seller before ${data.expirationTime || '_______'} am / pm on ${data.expirationDate || '_________________'} (date), this counter offer will terminate.`);
    this.yPosition += 5;

    this.addText('All parties understand, the seller(s) has the right to accept any other offers prior to the acceptance and delivery of this counter offer.');
    this.yPosition += 10;

    this.addSection('The Undersigned Buyer(s)');
    
    const acceptanceText = data.acceptanceType === 'accepts' ? '✓ Accepts the above counteroffer.' :
                          data.acceptanceType === 'rejects' ? '✓ Rejects the above counter offer.' :
                          data.acceptanceType === 'partially-accepts' ? '✓ Partially accepts the above counter offer, subject to the following change(s).' :
                          '_____ Accepts the above counteroffer.\n_____ Rejects the above counter offer.\n_____ Partially accepts the above counter offer, subject to the following change(s).';
    
    this.addText(acceptanceText);
    
    if (data.acceptanceType === 'partially-accepts' && data.additionalChanges) {
      this.yPosition += 5;
      this.addText(data.additionalChanges);
    }

    this.yPosition += 15;
    this.addSignatureLine('Seller', data.sellerDate);
    this.addSignatureLine('Seller', data.sellerDate);
    this.addSignatureLine('Buyer', data.buyerDate);
    this.addSignatureLine('Buyer', data.buyerDate);
  }

  public async generatePDF({ template, data, fileName }: PDFGeneratorOptions): Promise<string> {
    // Reset document state
    this.doc = new jsPDF();
    this.yPosition = 20;

    try {
      // Generate content based on template type
      switch (template.id) {
        case 'purchase-agreement':
          this.generatePurchaseAgreement(data as PurchaseAgreementData);
          break;
        case 'termination-letter':
          this.generateTerminationLetter(data as TerminationLetterData);
          break;
        case 'counter-offer':
          this.generateCounterOffer(data as CounterOfferData);
          break;
        default:
          throw new Error(`Unsupported template type: ${template.id}`);
      }

      // Generate filename
      const defaultFileName = `${template.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const finalFileName = fileName || defaultFileName;

      // Create blob URL for download
      const pdfBlob = this.doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      // Also save the PDF (in a real app, you'd save to your document storage)
      this.doc.save(finalFileName);

      return url;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}

// Export a singleton instance
export const pdfGenerator = new PDFGenerator();

// Utility function for easy PDF generation
export async function generateDocumentPDF(template: DocumentTemplate, data: any, fileName?: string): Promise<string> {
  return pdfGenerator.generatePDF({ template, data, fileName });
}
