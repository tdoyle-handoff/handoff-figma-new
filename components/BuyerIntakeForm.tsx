import React, { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

// ---- Types ----
export type FinancingType = "cash" | "conventional" | "fha" | "va" | "jumbo" | "other";
export type UseType = "primary" | "second_home" | "investment";
export type PropertyType = "condo" | "co_op" | "single_family" | "townhouse" | "new_build";
export type DownPaymentMode = "percent" | "amount";

export interface CoBuyer {
  name: string;
  email: string;
  phone: string;
}

export interface BuyerIntakeData {
  // Contact & decision makers
  fullName: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone" | "text";
  coBuyers: CoBuyer[];

  // Goals & timeline
  goal: string;
  moveInDate?: string; // ISO date
  hardDeadlines?: string;
  madeOffersBefore: boolean;

  // Budget & financing
  financingType: FinancingType;
  preApproved: boolean;
  lenderName?: string;
  preApprovalAmount?: number;
  downPaymentPercent?: number; // stored as percent (e.g., 20)
  downPaymentAmount?: number; // stored as dollars
  downPaymentMode?: DownPaymentMode;
  reservesAfterClose?: number;
  comfortMonthlyPITI?: number;
  maxPrice?: number;

  // Costs & constraints
  taxTolerance?: number;
  hoaCeiling?: number;
  closingCashAvailable?: number;
  needSellerCredits: boolean;

  // Location & lifestyle
  targetNeighborhoods: string[];
  backupNeighborhoods: string[];
  commuteMinutes?: number;
  transitNeeds?: string;
  schoolNeeds?: string;
  pets: boolean;
  petNotes?: string;

  // Property criteria
  minBeds?: number;
  minBaths?: number;
  minSqft?: number;
  parking: "none" | "street" | "assigned" | "garage";
  propertyTypes: PropertyType[];
  layoutMustHaves?: string;
  outdoorSpace: boolean;
  lotSizeMinSqft?: number;

  // Condition & renovation
  willRenovate: boolean;
  renoBudget?: number;
  ageTolerance?: string; // e.g. "Prefer < 20y"
  hazardConcerns: string[]; // e.g. ["septic", "oil_tank"]

  // Dealbreakers & trade-offs
  topMustHaves: string[];
  dealbreakers?: string;
  tradeoffs?: string;

  // Touring logistics
  availableDays: string[]; // ["Mon", ...]
  tourTimeWindow?: string; // free text
  virtualToursOk: boolean;
  accessibilityNeeds?: string;

  // Offer strategy
  willingOverList: boolean;
  overListCapPercent?: number;
  contingencyPrefs: string[]; // ["inspection", "financing", ...]
  earnestMoney?: number;
  escalationClause: boolean;
  appraisalGap: boolean;

  // Due diligence
  inspections: string[]; // ["general", "radon", ...]
  insuranceConcerns?: string;

  // Ownership & use
  useType: UseType;
  rentalPlans: boolean;
  rentalDetails?: string;
  holdPeriodYears?: number;

  // Notes
  additionalNotes?: string;
}

// ---- Helpers ----
const num = (v: string | undefined) => {
  if (v == null || v.trim() === "") return undefined;
  const n = Number((v + "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const fmtCurrency = (n?: number) =>
  n == null ? "" : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Reusable slider+number field
function MoneyField({
  label,
  name,
  value,
  setValue,
  min = 0,
  max = 2_000_000,
  step = 1_000,
  note,
}: {
  label: string;
  name: string;
  value: number | undefined;
  setValue: (n: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  note?: string;
}) {
  const v = value ?? 0;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamp(v, min, max)}
          onChange={(e) => setValue(Number(e.target.value))}
          className="range w-40 shrink-0"
          aria-label={`${label} slider`}
        />
        <input
          name={name}
          inputMode="numeric"
          className="input w-28 md:w-36 shrink-0"
          value={value == null ? "" : String(value)}
          onChange={(e) => setValue(num(e.target.value))}
          placeholder={`${min}`}
        />
      </div>
      <div className="text-xs text-muted-foreground">{fmtCurrency(value)}{note ? ` · ${note}` : ""}</div>
    </div>
  );
}

// Percent slider+number field
function PercentField({
  label,
  name,
  value,
  setValue,
  min = 0,
  max = 100,
  step = 1,
  note,
  disabled,
}: {
  label: string;
  name: string;
  value: number | undefined;
  setValue: (n: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  note?: string;
  disabled?: boolean;
}) {
  const v = value ?? 0;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2 min-w-0 opacity-100">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamp(v, min, max)}
          onChange={(e) => setValue(Number(e.target.value))}
          className="range w-40 shrink-0"
          aria-label={`${label} slider`}
          disabled={disabled}
        />
        <input
          name={name}
          inputMode="numeric"
          className="input w-16 md:w-28 shrink-0"
          value={value == null ? "" : String(value)}
          onChange={(e) => setValue(num(e.target.value))}
          placeholder={`${min}`}
          disabled={disabled}
        />
        <span className="text-sm">%</span>
      </div>
      {note && <div className="text-xs text-muted-foreground">{note}</div>}
    </div>
  );
}

// ---- Component ----
export default function BuyerIntakeForm({
  onSubmit,
  defaults,
  title = "Buyer Intake",
}: {
  onSubmit?: (data: BuyerIntakeData) => void;
  defaults?: Partial<BuyerIntakeData>;
  title?: string;
}) {
  // dynamic lists
  const [coBuyers, setCoBuyers] = useState<CoBuyer[]>(defaults?.coBuyers ?? []);
  const [targetNeighborhoods, setTargetNeighborhoods] = useState<string[]>(
    defaults?.targetNeighborhoods ?? []
  );
  const [backupNeighborhoods, setBackupNeighborhoods] = useState<string[]>(
    defaults?.backupNeighborhoods ?? []
  );
  const [topMustHaves, setTopMustHaves] = useState<string[]>(defaults?.topMustHaves ?? []);

  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(
    defaults?.propertyTypes ?? ["single_family"]
  );
  const [hazardConcerns, setHazardConcerns] = useState<string[]>(
    defaults?.hazardConcerns ?? []
  );
  const [availableDays, setAvailableDays] = useState<string[]>(
    defaults?.availableDays ?? []
  );
  const [contingencyPrefs, setContingencyPrefs] = useState<string[]>(
    defaults?.contingencyPrefs ?? ["inspection", "financing", "appraisal"]
  );
  const [inspections, setInspections] = useState<string[]>(defaults?.inspections ?? ["general"]);

  const [virtualToursOk, setVirtualToursOk] = useState<boolean>(defaults?.virtualToursOk ?? true);
  const [outdoorSpace, setOutdoorSpace] = useState<boolean>(defaults?.outdoorSpace ?? true);
  const [pets, setPets] = useState<boolean>(defaults?.pets ?? false);
  const [preApproved, setPreApproved] = useState<boolean>(defaults?.preApproved ?? false);
  const [willRenovate, setWillRenovate] = useState<boolean>(defaults?.willRenovate ?? false);
  const [needSellerCredits, setNeedSellerCredits] = useState<boolean>(
    defaults?.needSellerCredits ?? false
  );
  const [willingOverList, setWillingOverList] = useState<boolean>(
    defaults?.willingOverList ?? false
  );
  const [escalationClause, setEscalationClause] = useState<boolean>(
    defaults?.escalationClause ?? false
  );
  const [appraisalGap, setAppraisalGap] = useState<boolean>(defaults?.appraisalGap ?? false);
  const [rentalPlans, setRentalPlans] = useState<boolean>(defaults?.rentalPlans ?? false);

  const [preferredContact, setPreferredContact] = useState<"email" | "phone" | "text">(
    defaults?.preferredContact ?? "email"
  );
  const [financingType, setFinancingType] = useState<FinancingType>(
    defaults?.financingType ?? "conventional"
  );
  const [useType, setUseType] = useState<UseType>(defaults?.useType ?? "primary");
  const [parking, setParking] = useState<"none" | "street" | "assigned" | "garage">(
    defaults?.parking ?? "garage"
  );

  // Sliders + numeric fields (controlled)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(defaults?.maxPrice ?? 900_000);
  const [comfortMonthlyPITI, setComfortMonthlyPITI] = useState<number | undefined>(
    defaults?.comfortMonthlyPITI ?? 4_000
  );
  const [hoaCeiling, setHoaCeiling] = useState<number | undefined>(defaults?.hoaCeiling ?? 800);
  const [taxTolerance, setTaxTolerance] = useState<number | undefined>(
    defaults?.taxTolerance ?? 12_000
  );
  const [closingCashAvailable, setClosingCashAvailable] = useState<number | undefined>(
    defaults?.closingCashAvailable ?? 60_000
  );
  const [earnestMoney, setEarnestMoney] = useState<number | undefined>(
    defaults?.earnestMoney ?? 20_000
  );
  const [renoBudget, setRenoBudget] = useState<number | undefined>(defaults?.renoBudget ?? 50_000);
  const [overListCapPercent, setOverListCapPercent] = useState<number | undefined>(
    defaults?.overListCapPercent ?? 5
  );
  const [commuteMinutes, setCommuteMinutes] = useState<number | undefined>(
    defaults?.commuteMinutes ?? 45
  );
  const [lotSizeMinSqft, setLotSizeMinSqft] = useState<number | undefined>(
    defaults?.lotSizeMinSqft ?? 3_000
  );

  // Down payment: percent or amount, synced
  const [downPaymentMode, setDownPaymentMode] = useState<DownPaymentMode>(
    (defaults?.downPaymentMode as DownPaymentMode) ?? "percent"
  );
  const [downPaymentPercent, setDownPaymentPercent] = useState<number | undefined>(
    defaults?.downPaymentPercent ?? 20
  );
  const [downPaymentAmount, setDownPaymentAmount] = useState<number | undefined>(
    defaults?.downPaymentAmount
  );

  // derive mirror values
  const effectiveDownPaymentAmount = useMemo(() => {
    if (!maxPrice) return undefined;
    if (downPaymentMode === "amount") return downPaymentAmount;
    if (downPaymentPercent == null) return undefined;
    return Math.round((downPaymentPercent / 100) * maxPrice);
  }, [downPaymentMode, downPaymentPercent, downPaymentAmount, maxPrice]);

  const effectiveDownPaymentPercent = useMemo(() => {
    if (!maxPrice) return downPaymentPercent; // cannot infer without price
    if (downPaymentMode === "percent") return downPaymentPercent;
    if (downPaymentAmount == null) return undefined;
    return Math.round((downPaymentAmount / maxPrice) * 1000) / 10; // 0.1% precision
  }, [downPaymentMode, downPaymentPercent, downPaymentAmount, maxPrice]);

  // keep mirrored value visible as user moves price slider
  useEffect(() => {
    if (!maxPrice) return;
    if (downPaymentMode === "percent" && downPaymentPercent != null) {
      setDownPaymentAmount(Math.round((downPaymentPercent / 100) * maxPrice));
    }
    if (downPaymentMode === "amount" && downPaymentAmount != null) {
      setDownPaymentPercent(Math.round(((downPaymentAmount / maxPrice) * 100) * 10) / 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPrice]);

  const handleToggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const handleTypesToggle = (value: PropertyType) => {
    setPropertyTypes(
      propertyTypes.includes(value)
        ? propertyTypes.filter((x) => x !== value)
        : [...propertyTypes, value]
    );
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const data: BuyerIntakeData = {
      fullName: String(fd.get("fullName") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      preferredContact,
      coBuyers,

      goal: String(fd.get("goal") || "").trim(),
      moveInDate: String(fd.get("moveInDate") || "") || undefined,
      hardDeadlines: String(fd.get("hardDeadlines") || "") || undefined,
      madeOffersBefore: (fd.get("madeOffersBefore") as string) === "on",

      financingType,
      preApproved,
      lenderName: String(fd.get("lenderName") || "") || undefined,
      preApprovalAmount: num(fd.get("preApprovalAmount") as string | undefined),
      downPaymentPercent: effectiveDownPaymentPercent,
      downPaymentAmount: effectiveDownPaymentAmount,
      downPaymentMode,
      reservesAfterClose: closingCashAvailable,
      comfortMonthlyPITI,
      maxPrice,

      taxTolerance,
      hoaCeiling,
      closingCashAvailable,
      needSellerCredits,

      targetNeighborhoods,
      backupNeighborhoods,
      commuteMinutes,
      transitNeeds: String(fd.get("transitNeeds") || "") || undefined,
      schoolNeeds: String(fd.get("schoolNeeds") || "") || undefined,
      pets,
      petNotes: String(fd.get("petNotes") || "") || undefined,

      minBeds: num(fd.get("minBeds") as string | undefined),
      minBaths: num(fd.get("minBaths") as string | undefined),
      minSqft: num(fd.get("minSqft") as string | undefined),
      parking,
      propertyTypes,
      layoutMustHaves: String(fd.get("layoutMustHaves") || "") || undefined,
      outdoorSpace,
      lotSizeMinSqft,

      willRenovate,
      renoBudget,
      ageTolerance: String(fd.get("ageTolerance") || "") || undefined,
      hazardConcerns,

      topMustHaves,
      dealbreakers: String(fd.get("dealbreakers") || "") || undefined,
      tradeoffs: String(fd.get("tradeoffs") || "") || undefined,

      availableDays,
      tourTimeWindow: String(fd.get("tourTimeWindow") || "") || undefined,
      virtualToursOk,
      accessibilityNeeds: String(fd.get("accessibilityNeeds") || "") || undefined,

      willingOverList,
      overListCapPercent,
      contingencyPrefs,
      earnestMoney,
      escalationClause,
      appraisalGap,

      inspections,
      insuranceConcerns: String(fd.get("insuranceConcerns") || "") || undefined,

      useType,
      rentalPlans,
      rentalDetails: String(fd.get("rentalDetails") || "") || undefined,
      holdPeriodYears: num(fd.get("holdPeriodYears") as string | undefined),

      additionalNotes: String(fd.get("additionalNotes") || "") || undefined,
    };

    // Minimal required validation
    const errs: string[] = [];
    if (!data.fullName) errs.push("Full name");
    if (!data.email) errs.push("Email");
    if (!data.phone) errs.push("Phone");
    if (!data.goal) errs.push("Goal");

    if (errs.length) {
      toast.error(`Missing required: ${errs.join(", ")}`);
      return;
    }

    onSubmit?.(data);
    console.info("BuyerIntakeData", data);
    toast.success("Buyer intake saved");
  };

  // ---- UI ----
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Toaster position="top-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Complete the sections below. Required fields are marked with *.
        </p>
      </div>

      <form onSubmit={onFormSubmit} className="space-y-8">
        {/* Contact */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Contact & Decision Makers</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Full name *</label>
              <input name="fullName" required className="input" placeholder="Jane Doe" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Email *</label>
              <input name="email" type="email" required className="input" placeholder="jane@acme.com" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Phone *</label>
              <input name="phone" required className="input" placeholder="(555) 555-5555" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Preferred contact</label>
              <select
                className="input"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value as any)}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="text">Text</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Have you made offers before?</label>
              <select
                className="input"
                name="madeOffersBeforeSelect"
                onChange={(e) => {/* keep FormData checkbox in sync if needed */}}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              {/* Hidden checkbox to preserve previous behavior */}
              <input type="checkbox" name="madeOffersBefore" className="hidden" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Tour time window</label>
              <select name="tourTimeWindow" className="input">
                <option value="">Select…</option>
                <option>Weekdays evenings</option>
                <option>Weekends only</option>
                <option>Mornings</option>
                <option>Afternoons</option>
                <option>Flexible</option>
              </select>
            </div>
          </div>

          {/* Co-buyers */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Co-buyers</h3>
              <button
                type="button"
                onClick={() => setCoBuyers([...coBuyers, { name: "", email: "", phone: "" }])}
                className="btn-secondary"
              >
                Add co-buyer
              </button>
            </div>
            {coBuyers.length > 0 && (
              <div className="mt-3 space-y-3">
                {coBuyers.map((c, idx) => (
                  <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <input
                      className="input md:col-span-4"
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) => {
                        const next = [...coBuyers];
                        next[idx].name = e.target.value;
                        setCoBuyers(next);
                      }}
                    />
                    <input
                      className="input md:col-span-4"
                      placeholder="Email"
                      type="email"
                      value={c.email}
                      onChange={(e) => {
                        const next = [...coBuyers];
                        next[idx].email = e.target.value;
                        setCoBuyers(next);
                      }}
                    />
                    <div className="md:col-span-3">
                      <input
                        className="input w-full"
                        placeholder="Phone"
                        value={c.phone}
                        onChange={(e) => {
                          const next = [...coBuyers];
                          next[idx].phone = e.target.value;
                          setCoBuyers(next);
                        }}
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setCoBuyers(coBuyers.filter((_, i) => i !== idx))}
                        className="btn-ghost"
                        aria-label="Remove co-buyer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Goals & timeline */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Goals & Timeline</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col">
              <label className="mb-1 text-sm font-medium">Why buy now? *</label>
              <input name="goal" required className="input" placeholder="e.g., larger space, new school zone" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Target move-in</label>
              <input name="moveInDate" type="date" className="input" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col">
              <label className="mb-1 text-sm font-medium">Hard deadlines</label>
              <input name="hardDeadlines" className="input" placeholder="Lease end, school start, baby, etc." />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input name="madeOffersBefore" type="checkbox" className="checkbox" />
              Made offers before
            </label>
          </div>
        </section>

        {/* Budget & financing */}
        <section className="modern-card-elevated">
          <h2 className="mb-2 text-lg font-semibold text-primary">Budget & Financing</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Financing type</label>
                <select className="input" value={financingType} onChange={(e) => setFinancingType(e.target.value as FinancingType)}>
                  <option value="cash">Cash</option>
                  <option value="conventional">Conventional</option>
                  <option value="fha">FHA</option>
                  <option value="va">VA</option>
                  <option value="jumbo">Jumbo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={preApproved} onChange={(e) => setPreApproved(e.target.checked)} className="checkbox" />
                Pre-approved
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">Lender name</label>
                  <input name="lenderName" className="input" placeholder="Acme Mortgage" />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">Pre-approval amount</label>
                  <input name="preApprovalAmount" inputMode="numeric" className="input" placeholder="650000" />
                </div>
              </div>

              {/* Down payment controls */}
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/30 p-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Down payment input</label>
                  <select
                    className="input w-44"
                    value={downPaymentMode}
                    onChange={(e) => setDownPaymentMode(e.target.value as DownPaymentMode)}
                  >
                    <option value="percent">Percent</option>
                    <option value="amount">Dollar amount</option>
                  </select>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <PercentField
                    label="Down payment %"
                    name="downPaymentPercent"
                    value={effectiveDownPaymentPercent}
                    setValue={(n) => setDownPaymentPercent(n)}
                    min={0}
                    max={100}
                    step={1}
                    note={effectiveDownPaymentAmount ? `≈ ${fmtCurrency(effectiveDownPaymentAmount)}` : undefined}
                    disabled={downPaymentMode === "amount"}
                  />
                  <MoneyField
                    label="Down payment ($)"
                    name="downPaymentAmount"
                    value={effectiveDownPaymentAmount}
                    setValue={(n) => setDownPaymentAmount(n)}
                    min={0}
                    max={1_000_000}
                    step={1_000}
                    note={effectiveDownPaymentPercent != null ? `≈ ${effectiveDownPaymentPercent}%` : undefined}
                  />
                </div>
              </div>
            </div>

            {/* Money sliders */}
            <div className="flex flex-col gap-4">
              <MoneyField label="Max price ($)" name="maxPrice" value={maxPrice} setValue={setMaxPrice} min={100_000} max={3_000_000} step={5_000} />
              <MoneyField label="Comfort monthly PITI ($)" name="comfortMonthlyPITI" value={comfortMonthlyPITI} setValue={setComfortMonthlyPITI} min={500} max={15_000} step={50} />
              <MoneyField label="HOA/condo fee ceiling ($/mo)" name="hoaCeiling" value={hoaCeiling} setValue={setHoaCeiling} min={0} max={2_000} step={10} />
              <MoneyField label="Property tax tolerance ($/yr)" name="taxTolerance" value={taxTolerance} setValue={setTaxTolerance} min={0} max={30_000} step={100} />
              <MoneyField label="Closing cash available ($)" name="closingCashAvailable" value={closingCashAvailable} setValue={setClosingCashAvailable} min={0} max={500_000} step={1_000} />
            </div>
          </div>
        </section>

        {/* Location & lifestyle */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Location & Lifestyle</h2>

          {/* Target neighborhoods */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Target neighborhoods</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setTargetNeighborhoods([...targetNeighborhoods, ""])}
            >
              Add
            </button>
          </div>
          {targetNeighborhoods.length > 0 && (
            <div className="mt-2 space-y-2">
              {targetNeighborhoods.map((n, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Neighborhood name"
                    value={n}
                    onChange={(e) => {
                      const next = [...targetNeighborhoods];
                      next[i] = e.target.value;
                      setTargetNeighborhoods(next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setTargetNeighborhoods(targetNeighborhoods.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Backup */}
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Backup neighborhoods</h3>
            <button type="button" className="btn-secondary" onClick={() => setBackupNeighborhoods([...backupNeighborhoods, ""]) }>
              Add
            </button>
          </div>
          {backupNeighborhoods.length > 0 && (
            <div className="mt-2 space-y-2">
              {backupNeighborhoods.map((n, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Neighborhood name"
                    value={n}
                    onChange={(e) => {
                      const next = [...backupNeighborhoods];
                      next[i] = e.target.value;
                      setBackupNeighborhoods(next);
                    }}
                  />
                  <button type="button" className="btn-ghost" onClick={() => setBackupNeighborhoods(backupNeighborhoods.filter((_, idx) => idx !== i))}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Max commute (min)</label>
              <div className="flex items-center gap-2 min-w-0">
                <input type="range" min={0} max={120} step={5} value={clamp(commuteMinutes ?? 0, 0, 120)} onChange={(e) => setCommuteMinutes(Number(e.target.value))} className="range w-40 shrink-0" />
                <input name="commuteMinutes" inputMode="numeric" className="input w-20 md:w-24 shrink-0" value={commuteMinutes ?? ""} onChange={(e) => setCommuteMinutes(num(e.target.value))} />
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col">
              <label className="mb-1 text-sm font-medium">Transit needs</label>
              <select name="transitNeeds" className="input">
                <option value="">Select…</option>
                <option>Walkability priority</option>
                <option>Near subway or rail</option>
                <option>Easy highway access</option>
                <option>Dedicated parking required</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col">
              <label className="mb-1 text-sm font-medium">School needs</label>
              <select name="schoolNeeds" className="input">
                <option value="">Select…</option>
                <option>Specific boundary required</option>
                <option>High rating preferred</option>
                <option>Program-specific (IB, language)</option>
                <option>Homeschool / N/A</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" checked={pets} onChange={(e) => setPets(e.target.checked)} className="checkbox" />
              Pets
            </label>
          </div>
          {pets && (
            <div className="mt-2 flex flex-col">
              <label className="mb-1 text-sm font-medium">Pet notes</label>
              <input name="petNotes" className="input" placeholder="Breed, size, restrictions" />
            </div>
          )}
        </section>

        {/* Property criteria */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Property Criteria</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 text-sm font-medium">Min beds</label>
              <select name="minBeds" className="input">
                {[0,1,2,3,4,5,6].map((b) => (
                  <option key={b} value={b}>{b === 0 ? "Studio" : b}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 text-sm font-medium">Min baths</label>
              <select name="minBaths" className="input">
                {[1,1.5,2,2.5,3,4].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 text-sm font-medium">Min sqft</label>
              <input name="minSqft" inputMode="numeric" className="input" placeholder="1100" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Parking</label>
              <select className="input" value={parking} onChange={(e) => setParking(e.target.value as any)}>
                <option value="none">None</option>
                <option value="street">Street</option>
                <option value="assigned">Assigned</option>
                <option value="garage">Garage</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" checked={outdoorSpace} onChange={(e) => setOutdoorSpace(e.target.checked)} className="checkbox" />
              Needs outdoor space
            </label>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Lot size min (sqft)</label>
              <div className="flex items-center gap-2 min-w-0">
                <input type="range" min={0} max={20_000} step={100} value={clamp(lotSizeMinSqft ?? 0, 0, 20_000)} onChange={(e) => setLotSizeMinSqft(Number(e.target.value))} className="range w-40 shrink-0" />
                <input name="lotSizeMinSqft" inputMode="numeric" className="input w-24 md:w-28 shrink-0" value={lotSizeMinSqft ?? ""} onChange={(e) => setLotSizeMinSqft(num(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-medium">Property types</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {([
                { id: "single_family", label: "Single-family" },
                { id: "townhouse", label: "Townhouse" },
                { id: "condo", label: "Condo" },
                { id: "co_op", label: "Co-op" },
                { id: "new_build", label: "New build" },
              ] as { id: PropertyType; label: string }[]).map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={propertyTypes.includes(t.id)}
                    onChange={() => handleTypesToggle(t.id)}
                    className="checkbox"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col">
            <label className="mb-1 text-sm font-medium">Layout must-haves</label>
            <textarea name="layoutMustHaves" className="textarea" rows={3} placeholder="Office, open kitchen, first-floor bed, etc." />
          </div>
        </section>

        {/* Condition & renovation */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Condition & Renovation</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" checked={willRenovate} onChange={(e) => setWillRenovate(e.target.checked)} className="checkbox" />
              Willing to renovate
            </label>
            <MoneyField label="Reno budget ($)" name="renoBudget" value={renoBudget} setValue={setRenoBudget} min={0} max={500_000} step={1_000} />
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Age tolerance</label>
              <select name="ageTolerance" className="input">
                <option value="">No preference</option>
                <option>{"< 10 years"}</option>
                <option>{"< 20 years"}</option>
                <option>{"< 50 years"}</option>
                <option>Historic OK</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-medium">Hazard concerns</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {[
                { id: "septic", label: "Septic" },
                { id: "oil_tank", label: "Oil tank" },
                { id: "lead_paint", label: "Lead paint" },
                { id: "asbestos", label: "Asbestos" },
                { id: "flood_zone", label: "Flood zone" },
              ].map((h) => (
                <label key={h.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hazardConcerns.includes(h.id)}
                    onChange={() => handleToggle(hazardConcerns, setHazardConcerns, h.id)}
                    className="checkbox"
                  />
                  {h.label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Dealbreakers & trade-offs */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Dealbreakers & Trade-offs</h2>

          {/* Must-haves */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Top must-haves (ranked)</h3>
            <button type="button" className="btn-secondary" onClick={() => setTopMustHaves([...topMustHaves, ""]) }>
              Add
            </button>
          </div>
          {topMustHaves.length > 0 && (
            <div className="mt-2 space-y-2">
              {topMustHaves.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-sm text-muted-foreground">{i + 1}.</span>
                  <input
                    className="input flex-1"
                    value={m}
                    placeholder="e.g., south-facing light"
                    onChange={(e) => {
                      const next = [...topMustHaves];
                      next[i] = e.target.value;
                      setTopMustHaves(next);
                    }}
                  />
                  <button type="button" className="btn-ghost" onClick={() => setTopMustHaves(topMustHaves.filter((_, idx) => idx !== i))}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Dealbreakers</label>
              <textarea name="dealbreakers" className="textarea" rows={3} />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">If you must compromise, what gives first?</label>
              <textarea name="tradeoffs" className="textarea" rows={3} />
            </div>
          </div>
        </section>

        {/* Touring logistics */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Touring Logistics</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={availableDays.includes(d)}
                  onChange={() => handleToggle(availableDays, setAvailableDays, d)}
                />
                {d}
              </label>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col">
              <label className="mb-1 text-sm font-medium">Time window</label>
              <select name="tourTimeWindow" className="input">
                <option>Weeknights after 6pm</option>
                <option>Weekends anytime</option>
                <option>Mornings</option>
                <option>Afternoons</option>
                <option>Flexible</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" className="checkbox" checked={virtualToursOk} onChange={(e) => setVirtualToursOk(e.target.checked)} />
              Virtual tours ok
            </label>
          </div>
          <div className="mt-4 flex flex-col">
            <label className="mb-1 text-sm font-medium">Accessibility needs</label>
            <select name="accessibilityNeeds" className="input">
              <option value="">None</option>
              <option>No stairs</option>
              <option>Elevator required</option>
              <option>Wide doorway / ADA</option>
              <option>Other</option>
            </select>
          </div>
        </section>

        {/* Offer strategy */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Offer Strategy</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" className="checkbox" checked={willingOverList} onChange={(e) => setWillingOverList(e.target.checked)} />
              Willing to bid over list
            </label>
            <PercentField label="Over-list cap (%)" name="overListCapPercent" value={overListCapPercent} setValue={setOverListCapPercent} min={0} max={50} step={0.5} />
            <MoneyField label="Earnest money ($)" name="earnestMoney" value={earnestMoney} setValue={setEarnestMoney} min={0} max={200_000} step={1_000} />
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-medium">Contingency preferences</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              {[
                { id: "inspection", label: "Inspection" },
                { id: "financing", label: "Financing" },
                { id: "appraisal", label: "Appraisal" },
                { id: "home_sale", label: "Home sale" },
                { id: "title", label: "Title" },
                { id: "other", label: "Other" },
              ].map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={contingencyPrefs.includes(c.id)}
                    onChange={() => handleToggle(contingencyPrefs, setContingencyPrefs, c.id)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                className="checkbox"
                checked={escalationClause}
                onChange={(e) => setEscalationClause(e.target.checked)}
              />
              Use escalation clause
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                className="checkbox"
                checked={appraisalGap}
                onChange={(e) => setAppraisalGap(e.target.checked)}
              />
              Will cover appraisal gap
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                className="checkbox"
                checked={needSellerCredits}
                onChange={(e) => setNeedSellerCredits(e.target.checked)}
              />
              Need seller credits
            </label>
          </div>
        </section>

        {/* Due diligence */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Due Diligence</h2>
          <div>
            <div className="mb-2 text-sm font-medium">Inspections</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              {[
                { id: "general", label: "General" },
                { id: "radon", label: "Radon" },
                { id: "sewer_scope", label: "Sewer scope" },
                { id: "termite", label: "Termite" },
                { id: "mold", label: "Mold" },
                { id: "roof", label: "Roof" },
              ].map((i) => (
                <label key={i.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={inspections.includes(i.id)}
                    onChange={() => handleToggle(inspections, setInspections, i.id)}
                  />
                  {i.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col">
            <label className="mb-1 text-sm font-medium">Insurance concerns</label>
            <select name="insuranceConcerns" className="input">
              <option value="">None</option>
              <option>High premiums in flood/brush zones</option>
              <option>Roof age limits</option>
              <option>Claims history sensitivity</option>
              <option>Other</option>
            </select>
          </div>
        </section>

        {/* Ownership & use */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Ownership & Use</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Use type</label>
              <select
                className="input"
                value={useType}
                onChange={(e) => setUseType(e.target.value as UseType)}
              >
                <option value="primary">Primary residence</option>
                <option value="second_home">Second home</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                className="checkbox"
                checked={rentalPlans}
                onChange={(e) => setRentalPlans(e.target.checked)}
              />
              Plan to rent it at any point
            </label>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Hold period (years)</label>
              <input
                name="holdPeriodYears"
                inputMode="numeric"
                className="input"
                placeholder="5"
              />
            </div>
          </div>

          {rentalPlans && (
            <div className="mt-4 flex flex-col">
              <label className="mb-1 text-sm font-medium">Rental details</label>
              <textarea
                name="rentalDetails"
                className="textarea"
                rows={3}
                placeholder="Short-term rental, long-term, house-hack, etc."
              />
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Additional Notes</h2>
          <textarea
            name="additionalNotes"
            className="textarea w-full"
            rows={4}
            placeholder="Anything else we should know?"
          />
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button type="submit" className="btn-primary">
            Save buyer intake
          </button>
        </div>
      </form>
    </div>
  );
}
