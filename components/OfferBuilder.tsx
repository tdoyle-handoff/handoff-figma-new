/*
WIREFRAME: Buyer Offer Builder (Web)

[Header]
┌─────────────────────────────────────────────────────────────────┐
│ Offer Builder  | Step 1 of 5  | Save Draft | Help            │
└─────���────────────────────────────────────────────────────────┘

[Stepper]
● Property  →  ● Buyer & Financing  →  ● Offer Terms  →  ● Contingencies  →  ● Review & Submit

[Right Sidebar]
- Affordability (P&I, Taxes, Insurance, HOA)
- Down payment sync (percent ⇄ dollars)
- Loan amount and LTV
- Estimated monthly payment
- Compliance flags

[Primary Panels by Step]
1) Property
   - Address, City, State, ZIP
   - List price, HOA, Taxes/yr, Insurance/yr

2) Buyer & Financing
   - Name, Email, Phone
   - Financing type [Cash, Conventional, FHA, VA]
   - Interest rate, Term
   - Down payment [percent|dollar] + slider
   - Upload pre-approval / proof of funds

3) Offer Terms
   - Offer price
   - Earnest money [percent|dollar]
   - Closing date
   - Escalation clause [toggle, cap, increment]
   - Seller concessions

4) Contingencies
   - Inspection [toggle, days]
   - Appraisal [toggle]
   - Financing [toggle, days]
   - Home sale [toggle, days]

5) Review & Submit
   - Plain-English summary
   - Red flags
   - E-sign + Generate PDF + Send to listing agent
*/

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertCircle, ArrowLeft, ArrowRight, DollarSign, FileText, Mail, Percent, Shield, Download, Cloud, CloudCheck, Loader2 } from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { DocumentTemplateForm } from "./documents/DocumentTemplateForm";
import { getTemplateById } from "../utils/documentTemplates";
import { generateDocumentPDF } from "../utils/pdfGenerator";
import type { PurchaseAgreementData, GeneratedDocument } from "../types/documentTemplates";
import { useAuth } from "../hooks/useAuth";
import { DataPersistenceNotification } from './DataPersistenceNotification';

// Utility helpers
function formatMoney(n: number | string) {
  const v = typeof n === "string" ? Number(n || 0) : n;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }

function monthlyPI(principal: number, rateAnnualPct: number, termYears: number) {
  if (!principal || !rateAnnualPct || !termYears) return 0;
  const r = rateAnnualPct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Draft persistence
const LS_KEY = 'offer-builder-draft-v1';

type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  // Only present for small images or small files we decide to persist
  dataUrl?: string;
};

type DraftMeta = { id: string; name: string; savedAt: string };

const LS_LIST_KEY = 'offer-builder-drafts-list-v1';

type OfferDraft = {
  id?: string;
  name?: string;
  step: number;
  address: string;
  city: string;
  stateUS: string;
  zip: string;
  listPrice: number;
  hoaMonthly: number;
  taxesAnnual: number;
  insuranceAnnual: number;

  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  financingType: string;
  interestRate: number;
  termYears: number;
  dpMode: 'percent' | 'dollar';
  downPayment: number;
  preApprovalAttached: boolean;

  offerPrice: number;
  earnestMode: 'percent' | 'dollar';
  earnest: number;
  closingDate: string;
  hasEscalation: boolean;
  escalationCap: number;
  escalationIncrement: number;
  sellerConcessions: string;

  inspection: boolean;
  inspectionDays: number;
  appraisal: boolean;
  financingCont: boolean;
  financingDays: number;
  homeSale: boolean;
  homeSaleDays: number;

  attachments?: Attachment[];

  savedAt?: string;
};

// Types kept inline for brevity
export default function OfferBuilder() {
  const { userProfile, updateUserProfile, isGuestMode } = useAuth();
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [cloudSaveTime, setCloudSaveTime] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [step, setStep] = useState(0); // 0..4

  // Property
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUS, setStateUS] = useState("");
  const [zip, setZip] = useState("");
  const [listPrice, setListPrice] = useState<number>(450000);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);
  const [taxesAnnual, setTaxesAnnual] = useState<number>(9000);
  const [insuranceAnnual, setInsuranceAnnual] = useState<number>(1500);

  // Buyer & Financing
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [financingType, setFinancingType] = useState("Conventional");
  const [interestRate, setInterestRate] = useState<number>(6.75);
  const [termYears, setTermYears] = useState<number>(30);
  const [dpMode, setDpMode] = useState<"percent" | "dollar">("percent");
  const [downPayment, setDownPayment] = useState<number>(20); // meaning depends on dpMode
  const [preApprovalAttached, setPreApprovalAttached] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Offer Terms
  const [offerPrice, setOfferPrice] = useState<number>(listPrice);
  const [earnestMode, setEarnestMode] = useState<"percent" | "dollar">("percent");
  const [earnest, setEarnest] = useState<number>(3);
  const [closingDate, setClosingDate] = useState<string>("");
  const [hasEscalation, setHasEscalation] = useState<boolean>(false);
  const [escalationCap, setEscalationCap] = useState<number>(0);
  const [escalationIncrement, setEscalationIncrement] = useState<number>(2000);
  const [sellerConcessions, setSellerConcessions] = useState<string>("");

  // Contingencies
  const [inspection, setInspection] = useState<boolean>(true);
  const [inspectionDays, setInspectionDays] = useState<number>(7);
  const [appraisal, setAppraisal] = useState<boolean>(true);
  const [financingCont, setFinancingCont] = useState<boolean>(true);
  const [financingDays, setFinancingDays] = useState<number>(21);
  const [homeSale, setHomeSale] = useState<boolean>(false);
  const [homeSaleDays, setHomeSaleDays] = useState<number>(30);

  // Document template integration
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);

  // Draft persistence state
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // State-specific legal requirements (moved here to be available for flags useMemo)
  const [stateRequirements, setStateRequirements] = useState<any>(null);
  const [legalDisclosures, setLegalDisclosures] = useState<string[]>([]);

  // Derived figures
  const dpDollar = useMemo(() => {
    const base = offerPrice || listPrice || 0;
    return dpMode === "percent" ? base * (Number(downPayment) || 0) / 100 : (Number(downPayment) || 0);
  }, [dpMode, downPayment, offerPrice, listPrice]);

  const dpPercent = useMemo(() => {
    const base = offerPrice || listPrice || 0;
    if (!base) return 0;
    return dpMode === "percent" ? (Number(downPayment) || 0) : 100 * (Number(downPayment) || 0) / base;
  }, [dpMode, downPayment, offerPrice, listPrice]);

  const earnestDollar = useMemo(() => {
    const base = offerPrice || listPrice || 0;
    return earnestMode === "percent" ? base * (Number(earnest) || 0) / 100 : (Number(earnest) || 0);
  }, [earnestMode, earnest, offerPrice, listPrice]);

  const loanAmount = Math.max(0, (offerPrice || 0) - (dpDollar || 0));
  const pi = monthlyPI(loanAmount, financingType === "Cash" ? 0 : interestRate, financingType === "Cash" ? 1 : termYears);
  const taxesM = (taxesAnnual || 0) / 12;
  const insM = (insuranceAnnual || 0) / 12;
  const estMonthly = financingType === "Cash" ? (hoaMonthly + taxesM + insM) : (pi + taxesM + insM + hoaMonthly);

  // Real estate contract costs
  const ltvRatio = offerPrice > 0 ? (loanAmount / offerPrice) * 100 : 0;
  const closingCosts = offerPrice * 0.025; // Typical 2-3% of purchase price
  const titleInsurance = offerPrice * 0.005; // ~0.5% of purchase price
  const appraisalFee = 500; // Typical range $400-600
  const inspectionFee = 500; // Typical range $300-700
  const attorneyFees = financingType === 'Cash' ? 800 : 1200; // Higher for financed deals
  const recordingFees = 150;
  const surveyFee = 400;

  // Calculate total closing costs
  const totalClosingCosts = closingCosts + titleInsurance + appraisalFee + inspectionFee + attorneyFees + recordingFees + surveyFee;

  // Total cash needed at closing
  const totalCashNeeded = dpDollar + earnestDollar + totalClosingCosts;

  // PMI calculation (if down payment < 20% and not FHA/VA)
  const needsPMI = financingType === 'Conventional' && dpPercent < 20;
  const pmiMonthly = needsPMI ? (loanAmount * 0.005) / 12 : 0; // ~0.5% annually

  // Total monthly payment including PMI
  const totalMonthlyPayment = estMonthly + pmiMonthly;

  // Additional state for NY State contract fields
  const [sellerName, setSellerName] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [county, setCounty] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [itemsIncluded, setItemsIncluded] = useState("");
  const [itemsExcluded, setItemsExcluded] = useState("");
  const [intendedUse, setIntendedUse] = useState("residential");
  const [deedType, setDeedType] = useState("Warranty Deed");
  const [titleInsuranceType, setTitleInsuranceType] = useState("fee title insurance policy");
  const [offerExpirationDate, setOfferExpirationDate] = useState("");
  const [offerExpirationTime, setOfferExpirationTime] = useState("");
  const [listingBroker, setListingBroker] = useState("");
  const [cooperatingBroker, setCooperatingBroker] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [attorneyApprovalDate, setAttorneyApprovalDate] = useState("");

  // Generate official NY State MLS Purchase Contract
  const generateNYStatePurchaseContract = () => {
    const today = new Date();
    const offerExpDate = offerExpirationDate || new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days from now
    const inspDate = inspectionDate || new Date(today.getTime() + inspectionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const attorneyDate = attorneyApprovalDate || new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const template = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 8.5in; margin: 0 auto; line-height: 1.4; font-size: 11px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 16px; font-weight: bold;">Standard Form Contract for Purchase and Sale of Real Estate</h1>
          <p style="margin: 10px 0; font-weight: bold; text-transform: uppercase;">THIS IS A LEGALLY BINDING CONTRACT. IF NOT FULLY UNDERSTOOD, WE RECOMMEND<br/>ALL PARTIES TO THE CONTRACT CONSULT AN ATTORNEY BEFORE SIGNING.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">1. IDENTIFICATION OF PARTIES TO THE CONTRACT</h3>
          <p><strong>A. SELLER</strong> - The seller is <u>${sellerName || '_'.repeat(50)}</u></p>
          <p><strong>B. Residing at</strong> <u>${sellerAddress || '_'.repeat(60)}</u></p>
          <p style="font-size: 10px; margin: 5px 0;">(The word "Seller" refers to each and all parties who have an ownership interest in the property.)</p>
          <p><strong>C. PURCHASER</strong> - The purchaser is <u>${buyerName || '_'.repeat(50)}</u></p>
          <p><strong>D. Residing at</strong> <u>${buyerAddress || '_'.repeat(60)}</u></p>
          <p style="font-size: 10px; margin: 5px 0;">(The word "Purchaser" refers to each and all of those who signed below as Purchaser.)</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">2. PROPERTY TO BE SOLD</h3>
          <p>The property and improvements which the Seller is agreeing to sell and which the Purchaser is agreeing to purchase is known as</p>
          <p><u>${address || '_'.repeat(60)}</u>, located in the city, village or town</p>
          <p>of <u>${city || '_'.repeat(20)}</u> in <u>${county || '_'.repeat(15)}</u> County, in the State of New York. This property includes</p>
          <p>all the Seller's rights and privileges, if any, to all land, water, streets and roads annexed to, and on all sides of the property.</p>
          <p>The lot size of the property is approximately <u>${lotSize || '_'.repeat(15)}</u>.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">3. ITEMS INCLUDED IN SALE:</h3>
          <p><u>${itemsIncluded || '_'.repeat(120)}</u></p>
          <p><u>${'_'.repeat(120)}</u></p>
          <p>The items listed above if now in or on said premises, and owned by the Seller free from all liens and encumbrances, are included in the sale "as is",</p>
          <p>on the date of this offer, together with the following items: <u>${'_'.repeat(50)}</u>.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">4. ITEMS EXCLUDED FROM SALE</h3>
          <p>The following items are excluded from the sale: <u>${itemsExcluded || '_'.repeat(60)}</u>.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">5. PURCHASE PRICE</h3>
          <p>The purchase price is <u>${formatMoney(offerPrice).replace('$', '').toUpperCase()}</u> DOLLARS</p>
          <p>(<u>$${offerPrice.toLocaleString()}</u>) The Purchaser shall pay the purchase price as follows:</p>
          <p><strong>A.</strong> $<u>${earnestDollar.toLocaleString()}</u> Deposit with this contract and held pursuant to paragraph 16 herein</p>
          <p><strong>B.</strong> $<u>{'_'.repeat(15)}</u> Additional deposit on <u>{'_'.repeat(15)}</u>,</p>
          <p><strong>C.</strong> $<u>${(dpDollar + (totalClosingCosts || 0)).toLocaleString()}</u> In cash, certified check, bank draft or attorney escrow account check at closing</p>
          <p><strong>D.</strong> $<u>${sellerConcessions ? '5,000' : '_'.repeat(15)}</u> (Other) <u>${sellerConcessions || '_'.repeat(30)}</u>.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">6. MORTGAGE CONTINGENCY</h3>
          <p><strong>A.</strong> This agreement is contingent upon Purchaser obtaining approval of a <u>${financingType}</u>, FHA or VA (if FHA or VA, see</p>
          <p>attached required addendum) or mortgage loan of $<u>${loanAmount.toLocaleString()}</u> for a term of no more than <u>${termYears}</u> years</p>
          <p>at an initial fixed or adjustable nominal interest rate not to exceed <u>${interestRate}</u>% (percent). Purchaser agrees to use diligent</p>
          <p>efforts to obtain said approval and shall apply for the mortgage loan within <u>${financingDays}</u> business days after the Seller has accepted this</p>
          <p>contract.</p>
          <p>Purchaser agrees to apply for such mortgage loan to at least one lending institution or licensed mortgage broker. Upon receipt of a written</p>
          <p>mortgage commitment or in the event Purchaser chooses to waive this mortgage contingency, Purchaser shall provide notice in writing to</p>
          <p><u>${listingBroker || '_'.repeat(30)}</u> of Purchaser's receipt of the mortgage commitment or of</p>
          <p>Purchaser's waiving of this contingency. Upon receipt of such notice this contingency shall be deemed waived or satisfied as the case may</p>
          <p>be. In the event notice as called for in the preceding sentence has not been received on or before <u>${new Date(new Date(closingDate).getTime() - financingDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</u>, <u>20${new Date().getFullYear().toString().slice(-2)}</u>,</p>
          <p>then either Purchaser or Seller may within five business days of such date terminate, or the parties may mutually agree to extend, this</p>
          <p>contract by written notice to <u>${listingBroker || '_'.repeat(20)}</u>. Upon receipt of</p>
          <p>termination notice from either party, and in the case of notice by the Purchaser, proof of Purchaser's inability to obtain said mortgage approval,</p>
          <p>this agreement shall be cancelled, null and void, and all deposits made hereunder shall be returned to the Purchaser.</p>
          <p><strong>B. Seller's Contribution:</strong> At closing, as a credit toward prepaids, closing costs and/or points, Seller shall credit to Purchaser $<u>${sellerConcessions ? '5,000' : '0'}</u></p>
          <p>or <u>{'_'.repeat(5)}</u>% (percent) of the purchase price or $<u>{'_'.repeat(10)}</u> mortgage amount.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">10. CONDITIONS AFFECTING TITLE</h3>
          <p>The Seller shall convey and the Purchaser shall accept the property subject to all covenants, conditions, restrictions and easements of record</p>
          <p>and zoning and environmental protection laws so long as the property is not in violation thereof and any of the foregoing does not prevent the</p>
          <p>intended use of the property for the purpose of <u>${intendedUse}</u>; also subject to any existing tenancies, any unpaid</p>
          <p>installments of street and other improvement assessments payable after the date of the transfer of title to the property, and any state of facts</p>
          <p>which an inspection and/or accurate survey may show, provided that nothing in this paragraph renders the title to the property unmarketable.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">11. DEED</h3>
          <p>The property shall be transferred from Seller to Purchaser by means of a <u>${deedType}</u>, with Lien Covenant, or</p>
          <p><u>{'_'.repeat(20)}</u> deed, furnished by the Seller. The deed and real property transfer gains tax affidavit will be properly prepared and signed so that it will be</p>
          <p>accepted for recording by the County Clerk in the County in which the property is located.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">15. TRANSFER OF TITLE/POSSESSION</h3>
          <p>The transfer of title to the property from Seller to Purchaser will take place at the office of the lender's attorney if the Purchaser obtains a</p>
          <p>mortgage loan from a lending institution. Otherwise, the closing will be at the office of the attorney for the Seller. The closing will be on or before</p>
          <p><u>${closingDate ? new Date(closingDate).toLocaleDateString() : '_'.repeat(15)}</u> (Date), 20<u>${new Date().getFullYear().toString().slice(-2)}</u>. Possession shall be granted upon transfer of title unless otherwise mutually agreed upon in</p>
          <p>writing signed by both parties.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">17. TIME PERIOD OFFER</h3>
          <p>Purchaser and Seller understand and agree that, unless earlier withdrawn, this offer is good until <u>${offerExpirationTime || '11:59'}</u> a.m. p.m.</p>
          <p><u>${new Date(offerExpDate).toLocaleDateString()}</u>, 20<u>${new Date().getFullYear().toString().slice(-2)}</u>, and if not accepted by the Seller prior to that time, then this offer becomes null and void.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">19. ATTORNEY APPROVAL</h3>
          <p>This agreement is contingent upon Purchaser and Seller obtaining approval of this agreement by their attorney as to all matters, without</p>
          <p>limitation. This contingency shall be deemed waived unless Purchaser's or Seller's attorney on behalf of their client notifies</p>
          <p><u>${listingBroker || '_'.repeat(20)}</u> in writing, as called for in paragraph "23", of their disapproval of the agreement no later than</p>
          <p><u>${new Date(attorneyDate).toLocaleDateString()}</u>, <u>20${new Date().getFullYear().toString().slice(-2)}</u>. If Purchaser's or Seller's attorney so notifies, then this agreement shall be deemed cancelled, null and</p>
          <p>void, and all deposits shall be returned to the Purchaser.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">21. INSPECTIONS</h3>
          <p>This agreement is contingent upon all of the following provisions marked with the parties' initials. All those provisions marked with "NA" shall not apply.</p>
          <p><strong>${inspection ? 'PC SS' : 'NA NA'}</strong> <strong>STRUCTURAL INSPECTION:</strong> A determination, by a New York State licensed home inspector, registered architect or</p>
          <p>licensed engineer, or a third party who is <u>{'_'.repeat(20)}</u>, or other qualified person, that the</p>
          <p>premises are free from any substantial structural, mechanical, electrical, plumbing, roof covering, water or sewer</p>
          <p>defects. The term substantial to refer to any individual repair which will reasonably cost over $1,500 to correct.</p>
          <p>The following buildings or items on the premises are excluded from this inspection:</p>
          <p><u>{'_'.repeat(60)}</u>.</p>
          <br/>
          <p>All tests and/or inspections contemplated pursuant to this paragraph "21" shall be completed on or before <u>${new Date(inspDate).toLocaleDateString()}</u>,</p>
          <p>and at Purchaser's expense, and shall be deemed waived unless Purchaser shall notify <u>${listingBroker || '_'.repeat(20)}</u> of failure of</p>
          <p>any of these tests and/or inspections.</p>
        </div>

        <div style="margin-bottom: 30px; border: 1px solid #000; padding: 10px;">
          <p style="text-align: center; font-weight: bold; margin-bottom: 15px;">SIGNATURE SECTION</p>
          <div style="display: flex; justify-content: space-between;">
            <div style="width: 45%;">
              <p><u>${'_'.repeat(25)}</u> <u>${'_'.repeat(15)}</u></p>
              <p style="text-align: center; font-size: 10px;">Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Time</p>
              <br/>
              <p><u>${buyerName || '_'.repeat(35)}</u></p>
              <p style="text-align: center; font-size: 10px;">Purchaser</p>
            </div>
            <div style="width: 45%;">
              <p><u>${'_'.repeat(25)}</u> <u>${'_'.repeat(15)}</u></p>
              <p style="text-align: center; font-size: 10px;">Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Time</p>
              <br/>
              <p><u>${sellerName || '_'.repeat(35)}</u></p>
              <p style="text-align: center; font-size: 10px;">Seller</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Generated by Handoff Real Estate Platform • Official Purchase Contract Form</p>
        </div>
      </div>
    `;
    return template;
  };

  // Enhanced compliance flags with state-specific requirements
  const flags = useMemo(() => {
    const out: string[] = [];

    // Basic required fields
    if (!address || !city || !stateUS || !zip) out.push("Complete property address required");
    if (!buyerName || !buyerEmail) out.push("Buyer contact information required");
    if (!offerPrice || offerPrice <= 0) out.push("Valid offer price required");
    if (!closingDate) out.push("Closing date must be specified");

    // Financing requirements
    if (financingType !== "Cash") {
      if (!preApprovalAttached) out.push("Pre-approval letter required for financed offers");
      if (!interestRate || !termYears) out.push("Interest rate and loan term required");
      if (dpPercent < 3) out.push("Minimum 3% down payment typically required");
    } else {
      if (!preApprovalAttached) out.push("Proof of funds required for cash offers");
    }

    // State-specific validation
    if (stateRequirements) {
      const earnestRules = stateRequirements.earnestMoneyRules;
      const earnestPercent = earnestMode === 'percent' ? earnest : (earnestDollar / offerPrice) * 100;

      if (earnestPercent < earnestRules.minPercent) {
        out.push(`${stateRequirements.name} requires minimum ${earnestRules.minPercent}% earnest money`);
      }
      if (earnestPercent > earnestRules.maxPercent) {
        out.push(`${stateRequirements.name} maximum earnest money is ${earnestRules.maxPercent}%`);
      }

      // Contingency period validation
      const contReqs = stateRequirements.contingencyRequirements;
      if (inspection && (inspectionDays < contReqs.inspection.minDays || inspectionDays > contReqs.inspection.maxDays)) {
        out.push(`${stateRequirements.name} inspection period must be ${contReqs.inspection.minDays}-${contReqs.inspection.maxDays} days`);
      }
      if (financingCont && (financingDays < contReqs.financing.minDays || financingDays > contReqs.financing.maxDays)) {
        out.push(`${stateRequirements.name} financing contingency must be ${contReqs.financing.minDays}-${contReqs.financing.maxDays} days`);
      }
    }

    // Escalation clause validation
    if (hasEscalation) {
      if (!escalationCap || escalationCap <= offerPrice) out.push("Escalation cap must be higher than offer price");
      if (!escalationIncrement || escalationIncrement <= 0) out.push("Escalation increment must be positive");
      if (escalationCap - offerPrice < escalationIncrement) out.push("Escalation cap too close to offer price");
    }

    // Down payment validation
    if (dpDollar < 0) out.push("Down payment cannot be negative");
    if (dpDollar > offerPrice) out.push("Down payment cannot exceed offer price");

    // Closing date validation
    if (closingDate) {
      const closingDateObj = new Date(closingDate);
      const today = new Date();
      const daysUntilClosing = Math.ceil((closingDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilClosing < 14) out.push("Closing date should be at least 14 days from today");
      if (daysUntilClosing > 90) out.push("Closing date more than 90 days out may not be acceptable");
    }

    return out;
  }, [address, city, stateUS, zip, buyerName, buyerEmail, offerPrice, financingType, preApprovalAttached, interestRate, termYears, closingDate, hasEscalation, escalationCap, escalationIncrement, dpDollar, dpPercent, stateRequirements, earnestMode, earnest, earnestDollar, inspection, inspectionDays, financingCont, financingDays]);

  // Stepper meta
  const steps = ["Property", "Buyer & Financing", "Offer Terms", "Contingencies", "Review & Submit"];
  const progressPct = (step / (steps.length - 1)) * 100;

  const next = () => setStep(s => clamp(s + 1, 0, steps.length - 1));
  const back = () => setStep(s => clamp(s - 1, 0, steps.length - 1));

  // Build draft object
  const buildDraft = (): OfferDraft => ({
    id: currentDraftId || undefined,
    name: currentDraftName || undefined,
    step,
    address, city, stateUS, zip,
    listPrice, hoaMonthly, taxesAnnual, insuranceAnnual,
    buyerName, buyerEmail, buyerPhone,
    financingType, interestRate, termYears, dpMode, downPayment, preApprovalAttached,
    offerPrice, earnestMode, earnest, closingDate, hasEscalation, escalationCap, escalationIncrement, sellerConcessions,
    inspection, inspectionDays, appraisal, financingCont, financingDays, homeSale, homeSaleDays,
    attachments,
    savedAt: new Date().toISOString(),
  });

  // Apply draft
  const applyDraft = (d: Partial<OfferDraft>) => {
    if (typeof d.step === 'number') setStep(clamp(d.step, 0, steps.length - 1));
    if (d.address !== undefined) setAddress(d.address);
    if (d.city !== undefined) setCity(d.city);
    if (d.stateUS !== undefined) setStateUS(d.stateUS);
    if (d.zip !== undefined) setZip(d.zip);
    if (typeof d.listPrice === 'number') setListPrice(d.listPrice);
    if (typeof d.hoaMonthly === 'number') setHoaMonthly(d.hoaMonthly);
    if (typeof d.taxesAnnual === 'number') setTaxesAnnual(d.taxesAnnual);
    if (typeof d.insuranceAnnual === 'number') setInsuranceAnnual(d.insuranceAnnual);

    if (d.buyerName !== undefined) setBuyerName(d.buyerName);
    if (d.buyerEmail !== undefined) setBuyerEmail(d.buyerEmail);
    if (d.buyerPhone !== undefined) setBuyerPhone(d.buyerPhone);

    if (d.financingType !== undefined) setFinancingType(d.financingType);
    if (typeof d.interestRate === 'number') setInterestRate(d.interestRate);
    if (typeof d.termYears === 'number') setTermYears(d.termYears);
    if (d.dpMode) setDpMode(d.dpMode);
    if (typeof d.downPayment === 'number') setDownPayment(d.downPayment);
    if (typeof d.preApprovalAttached === 'boolean') setPreApprovalAttached(d.preApprovalAttached);

    if (typeof d.offerPrice === 'number') setOfferPrice(d.offerPrice);
    if (d.earnestMode) setEarnestMode(d.earnestMode);
    if (typeof d.earnest === 'number') setEarnest(d.earnest);
    if (typeof d.closingDate === 'string') setClosingDate(d.closingDate);
    if (typeof d.hasEscalation === 'boolean') setHasEscalation(d.hasEscalation);
    if (typeof d.escalationCap === 'number') setEscalationCap(d.escalationCap);
    if (typeof d.escalationIncrement === 'number') setEscalationIncrement(d.escalationIncrement);
    if (typeof d.sellerConcessions === 'string') setSellerConcessions(d.sellerConcessions);

    if (typeof d.inspection === 'boolean') setInspection(d.inspection);
    if (typeof d.inspectionDays === 'number') setInspectionDays(d.inspectionDays);
    if (typeof d.appraisal === 'boolean') setAppraisal(d.appraisal);
    if (typeof d.financingCont === 'boolean') setFinancingCont(d.financingCont);
    if (typeof d.financingDays === 'number') setFinancingDays(d.financingDays);
    if (typeof d.homeSale === 'boolean') setHomeSale(d.homeSale);
    if (typeof d.homeSaleDays === 'number') setHomeSaleDays(d.homeSaleDays);

    if (d.attachments) setAttachments(d.attachments);
    if (d.savedAt) setSavedAt(d.savedAt);
    if (d.name) setCurrentDraftName(d.name);
    if (d.id) setCurrentDraftId(d.id);
  };

  // Load saved offer data from user profile or localStorage
  useEffect(() => {
    if (userProfile && !dataLoaded) {
      try {
        // First check if there's cloud-saved data in user profile
        const cloudData = userProfile.preferences?.offerBuilderData as Partial<OfferDraft>;

        if (cloudData && Object.keys(cloudData).length > 0) {
          console.log('📋 Loading cloud-saved offer data for user:', userProfile.email);
          applyDraft(cloudData);
          setCloudSaveTime(cloudData.savedAt || null);
        } else {
          // Fallback to localStorage for migration or guest data
          const localData = localStorage.getItem(LS_KEY);
          if (localData) {
            console.log('📋 Loading local offer data and migrating to cloud');
            const parsed = JSON.parse(localData) as OfferDraft;
            applyDraft(parsed);

            // Migrate to cloud if user is authenticated
            if (!isGuestMode) {
              setTimeout(() => saveToCloud(parsed), 1000);
            }
          }
        }
      } catch (error) {
        console.error('Error loading offer data:', error);
        // Fallback to localStorage
        try {
          const raw = localStorage.getItem(LS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as OfferDraft;
            applyDraft(parsed);
          }
        } catch {}
      }

      setDataLoaded(true);
    } else if (!userProfile && !dataLoaded) {
      // No user profile, load from localStorage only
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as OfferDraft;
          applyDraft(parsed);
        }
      } catch {}
      setDataLoaded(true);
    }
  }, [userProfile, dataLoaded, isGuestMode]);

  // Save offer data to cloud
  const saveToCloud = useCallback(async (draftData?: OfferDraft) => {
    if (!userProfile || isGuestMode || !dataLoaded) return;

    try {
      setIsCloudSaving(true);

      const dataToSave = draftData || buildDraft();
      const timestamp = new Date().toISOString();

      const updatedPreferences = {
        ...userProfile.preferences,
        offerBuilderData: {
          ...dataToSave,
          savedAt: timestamp,
        },
      };

      await updateUserProfile({
        preferences: updatedPreferences
      });

      setCloudSaveTime(timestamp);
      console.log('☁️ Offer data saved to cloud successfully');
    } catch (error) {
      console.error('Error saving offer data to cloud:', error);
    } finally {
      setIsCloudSaving(false);
    }
  }, [userProfile, isGuestMode, dataLoaded, updateUserProfile, buildDraft]);

  // Autosave draft whenever inputs change (local + cloud)
  useEffect(() => {
    if (!dataLoaded) return;

    const draft = buildDraft();

    // Always save to localStorage for quick access
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(draft));
      setSavedAt(draft.savedAt!);
    } catch {}

    // Debounced cloud save for authenticated users
    if (userProfile && !isGuestMode) {
      const timeoutId = setTimeout(() => {
        saveToCloud(draft);
      }, 3000); // Save to cloud 3 seconds after user stops typing

      return () => clearTimeout(timeoutId);
    }
    // Exclude savedAt from deps to avoid double runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    step,
    address, city, stateUS, zip,
    listPrice, hoaMonthly, taxesAnnual, insuranceAnnual,
    buyerName, buyerEmail, buyerPhone,
    financingType, interestRate, termYears, dpMode, downPayment, preApprovalAttached,
    offerPrice, earnestMode, earnest, closingDate, hasEscalation, escalationCap, escalationIncrement, sellerConcessions,
    inspection, inspectionDays, appraisal, financingCont, financingDays, homeSale, homeSaleDays,
    attachments, sellerName, sellerAddress, buyerAddress, county, lotSize, itemsIncluded, itemsExcluded,
    intendedUse, deedType, titleInsuranceType, offerExpirationDate, offerExpirationTime,
    listingBroker, cooperatingBroker, inspectionDate, attorneyApprovalDate,
    dataLoaded, userProfile, isGuestMode, saveToCloud
  ]);

  // Multiple drafts support
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [currentDraftName, setCurrentDraftName] = useState<string | null>(null);

  // Load drafts list
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LIST_KEY);
      if (raw) setDrafts(JSON.parse(raw));
    } catch {}
  }, []);

  const persistDraftsList = (list: DraftMeta[]) => {
    setDrafts(list);
    try { localStorage.setItem(LS_LIST_KEY, JSON.stringify(list)); } catch {}
  };

  const randomId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

  const draftKey = (id: string) => `${LS_KEY}:${id}`;

  const handleSaveDraft = async () => {
    const id = currentDraftId || randomId();
    const name = currentDraftName || `Draft ${new Date().toLocaleString()}`;
    const draft = { ...buildDraft(), id, name };

    try {
      // Save to localStorage
      localStorage.setItem(draftKey(id), JSON.stringify(draft));
      setSavedAt(draft.savedAt!);
      setCurrentDraftId(id);
      setCurrentDraftName(name);

      // update list
      const meta: DraftMeta = { id, name, savedAt: draft.savedAt! };
      const others = drafts.filter(d => d.id !== id);
      const updated = [meta, ...others].sort((a,b)=> (b.savedAt > a.savedAt ? 1 : -1));
      persistDraftsList(updated);

      // Also save to cloud if authenticated
      if (userProfile && !isGuestMode) {
        await saveToCloud(draft);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSaveAs = () => {
    const name = window.prompt('Name this draft:', currentDraftName || 'My Draft');
    if (!name) return;
    setCurrentDraftName(name);
    setCurrentDraftId(null);
    setTimeout(handleSaveDraft, 0);
  };

  const handleLoadDraft = (id: string) => {
    try {
      const raw = localStorage.getItem(draftKey(id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as OfferDraft;
      applyDraft(parsed);
      setCurrentDraftId(parsed.id || id);
      setCurrentDraftName(parsed.name || null);
    } catch {}
  };

  const handleDeleteDraft = (id: string) => {
    if (!window.confirm('Delete this draft?')) return;
    try { localStorage.removeItem(draftKey(id)); } catch {}
    const updated = drafts.filter(d => d.id !== id);
    persistDraftsList(updated);
    if (currentDraftId === id) {
      setCurrentDraftId(null);
      setCurrentDraftName(null);
    }
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(LS_KEY);
      setSavedAt(null);
    } catch {}
  };

  // Handle Purchase Agreement Template Generation
  const handleCreatePurchaseAgreement = () => {
    setShowTemplateDialog(true);
  };

  const handleSaveDocument = async (data: any, isDraft: boolean) => {
    const template = getTemplateById('purchase-agreement');
    if (!template) return;

    const now = new Date().toISOString();
    const newDocument: GeneratedDocument = {
      id: `doc_${Date.now()}`,
      templateId: 'purchase-agreement',
      templateName: template.name,
      fileName: `Purchase_Agreement_${address.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      data,
      createdAt: now,
      status: isDraft ? 'draft' : 'completed'
    };

    // Save to localStorage (in a real app, this would save to your backend)
    const existingDocs = JSON.parse(localStorage.getItem('generatedDocuments') || '[]');
    const updatedDocs = [...existingDocs, newDocument];
    localStorage.setItem('generatedDocuments', JSON.stringify(updatedDocs));
    setGeneratedDocuments(updatedDocs);

    if (!isDraft) {
      setShowTemplateDialog(false);
    }
  };

  const handleGeneratePDF = async (data: any): Promise<string> => {
    const template = getTemplateById('purchase-agreement');
    if (!template) throw new Error('Purchase agreement template not found');

    return await generateDocumentPDF(template, data);
  };

  // State-specific legal requirements database
  const stateRequirementsDB = {
    'CA': {
      name: 'California',
      requiredDisclosures: [
        'Natural Hazard Disclosure Statement',
        'Lead-Based Paint Disclosure (pre-1978 homes)',
        'Transfer Disclosure Statement',
        'Seller Property Questionnaire',
        'Water Heater and Smoke Detector Statement of Compliance'
      ],
      contingencyRequirements: {
        inspection: { minDays: 7, maxDays: 21, default: 10 },
        financing: { minDays: 17, maxDays: 30, default: 21 },
        appraisal: { minDays: 17, maxDays: 30, default: 21 }
      },
      mandatoryForms: [
        'California Residential Purchase Agreement (RPA-CA)',
        'Buyer Inspection Advisory (BIA)',
        'Agent Visual Inspection Disclosure (AVID)'
      ],
      earnestMoneyRules: {
        minPercent: 1,
        maxPercent: 3,
        defaultPercent: 3,
        holdingRequirement: 'Licensed escrow company or real estate broker'
      }
    },
    'TX': {
      name: 'Texas',
      requiredDisclosures: [
        'Seller\'s Disclosure Notice',
        'Lead-Based Paint Disclosure (pre-1978 homes)',
        'Property Condition Disclosure'
      ],
      contingencyRequirements: {
        inspection: { minDays: 7, maxDays: 14, default: 10 },
        financing: { minDays: 20, maxDays: 30, default: 25 },
        appraisal: { minDays: 15, maxDays: 25, default: 20 }
      },
      mandatoryForms: [
        'One to Four Family Residential Contract (Resale)',
        'Addendum for Property Subject to Mandatory Membership',
        'Seller Financing Addendum (if applicable)'
      ],
      earnestMoneyRules: {
        minPercent: 1,
        maxPercent: 5,
        defaultPercent: 2,
        holdingRequirement: 'Title company or licensed escrow agent'
      }
    },
    'FL': {
      name: 'Florida',
      requiredDisclosures: [
        'Property Disclosure Summary',
        'Lead-Based Paint Disclosure (pre-1978 homes)',
        'Radon Gas Disclosure'
      ],
      contingencyRequirements: {
        inspection: { minDays: 10, maxDays: 15, default: 15 },
        financing: { minDays: 30, maxDays: 45, default: 30 },
        appraisal: { minDays: 15, maxDays: 30, default: 21 }
      },
      mandatoryForms: [
        'Florida Residential Contract for Sale and Purchase',
        'Property Tax Disclosure Summary',
        'Homeowners\' Association Disclosure Summary'
      ],
      earnestMoneyRules: {
        minPercent: 1,
        maxPercent: 10,
        defaultPercent: 3,
        holdingRequirement: 'Licensed real estate broker or attorney'
      }
    }
  };

  // Update state requirements when state changes
  useEffect(() => {
    if (stateUS && stateRequirementsDB[stateUS as keyof typeof stateRequirementsDB]) {
      const requirements = stateRequirementsDB[stateUS as keyof typeof stateRequirementsDB];
      setStateRequirements(requirements);
      setLegalDisclosures(requirements.requiredDisclosures);

      // Auto-adjust contingency periods to state defaults
      if (requirements.contingencyRequirements) {
        setInspectionDays(requirements.contingencyRequirements.inspection.default);
        setFinancingDays(requirements.contingencyRequirements.financing.default);
      }

      // Auto-adjust earnest money to state default
      if (requirements.earnestMoneyRules) {
        setEarnestMode('percent');
        setEarnest(requirements.earnestMoneyRules.defaultPercent);
      }
    } else {
      setStateRequirements(null);
      setLegalDisclosures([]);
    }
  }, [stateUS]);

  const savedText = savedAt ? `Draft saved ${new Date(savedAt).toLocaleTimeString()}` : 'Autosave enabled';

  // Attachments handling
  const SMALL_FILE_LIMIT = 500_000; // 500 KB
  const toDataUrlIfSmall = (file: File): Promise<string | undefined> => new Promise((resolve) => {
    if (file.size > SMALL_FILE_LIMIT) return resolve(undefined);
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || undefined));
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });

  const ensureBucket = async () => {
    try {
      // Attempt to list to confirm access; if fails, inform user to create bucket via dashboard
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      const exists = (data || []).some(b => b.name === 'offers');
      if (!exists) {
        // Create private bucket
        await supabase.storage.createBucket('offers', { public: false });
      }
    } catch (e) {
      console.warn('Could not verify/create bucket:', e);
    }
  };

  const uploadToStorage = async (file: File, idHint: string) => {
    try {
      await ensureBucket();
      const user = (await supabase.auth.getUser()).data.user;
      const uid = user?.id || 'anonymous';
      const draftId = currentDraftId || idHint || randomId();
      const path = `${uid}/${draftId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('offers').upload(path, file, { upsert: false });
      if (error) throw error;
      // Private bucket: create a signed URL valid for 7 days
      const { data: signed, error: signErr } = await supabase.storage.from('offers').createSignedUrl(path, 60 * 60 * 24 * 7);
      if (signErr) throw signErr;
      return { path, url: signed.signedUrl } as const;
    } catch (e) {
      console.error('Upload failed:', e);
      return null;
    }
  };

  const handleAddFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: Attachment[] = [];
    for (const f of Array.from(files)) {
      const dataUrl = await toDataUrlIfSmall(f);
      let uploadedUrl: string | undefined;
      let storedType = f.type;
      const res = await uploadToStorage(f, currentDraftId || 'draft');
      if (res) uploadedUrl = res.url;
      newAttachments.push({ id: randomId(), name: f.name, size: f.size, type: storedType, dataUrl: dataUrl || uploadedUrl });
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    setPreApprovalAttached(true);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Generate legally binding purchase agreement
  const handleGenerateLegalDocument = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const stateName = stateRequirements?.name || stateUS || 'State';
    const requiredForms = stateRequirements?.mandatoryForms || ['Standard Purchase Agreement'];
    const disclosures = legalDisclosures || [];

    const legalDocument = `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">RESIDENTIAL PURCHASE AGREEMENT</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px;">State of ${stateName}</h2>
          <p style="margin: 10px 0 0 0; font-size: 12px;">This document constitutes a legally binding agreement</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PROPERTY INFORMATION</h3>
          <p><strong>Property Address:</strong> ${address || '[Property Address]'}, ${city || '[City]'}, ${stateUS || '[State]'} ${zip || '[ZIP Code]'}</p>
          <p><strong>Legal Description:</strong> To be inserted from title report</p>
          <p><strong>Assessor's Parcel Number (APN):</strong> To be inserted from title report</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">PURCHASE TERMS</h3>
          <p><strong>Purchase Price:</strong> ${formatMoney(offerPrice)}</p>
          <p><strong>Earnest Money Deposit:</strong> ${formatMoney(earnestDollar)} (${earnestMode === 'percent' ? earnest + '%' : 'fixed amount'}) to be deposited within 3 business days</p>
          <p><strong>Down Payment:</strong> ${formatMoney(dpDollar)} (${dpPercent.toFixed(1)}%)</p>
          <p><strong>Loan Amount:</strong> ${formatMoney(loanAmount)}</p>
          <p><strong>Financing Type:</strong> ${financingType}</p>
          ${financingType !== 'Cash' ? `<p><strong>Interest Rate:</strong> ${interestRate}% for ${termYears} years (subject to final loan approval)</p>` : ''}
          <p><strong>Closing Date:</strong> ${closingDate || '[To be determined]'}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">CONTINGENCIES</h3>
          ${inspection ? `<p><strong>Inspection Contingency:</strong> Buyer has ${inspectionDays} days from acceptance to complete property inspections and either approve the property condition or cancel this agreement.</p>` : '<p><strong>Inspection Contingency:</strong> WAIVED</p>'}
          ${appraisal ? '<p><strong>Appraisal Contingency:</strong> This agreement is contingent upon the property appraising for at least the purchase price.</p>' : '<p><strong>Appraisal Contingency:</strong> WAIVED</p>'}
          ${financingCont ? `<p><strong>Financing Contingency:</strong> Buyer has ${financingDays} days to obtain loan approval. If financing is not approved, buyer may cancel this agreement and receive refund of earnest money.</p>` : '<p><strong>Financing Contingency:</strong> WAIVED</p>'}
          ${homeSale ? `<p><strong>Home Sale Contingency:</strong> This agreement is contingent upon the sale of buyer's existing home within ${homeSaleDays} days.</p>` : ''}
          ${hasEscalation ? `<p><strong>Escalation Clause:</strong> If a higher competing offer is received, buyer's offer will automatically increase by ${formatMoney(escalationIncrement)} increments up to a maximum of ${formatMoney(escalationCap)}.</p>` : ''}
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">BUYER INFORMATION</h3>
          <p><strong>Buyer Name:</strong> ${buyerName || '[Buyer Name]'}</p>
          <p><strong>Email:</strong> ${buyerEmail || '[Email Address]'}</p>
          <p><strong>Phone:</strong> ${buyerPhone || '[Phone Number]'}</p>
        </div>

        ${sellerConcessions ? `<div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">SELLER CONCESSIONS</h3>
          <p>${sellerConcessions}</p>
        </div>` : ''}

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">REQUIRED ${stateName.toUpperCase()} DISCLOSURES</h3>
          ${disclosures.length > 0 ? `<ul>${disclosures.map(d => `<li style="margin-bottom: 5px;">${d}</li>`).join('')}</ul>` : '<p>Standard state disclosures apply as required by law.</p>'}
          <p style="font-size: 12px; margin-top: 15px;"><em>Seller must provide all required disclosures within the time frames specified by ${stateName} law.</em></p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">MANDATORY FORMS</h3>
          <p>This agreement incorporates the following required forms:</p>
          <ul>${requiredForms.map(form => `<li style="margin-bottom: 5px;">${form}</li>`).join('')}</ul>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">EARNEST MONEY HANDLING</h3>
          <p>Earnest money shall be held by: ${stateRequirements?.earnestMoneyRules?.holdingRequirement || 'Licensed escrow company'}</p>
          <p>Earnest money shall be applied toward the purchase price at closing or returned to buyer if this agreement is cancelled according to its terms.</p>
        </div>

        <div style="margin-bottom: 40px; border: 2px solid #000; padding: 15px;">
          <p style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">LEGAL NOTICE:</p>
          <p style="font-size: 12px; margin-bottom: 8px;">This is a legally binding contract. If not understood, seek competent legal advice before signing.</p>
          <p style="font-size: 12px; margin-bottom: 8px;">Time is of the essence. All deadlines in this agreement are strictly enforced.</p>
          <p style="font-size: 12px;">This agreement shall be governed by the laws of the State of ${stateName}.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SIGNATURES</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div style="width: 45%;">
              <p><strong>BUYER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">${buyerName || '[Print Name]'}</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
            <div style="width: 45%;">
              <p><strong>SELLER:</strong></p>
              <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px;"></div>
              <p style="font-size: 12px;">[Print Name]</p>
              <p style="font-size: 12px;">Date: _______________</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <p>Document generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>This document was prepared by Handoff Real Estate Platform</p>
        </div>
      </div>
    `;

    w.document.write(`
      <html>
        <head>
          <title>Purchase Agreement - ${address || 'Property'}</title>
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
          ${legalDocument}
          <div class="no-print" style="text-align: center; margin: 20px; page-break-before: always;">
            <button onclick="window.print()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">Print Document</button>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">This document can be printed or saved as PDF for signing and submission.</p>
          </div>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      {/* Data Persistence Notification */}
      <DataPersistenceNotification className="mb-4" />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Left: main content */}
        <div className="xl:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">Offer Builder</h1>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-2">
              <span>{savedText}</span>
              {isCloudSaving ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : cloudSaveTime && !isGuestMode ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CloudCheck className="w-3 h-3" />
                  <span>Synced {new Date(cloudSaveTime).toLocaleTimeString()}</span>
                </div>
              ) : !isGuestMode ? (
                <div className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>Auto-sync enabled</span>
                </div>
              ) : (
                <span>Local storage only</span>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={handleSaveDraft} className="text-xs sm:text-sm">Save draft</Button>
          </div>
        </div>

        {/* Stepper */}
        <div>
          <div className="flex items-center gap-2 text-sm mb-2">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${i <= step ? 'bg-black text-white' : 'bg-muted text-foreground'}`}>{i+1}</div>
                <span className={`hidden sm:block ${i === step ? 'font-medium' : ''}`}>{label}</span>
                {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full">
            <div className="h-2 bg-black rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Step Panels */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Property Details for Purchase Agreement</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-sm sm:text-base">Property Address (as it will appear on purchase contract)</Label>
                <Input value={address} onChange={e=>setAddress(e.target.value)} placeholder="123 Main Street" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">City</Label>
                <Input value={city} onChange={e=>setCity(e.target.value)} placeholder="Buffalo" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">County</Label>
                <Input value={county} onChange={e=>setCounty(e.target.value)} placeholder="Erie" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">ZIP Code</Label>
                <Input value={zip} onChange={e=>setZip(e.target.value)} placeholder="14201" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Lot Size</Label>
                <Input value={lotSize} onChange={e=>setLotSize(e.target.value)} placeholder="0.25 acres" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Seller's Listed Price</Label>
                <Input type="number" value={listPrice} onChange={e=>setListPrice(Number(e.target.value))} className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">HOA Fees (Monthly)</Label>
                <Input type="number" value={hoaMonthly} onChange={e=>setHoaMonthly(Number(e.target.value))} placeholder="0" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Property Taxes (Annual)</Label>
                <Input type="number" value={taxesAnnual} onChange={e=>setTaxesAnnual(Number(e.target.value))} className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Homeowner's Insurance (Annual)</Label>
                <Input type="number" value={insuranceAnnual} onChange={e=>setInsuranceAnnual(Number(e.target.value))} className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Items Included in Sale</Label>
                <Input value={itemsIncluded} onChange={e=>setItemsIncluded(e.target.value)} placeholder="All fixtures, appliances, window treatments" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Items Excluded from Sale</Label>
                <Input value={itemsExcluded} onChange={e=>setItemsExcluded(e.target.value)} placeholder="Personal property, artwork" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Intended Use</Label>
                <Select value={intendedUse} onValueChange={setIntendedUse}>
                  <SelectTrigger className="text-sm sm:text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="investment property">Investment Property</SelectItem>
                    <SelectItem value="vacation home">Vacation Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            {/* State-Specific Legal Requirements */}
            {stateRequirements && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {stateRequirements.name} Legal Requirements
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">Required Disclosures</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        {legalDisclosures.slice(0, 3).map((disclosure, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                            {disclosure}
                          </li>
                        ))}
                        {legalDisclosures.length > 3 && (
                          <li className="text-blue-600">+{legalDisclosures.length - 3} more disclosures required</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Earnest Money Rules</h5>
                      <div className="text-muted-foreground space-y-1">
                        <div>Range: {stateRequirements.earnestMoneyRules.minPercent}% - {stateRequirements.earnestMoneyRules.maxPercent}%</div>
                        <div>Recommended: {stateRequirements.earnestMoneyRules.defaultPercent}%</div>
                        <div className="text-xs">Held by: {stateRequirements.earnestMoneyRules.holdingRequirement}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}

            <CardFooter className="justify-between">
              <Button variant="ghost" disabled><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
              <Button onClick={()=>{ setOfferPrice(listPrice); next(); }}>Next<ArrowRight className="w-4 h-4 ml-2"/></Button>
            </CardFooter>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Buyer Information & Financing Terms</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-sm sm:text-base">Buyer's Legal Name (as it will appear on purchase contract)</Label>
                <Input value={buyerName} onChange={e=>setBuyerName(e.target.value)} placeholder="John and Jane Doe" className="text-sm sm:text-base" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm sm:text-base">Buyer's Address</Label>
                <Input value={buyerAddress} onChange={e=>setBuyerAddress(e.target.value)} placeholder="123 Current Street, Current City, ST 12345" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Contact Email</Label>
                <Input value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} placeholder="buyer@email.com" className="text-sm sm:text-base" />
              </div>
              <div>
                <Label className="text-sm sm:text-base">Phone Number</Label>
                <Input value={buyerPhone} onChange={e=>setBuyerPhone(e.target.value)} placeholder="(555) 555-5555" className="text-sm sm:text-base" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm sm:text-base">Seller's Name (if known)</Label>
                <Input value={sellerName} onChange={e=>setSellerName(e.target.value)} placeholder="Current Owner Name" className="text-sm sm:text-base" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm sm:text-base">Seller's Address (if known)</Label>
                <Input value={sellerAddress} onChange={e=>setSellerAddress(e.target.value)} placeholder="Seller's mailing address" className="text-sm sm:text-base" />
              </div>

              <div>
                <Label>Financing type</Label>
                <Select value={financingType} onValueChange={setFinancingType}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Conventional">Conventional</SelectItem>
                    <SelectItem value="FHA">FHA</SelectItem>
                    <SelectItem value="VA">VA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Interest rate (%)</Label>
                  <Input type="number" step="0.01" disabled={financingType==="Cash"} value={interestRate} onChange={e=>setInterestRate(Number(e.target.value))} />
                </div>
                <div className="w-28">
                  <Label>Term (yrs)</Label>
                  <Input type="number" disabled={financingType==="Cash"} value={termYears} onChange={e=>setTermYears(Number(e.target.value))} />
                </div>
              </div>

              <Separator className="md:col-span-2" />

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label>Down payment</Label>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={dpMode === 'percent' ? 'default' : 'secondary'} className="gap-1"><Percent className="w-3 h-3"/>Percent</Badge>
                    <Switch checked={dpMode === 'dollar'} onCheckedChange={(v)=> setDpMode(v ? 'dollar' : 'percent')} />
                    <Badge variant={dpMode === 'dollar' ? 'default' : 'secondary'} className="gap-1"><DollarSign className="w-3 h-3"/>Dollar</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Slider value={[Number(downPayment)]}
                            onValueChange={(v)=> setDownPayment(v[0])}
                            min={0} max={dpMode==='percent'?100:offerPrice||listPrice||1000000}
                            step={dpMode==='percent'?1:1000} />
                  </div>
                  <div>
                    <Input type="number" value={downPayment}
                      onChange={e=> setDownPayment(Number(e.target.value))}
                      onBlur={()=> setDownPayment(Number(downPayment.toString()))}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {dpMode==='percent' ? `${downPayment}% = ${formatMoney(dpDollar)}` : `${formatMoney(downPayment)} = ${dpPercent.toFixed(1)}%`}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="pre" checked={preApprovalAttached || attachments.length>0} onCheckedChange={(v)=> setPreApprovalAttached(Boolean(v))} />
                  <Label htmlFor="pre">Pre-approval / Proof of funds</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="application/pdf,image/*" multiple onChange={(e)=> handleAddFiles(e.target.files)} />
                </div>
                {attachments.length > 0 && (
                  <div className="rounded-md border p-2">
                    <div className="text-xs font-medium mb-1">Attachments</div>
                    <ul className="space-y-1">
                      {attachments.map(a => (
                        <li key={a.id} className="flex items-center justify-between text-xs">
                          <span className="truncate mr-2">{a.name} <span className="text-muted-foreground">({(a.size/1024).toFixed(0)} KB)</span></span>
                          <div className="flex items-center gap-2">
                            {a.dataUrl && a.type.startsWith('image/') && (
                              <a href={a.dataUrl} download={a.name} className="text-primary hover:underline">view</a>
                            )}
                            {!a.dataUrl && (
                              <span className="text-muted-foreground">upload failed</span>
                            )}
                            {a.dataUrl && !a.dataUrl.startsWith('data:') && (
                              <a href={a.dataUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">view</a>
                            )}
                            <button className="text-destructive hover:underline" onClick={()=> handleRemoveAttachment(a.id)}>remove</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
              <Button onClick={next}>Next<ArrowRight className="w-4 h-4 ml-2"/></Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Purchase Agreement Terms</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm sm:text-base">Purchase Price Offered</Label>
                <Input type="number" value={offerPrice} onChange={e=>setOfferPrice(Number(e.target.value))} className="text-sm sm:text-base" />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Proposed Closing Date</Label>
                <Input type="date" value={closingDate} onChange={e=>setClosingDate(e.target.value)} className="text-sm sm:text-base" />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Offer Expiration Date</Label>
                <Input type="date" value={offerExpirationDate} onChange={e=>setOfferExpirationDate(e.target.value)} className="text-sm sm:text-base" />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Offer Expiration Time</Label>
                <Input value={offerExpirationTime} onChange={e=>setOfferExpirationTime(e.target.value)} placeholder="11:59 PM" className="text-sm sm:text-base" />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Listing Broker</Label>
                <Input value={listingBroker} onChange={e=>setListingBroker(e.target.value)} placeholder="ABC Realty" className="text-sm sm:text-base" />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Cooperating Broker (if applicable)</Label>
                <Input value={cooperatingBroker} onChange={e=>setCooperatingBroker(e.target.value)} placeholder="XYZ Realty" className="text-sm sm:text-base" />
              </div>

              <div>
                <Label>Earnest money</Label>
                <div className="flex items-center gap-2">
                  <Select value={earnestMode} onValueChange={(v: any)=> setEarnestMode(v)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percent</SelectItem>
                      <SelectItem value="dollar">Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" value={earnest} onChange={e=>setEarnest(Number(e.target.value))} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">EMD: {formatMoney(earnestDollar)}</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium">Escalation clause</div>
                  <div className="text-xs text-muted-foreground">Increase above competing offers up to a cap</div>
                </div>
                <Switch checked={hasEscalation} onCheckedChange={setHasEscalation} />
              </div>

              {hasEscalation && (
                <>
                  <div>
                    <Label>Escalation cap</Label>
                    <Input type="number" value={escalationCap} onChange={e=>setEscalationCap(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Increment</Label>
                    <Input type="number" value={escalationIncrement} onChange={e=>setEscalationIncrement(Number(e.target.value))} />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <Label>Seller concessions (optional)</Label>
                <Textarea value={sellerConcessions} onChange={e=>setSellerConcessions(e.target.value)} placeholder="e.g., Seller to credit $5,000 toward buyer closing costs." />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
              <Button onClick={next}>Next<ArrowRight className="w-4 h-4 ml-2"/></Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Purchase Agreement Contingencies</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="insp" checked={inspection} onCheckedChange={(v)=> setInspection(Boolean(v))} />
                <Label htmlFor="insp" className="text-sm sm:text-base">Structural Inspection</Label>
              </div>
              {inspection && (
                <div>
                  <Label className="text-sm sm:text-base">Inspection Completion Date</Label>
                  <Input type="date" value={inspectionDate} onChange={e=>setInspectionDate(e.target.value)} className="text-sm sm:text-base" />
                </div>
              )}

              <div className="sm:col-span-2">
                <Label className="text-sm sm:text-base">Attorney Approval Date</Label>
                <Input type="date" value={attorneyApprovalDate} onChange={e=>setAttorneyApprovalDate(e.target.value)} className="text-sm sm:text-base" />
                <p className="text-xs text-muted-foreground mt-1">Deadline for attorney approval of contract</p>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="appr" checked={appraisal} onCheckedChange={(v)=> setAppraisal(Boolean(v))} />
                <Label htmlFor="appr">Appraisal contingency</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="fin" checked={financingCont} onCheckedChange={(v)=> setFinancingCont(Boolean(v))} />
                <Label htmlFor="fin">Financing contingency</Label>
              </div>
              {financingCont && (
                <div>
                  <Label>Financing contingency (days)</Label>
                  <Input type="number" value={financingDays} onChange={e=>setFinancingDays(Number(e.target.value))} />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox id="sale" checked={homeSale} onCheckedChange={(v)=> setHomeSale(Boolean(v))} />
                <Label htmlFor="sale">Home sale contingency</Label>
              </div>
              {homeSale && (
                <div>
                  <Label>Home sale contingency (days)</Label>
                  <Input type="number" value={homeSaleDays} onChange={e=>setHomeSaleDays(Number(e.target.value))} />
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
              <Button onClick={next}>Next<ArrowRight className="w-4 h-4 ml-2"/></Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Review Purchase Agreement & Submit</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">Property</div>
                  <div className="text-sm">{address || "[Address]"}, {city || "[City]"}, {stateUS || "[State]"} {zip || "[ZIP]"}</div>
                  <div className="text-sm">List: {formatMoney(listPrice)}</div>
                  <div className="text-sm">Offer: <span className="font-medium">{formatMoney(offerPrice)}</span></div>
                  <div className="text-sm">Down payment: {formatMoney(dpDollar)} ({dpPercent.toFixed(1)}%)</div>
                  <div className="text-sm">Loan amount: {formatMoney(loanAmount)}</div>
                  <div className="text-sm">Earnest money: {formatMoney(earnestDollar)}</div>
                  <div className="text-sm">Closing date: {closingDate || "[Select date]"}</div>
                  {hasEscalation && (
                    <div className="text-sm">Escalation: +{formatMoney(escalationIncrement)} up to {formatMoney(escalationCap)}</div>
                  )}
                  {sellerConcessions && (
                    <div className="text-sm">Concessions: {sellerConcessions}</div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">Financing</div>
                  <div className="text-sm">Type: {financingType}</div>
                  {financingType !== 'Cash' && (
                    <>
                      <div className="text-sm">Rate: {interestRate}% • Term: {termYears} yrs</div>
                      <div className="text-sm">P&I: {formatMoney(pi)}</div>
                    </>
                  )}
                  <div className="text-sm">Taxes/mo: {formatMoney(taxesM)}</div>
                  <div className="text-sm">Insurance/mo: {formatMoney(insM)}</div>
                  <div className="text-sm">HOA/mo: {formatMoney(hoaMonthly)}</div>
                  <div className="text-sm font-medium">Estimated monthly total: {formatMoney(estMonthly)}</div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Flags */}
              {flags.length > 0 ? (
                <div className="p-3 rounded-md border bg-muted/40">
                  <div className="flex items-center gap-2 font-medium mb-2"><AlertCircle className="w-4 h-4"/> Resolve before submission</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {flags.map((f)=> <li key={f}>{f}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No blocking issues detected.</div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button variant="outline" onClick={() => {
                  const w = window.open('', '_blank');
                  if (!w) return;
                  const template = generateNYStatePurchaseContract();
                  w.document.write(`
                    <html>
                      <head>
                        <title>Purchase Contract - ${address || 'Property'}</title>
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
                        ${template}
                        <div class="no-print" style="text-align: center; margin: 20px; page-break-before: always;">
                          <button onclick="window.print()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">Print Purchase Contract</button>
                          <p style="margin-top: 10px; font-size: 14px; color: #666;">This purchase contract is ready for signatures and submission.</p>
                        </div>
                      </body>
                    </html>
                  `);
                  w.document.close();
                }} className="w-full sm:w-auto text-xs sm:text-sm">
                  <FileText className="w-4 h-4 mr-2"/>
                  Generate Purchase Contract
                </Button>
                <Button className="w-full sm:w-auto text-xs sm:text-sm"><Mail className="w-4 h-4 mr-2"/>Submit Offer</Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Right sidebar */}
      <div className="xl:col-span-1 space-y-4 xl:sticky xl:top-4 xl:self-start">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Contract & Closing Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Purchase Terms</div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Offer Price</span><span className="font-medium">{formatMoney(offerPrice)}</span></div>
                <div className="flex justify-between"><span>Down Payment</span><span>{formatMoney(dpDollar)} ({dpPercent.toFixed(1)}%)</span></div>
                <div className="flex justify-between"><span>Earnest Money</span><span>{formatMoney(earnestDollar)}</span></div>
                <div className="flex justify-between"><span>Loan Amount</span><span>{formatMoney(loanAmount)}</span></div>
                {financingType !== 'Cash' && <div className="flex justify-between text-xs"><span>LTV Ratio</span><span>{ltvRatio.toFixed(1)}%</span></div>}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Closing Costs</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Lender/Escrow Fees</span><span>{formatMoney(closingCosts)}</span></div>
                <div className="flex justify-between text-xs"><span>Title Insurance</span><span>{formatMoney(titleInsurance)}</span></div>
                <div className="flex justify-between text-xs"><span>Appraisal</span><span>{formatMoney(appraisalFee)}</span></div>
                <div className="flex justify-between text-xs"><span>Home Inspection</span><span>{formatMoney(inspectionFee)}</span></div>
                <div className="flex justify-between text-xs"><span>Attorney Fees</span><span>{formatMoney(attorneyFees)}</span></div>
                <div className="flex justify-between text-xs"><span>Recording/Survey</span><span>{formatMoney(recordingFees + surveyFee)}</span></div>
                <div className="flex justify-between font-medium border-t pt-2 mt-2"><span>Total Closing Costs</span><span>{formatMoney(totalClosingCosts)}</span></div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Payment</div>
              <div className="space-y-1">
                {financingType !== 'Cash' && <div className="flex justify-between"><span>Principal & Interest</span><span>{formatMoney(pi)}</span></div>}
                <div className="flex justify-between"><span>Property Taxes</span><span>{formatMoney(taxesM)}</span></div>
                <div className="flex justify-between"><span>Insurance</span><span>{formatMoney(insM)}</span></div>
                {hoaMonthly > 0 && <div className="flex justify-between"><span>HOA Fees</span><span>{formatMoney(hoaMonthly)}</span></div>}
                {needsPMI && <div className="flex justify-between text-xs"><span>PMI (until 20% equity)</span><span>{formatMoney(pmiMonthly)}</span></div>}
                <div className="flex justify-between font-medium border-t pt-2 mt-2"><span>Total Monthly</span><span>{formatMoney(totalMonthlyPayment)}</span></div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between font-bold text-blue-900">
                <span>Total Cash Needed</span>
                <span>{formatMoney(totalCashNeeded)}</span>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Down payment + Earnest money + Closing costs
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Compliance Check</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {flags.length === 0 ? (
              <div className="text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                All requirements met
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="font-medium">{flags.length} item(s) need attention</span>
                </div>
                <ul className="space-y-1 text-xs">
                  {flags.map(f => <li key={f} className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span><span>{f}</span></li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Button variant="secondary" size="sm" onClick={()=>{ setOfferPrice(listPrice); }}>Set offer = list price</Button>
              <Button variant="secondary" size="sm" onClick={()=>{ setDpMode('percent'); setDownPayment(20); }}>20% down (no PMI)</Button>
              <Button variant="secondary" size="sm" onClick={()=>{ setEarnestMode('percent'); setEarnest(3); }}>3% earnest money</Button>
              <Button variant="secondary" size="sm" onClick={()=>{ setDpMode('percent'); setDownPayment(10); setEarnestMode('percent'); setEarnest(5); }}>10% down, 5% earnest</Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Draft Management</div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>Save</Button>
                <Button variant="outline" size="sm" onClick={handleSaveAs}>Save As</Button>
              </div>

              {drafts.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Recent drafts</div>
                  <div className="max-h-32 overflow-auto space-y-1">
                    {drafts.slice(0, 3).map(d => (
                      <div key={d.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                        <button className={`text-left truncate flex-1 ${currentDraftId===d.id?'font-medium':''}`} onClick={()=> handleLoadDraft(d.id)} title={d.name}>
                          {d.name}
                        </button>
                        <button className="text-destructive hover:underline ml-2" onClick={()=> handleDeleteDraft(d.id)}>×</button>
                      </div>
                    ))}
                    {drafts.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">+{drafts.length - 3} more drafts</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border rounded-lg bg-green-50">
              <h6 className="font-medium text-sm mb-1">Official Purchase Contract</h6>
              <p className="text-xs text-green-800">Your data fills the official Standard Form Contract automatically.</p>
            </div>

            <Button variant="destructive" size="sm" onClick={handleClearDraft} className="w-full">Clear Draft</Button>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Purchase Agreement Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Purchase Agreement</DialogTitle>
            <DialogDescription>
              Complete your purchase agreement with data from your offer builder
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {showTemplateDialog && (
              <DocumentTemplateForm
                template={getTemplateById('purchase-agreement')!}
                initialData={buildPurchaseAgreementData()}
                onSave={handleSaveDocument}
                onGeneratePDF={handleGeneratePDF}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
