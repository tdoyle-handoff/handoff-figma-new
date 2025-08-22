import React from "react";
import { cn } from "./utils";

export type KpiTone = "maroon" | "gold" | "sand" | "taupe";

interface KpiProps {
  title: string;
  value: string | number;
  tone?: KpiTone;
  className?: string;
  children?: React.ReactNode;
}

const toneClasses: Record<KpiTone, string> = {
  maroon: "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
  gold: "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]",
  sand: "bg-[#C9B68A] text-[#2B2321]",
  taupe: "bg-[#D1C48B] text-[#2B2321]",
};

export function KpiTile({ title, value, tone = "maroon", className, children }: KpiProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 shadow-soft border",
        toneClasses[tone],
        className,
      )}
    >
      <div className="text-xs/none opacity-90 font-medium">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {children ? <div className="mt-2 text-xs opacity-80">{children}</div> : null}
    </div>
  );
}

