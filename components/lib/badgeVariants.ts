import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "../ui/badge";

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export function statusToBadgeVariant(status: string | undefined | null): BadgeVariant {
  const s = String(status ?? "").toLowerCase();
  switch (s) {
    // generic lifecycle
    case "completed":
      return "softSuccess";
    case "scheduled":
      return "softInfo";
    case "pending":
      return "softWarning";
    case "cancelled":
      return "destructive";
    case "in-progress":
      return "softWarning";
    case "active":
      return "softInfo";
    case "overdue":
      return "destructive";

    // documents
    case "submitted":
      return "softSuccess";
    case "needed":
      return "destructive";

    // insurance quotes
    case "received":
      return "softSuccess";
    case "selected":
      return "softInfo";

    default:
      return "outline";
  }
}

export function severityToBadgeVariant(severity: string | undefined | null): BadgeVariant {
  const s = String(severity ?? "").toLowerCase();
  switch (s) {
    case "high":
      return "destructive";
    case "medium":
      return "softWarning";
    case "low":
      return "softSuccess";
    default:
      return "outline";
  }
}

export function issueStatusToBadgeVariant(status: string | undefined | null): BadgeVariant {
  const s = String(status ?? "").toLowerCase();
  switch (s) {
    case "identified":
      return "destructive";
    case "negotiating":
      return "softWarning";
    case "resolved":
      return "softSuccess";
    case "accepted":
      return "softInfo";
    default:
      return "outline";
  }
}

export function priorityToOutlineVariant(priority: string | undefined | null): BadgeVariant {
  const p = String(priority ?? "").toLowerCase();
  switch (p) {
    case "high":
      return "outlineWarning";
    case "medium":
      return "outlineInfo";
    default:
      return "outlineSuccess";
  }
}

export function lenderTypeToOutlineVariant(type: string | undefined | null): BadgeVariant {
  const t = String(type ?? "").toLowerCase();
  switch (t) {
    case "bank":
      return "outlineInfo";
    case "credit-union":
      return "outlineSuccess";
    case "online":
      return "outlineWarning";
    case "broker":
      return "outline";
    default:
      return "outline";
  }
}

