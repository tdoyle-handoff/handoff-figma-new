/*
WIREFRAME: Buyer Offer Builder (Web)

[Header]
┌──────────────────────────────────────────────────────────────┐
│ Offer Builder  | Step 1 of 5  | Save Draft | Help            │
└──────────────────────────────────────────────────────────────┘

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

import React, { useMemo, useState, useEffect, useRef } from "react";
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
import { AlertCircle, ArrowLeft, ArrowRight, DollarSign, FileText, Mail, Percent } from "lucide-react";
import { supabase } from "../utils/supabase/client";

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

  // Draft persistence state
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

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

  const loanAmount = Math.max(0, (offerPrice || 0) - (dpDollar || 0));
  const pi = monthlyPI(loanAmount, financingType === "Cash" ? 0 : interestRate, financingType === "Cash" ? 1 : termYears);
  const taxesM = (taxesAnnual || 0) / 12;
  const insM = (insuranceAnnual || 0) / 12;
  const estMonthly = financingType === "Cash" ? (hoaMonthly + taxesM + insM) : (pi + taxesM + insM + hoaMonthly);

  const earnestDollar = useMemo(() => {
    const base = offerPrice || listPrice || 0;
    return earnestMode === "percent" ? base * (Number(earnest) || 0) / 100 : (Number(earnest) || 0);
  }, [earnestMode, earnest, offerPrice, listPrice]);

  // Compliance flags
  const flags = useMemo(() => {
    const out: string[] = [];
    if (!address || !city || !stateUS || !zip) out.push("Missing property address");
    if (!offerPrice || offerPrice <= 0) out.push("Offer price required");
    if (financingType !== "Cash" && (!preApprovalAttached)) out.push("Attach pre-approval letter");
    if (financingType !== "Cash" && (!interestRate || !termYears)) out.push("Interest rate and term required");
    if (!closingDate) out.push("Closing date not set");
    if (hasEscalation) {
      if (!escalationCap) out.push("Escalation cap missing");
      if (!escalationIncrement) out.push("Escalation increment missing");
    }
    if (dpDollar < 0) out.push("Down payment invalid");
    return out;
  }, [address, city, stateUS, zip, offerPrice, financingType, preApprovalAttached, interestRate, termYears, closingDate, hasEscalation, escalationCap, escalationIncrement, dpDollar]);

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

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OfferDraft;
        applyDraft(parsed);
      }
    } catch {}
  }, []);

  // Autosave draft whenever inputs change
  useEffect(() => {
    const draft = buildDraft();
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(draft));
      setSavedAt(draft.savedAt!);
    } catch {}
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
    attachments
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

  const handleSaveDraft = () => {
    const id = currentDraftId || randomId();
    const name = currentDraftName || `Draft ${new Date().toLocaleString()}`;
    const draft = { ...buildDraft(), id, name };
    try {
      localStorage.setItem(draftKey(id), JSON.stringify(draft));
      setSavedAt(draft.savedAt!);
      setCurrentDraftId(id);
      setCurrentDraftName(name);
      // update list
      const meta: DraftMeta = { id, name, savedAt: draft.savedAt! };
      const others = drafts.filter(d => d.id !== id);
      const updated = [meta, ...others].sort((a,b)=> (b.savedAt > a.savedAt ? 1 : -1));
      persistDraftsList(updated);
    } catch {}
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

  const handleExportJSON = () => {
    const draft = buildDraft();
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offer-draft-${new Date().toISOString().slice(0,19)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (file?: File | null) => {
    const f = file || importRef.current?.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}')) as Partial<OfferDraft>;
        applyDraft(parsed);
        handleSaveDraft();
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(f);
  };

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

  // Generate a printable HTML summary and invoke browser print for PDF
  const handleGeneratePdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const section = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px;">
        <h1 style="margin:0 0 8px 0; font-size:22px;">Offer Summary</h1>
        <div style="color:#6b7280; font-size:12px; margin-bottom:16px;">Generated ${new Date().toLocaleString()}</div>
        <h2 style="font-size:16px; margin:16px 0 6px;">Property</h2>
        <div>${address || '[Address]'}, ${city || '[City]'}, ${stateUS || '[State]'} ${zip || '[ZIP]'}</div>
        <div>List: ${formatMoney(listPrice)} | Offer: <strong>${formatMoney(offerPrice)}</strong></div>
        <div>Down payment: ${formatMoney(dpDollar)} (${dpPercent.toFixed(1)}%) | Loan: ${formatMoney(loanAmount)}</div>
        <div>Earnest: ${formatMoney(earnestDollar)} | Closing: ${closingDate || '[Select date]'}</div>
        ${hasEscalation ? `<div>Escalation: +${formatMoney(escalationIncrement)} up to ${formatMoney(escalationCap)}</div>` : ''}
        ${sellerConcessions ? `<div>Concessions: ${sellerConcessions}</div>` : ''}
        <h2 style="font-size:16px; margin:16px 0 6px;">Financing</h2>
        <div>Type: ${financingType}</div>
        ${financingType !== 'Cash' ? `<div>Rate: ${interestRate}% • Term: ${termYears} yrs • P&I: ${formatMoney(pi)}</div>` : ''}
        <div>Taxes/mo: ${formatMoney(taxesM)} | Insurance/mo: ${formatMoney(insM)} | HOA/mo: ${formatMoney(hoaMonthly)}</div>
        <div style="font-weight:600;">Estimated monthly: ${formatMoney(estMonthly)}</div>
        <h2 style="font-size:16px; margin:16px 0 6px;">Contingencies</h2>
        <ul>
          ${inspection ? `<li>Inspection (${inspectionDays} days)</li>` : '<li>No inspection contingency</li>'}
          ${appraisal ? '<li>Appraisal</li>' : '<li>No appraisal contingency</li>'}
          ${financingCont ? `<li>Financing (${financingDays} days)</li>` : '<li>No financing contingency</li>'}
          ${homeSale ? `<li>Home sale (${homeSaleDays} days)</li>` : '<li>No home sale contingency</li>'}
        </ul>
        ${flags.length > 0 ? `<div style="margin-top:12px; padding:12px; border:1px solid #fca5a5; background:#fef2f2;">
          <div style="font-weight:600; color:#b91c1c;">Resolve before submission</div>
          <ul>${flags.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>` : '<div style="margin-top:12px; color:#6b7280;">No blocking issues detected.</div>'}
        <h2 style="font-size:16px; margin:16px 0 6px;">Attachments</h2>
        ${attachments.length === 0 ? '<div>None</div>' : attachments.map(a => {
          if (a.dataUrl && a.type.startsWith('image/')) {
            return `<div style="margin-bottom:8px;"><div style="font-size:12px;color:#6b7280;">${a.name}</div><img src="${a.dataUrl}" style="max-width:100%;height:auto;border:1px solid #e5e7eb;"/></div>`;
          }
          return `<div>${a.name}</div>`;
        }).join('')}
      </div>
    `;
    w.document.write(`<html><head><title>Offer Summary</title><style>@page{margin:12mm;} body{background:#fff;} @media print { a{color:black;text-decoration:none} }</style></head><body>${section}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 250);
  };

  return (
    <div className="mx-auto max-w-6xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: main content */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Offer Builder</h1>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-muted-foreground mr-2">{savedText}</span>
            <Button variant="secondary" size="sm" onClick={handleSaveDraft}>Save draft</Button>
            <Button variant="outline" size="sm">Help</Button>
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
              <CardTitle>Property details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Address</Label>
                <Input value={address} onChange={e=>setAddress(e.target.value)} placeholder="123 Main St" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={city} onChange={e=>setCity(e.target.value)} placeholder="Anytown" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={stateUS} onChange={e=>setStateUS(e.target.value)} placeholder="NY" />
              </div>
              <div>
                <Label>ZIP</Label>
                <Input value={zip} onChange={e=>setZip(e.target.value)} placeholder="10001" />
              </div>
              <div>
                <Label>List price</Label>
                <Input type="number" value={listPrice} onChange={e=>setListPrice(Number(e.target.value))} />
              </div>
              <div>
                <Label>HOA monthly</Label>
                <Input type="number" value={hoaMonthly} onChange={e=>setHoaMonthly(Number(e.target.value))} />
              </div>
              <div>
                <Label>Taxes per year</Label>
                <Input type="number" value={taxesAnnual} onChange={e=>setTaxesAnnual(Number(e.target.value))} />
              </div>
              <div>
                <Label>Insurance per year</Label>
                <Input type="number" value={insuranceAnnual} onChange={e=>setInsuranceAnnual(Number(e.target.value))} />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" disabled><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
              <Button onClick={()=>{ setOfferPrice(listPrice); next(); }}>Next<ArrowRight className="w-4 h-4 ml-2"/></Button>
            </CardFooter>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Buyer & financing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Buyer full name</Label>
                <Input value={buyerName} onChange={e=>setBuyerName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} placeholder="jane@email.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={buyerPhone} onChange={e=>setBuyerPhone(e.target.value)} placeholder="(555) 555-5555" />
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
              <CardTitle>Offer terms</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Offer price</Label>
                <Input type="number" value={offerPrice} onChange={e=>setOfferPrice(Number(e.target.value))} />
              </div>

              <div>
                <Label>Closing date</Label>
                <Input type="date" value={closingDate} onChange={e=>setClosingDate(e.target.value)} />
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
              <CardTitle>Contingencies</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="insp" checked={inspection} onCheckedChange={(v)=> setInspection(Boolean(v))} />
                <Label htmlFor="insp">Inspection contingency</Label>
              </div>
              {inspection && (
                <div>
                  <Label>Inspection period (days)</Label>
                  <Input type="number" value={inspectionDays} onChange={e=>setInspectionDays(Number(e.target.value))} />
                </div>
              )}

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
              <CardTitle>Review & submit</CardTitle>
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
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleGeneratePdf}><FileText className="w-4 h-4 mr-2"/>Generate PDF</Button>
                <Button><Mail className="w-4 h-4 mr-2"/>Send to listing agent</Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Affordability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Offer price</span><span>{formatMoney(offerPrice)}</span></div>
            <div className="flex justify-between"><span>Down payment</span><span>{formatMoney(dpDollar)} ({dpPercent.toFixed(1)}%)</span></div>
            <div className="flex justify-between"><span>Loan amount</span><span>{formatMoney(loanAmount)}</span></div>
            {financingType !== 'Cash' && <div className="flex justify-between"><span>P&I</span><span>{formatMoney(pi)}</span></div>}
            <div className="flex justify-between"><span>Taxes</span><span>{formatMoney(taxesM)}</span></div>
            <div className="flex justify-between"><span>Insurance</span><span>{formatMoney(insM)}</span></div>
            <div className="flex justify-between font-medium"><span>Est. monthly</span><span>{formatMoney(estMonthly)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance check</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {flags.length === 0 ? (
              <div className="text-muted-foreground">Looks good.</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {flags.map(f => <li key={f}>{f}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shortcuts & Drafts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="secondary" onClick={()=>{ setOfferPrice(listPrice); }}>Set offer = list price</Button>
            <Button variant="secondary" onClick={()=>{ setDpMode('percent'); setDownPayment(20); }}>20% down</Button>
            <Button variant="secondary" onClick={()=>{ setEarnestMode('percent'); setEarnest(3); }}>3% earnest</Button>
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground">Draft</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>Save</Button>
              <Button variant="outline" onClick={handleSaveAs}>Save As</Button>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">My drafts</div>
              {drafts.length === 0 ? (
                <div className="text-xs text-muted-foreground">No drafts yet</div>
              ) : (
                <ul className="space-y-1 max-h-40 overflow-auto">
                  {drafts.map(d => (
                    <li key={d.id} className="flex items-center justify-between text-xs">
                      <button className={`text-left truncate ${currentDraftId===d.id?'font-medium':''}`} onClick={()=> handleLoadDraft(d.id)} title={d.name}>
                        {d.name}
                      </button>
                      <div className="flex gap-2">
                        <button className="text-muted-foreground hover:underline" onClick={()=> {
                          const n = window.prompt('Rename draft', d.name);
                          if (!n) return;
                          const updated = drafts.map(x => x.id===d.id? {...x, name:n }: x);
                          persistDraftsList(updated);
                          if (currentDraftId===d.id) setCurrentDraftName(n);
                        }}>rename</button>
                        <button className="text-destructive hover:underline" onClick={()=> handleDeleteDraft(d.id)}>delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={handleExportJSON}>Export JSON</Button>
              <Button className="flex-1" variant="outline" onClick={()=> importRef.current?.click()}>Import JSON</Button>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={(e)=> handleImportJSON(e.target.files?.[0] || null)} />
            </div>
            <Button variant="destructive" onClick={handleClearDraft}>Clear saved (autosave) draft</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

