// ---------------------------------------------------------------------------
// Lead
// ---------------------------------------------------------------------------

export type LeadSource =
  | "google_ads"
  | "yandex_direct"
  | "meta_ads"
  | "vk_ads"
  | "tiktok_ads"
  | "seo"
  | "referral"
  | "offline"
  | "direct";

export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "trial_booked",
  "attended",
  "won",
  "lost",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

const leadStageSet = new Set<string>(LEAD_STAGES);
export function isLeadStage(value: string): value is LeadStage {
  return leadStageSet.has(value);
}

// ---------------------------------------------------------------------------
// Deal
// ---------------------------------------------------------------------------

/** @deprecated Use CrmDealStage */
export type DealStage =
  | "new"
  | "contacted"
  | "qualified"
  | "trial_booked"
  | "attended"
  | "won"
  | "lost";

export const CRM_DEAL_STAGES = [
  "diagnostics",
  "planned",
  "in_progress",
  "ready",
  "closed",
  "cancelled",
] as const;

export const CRM_VISIBLE_DEAL_STAGES = ["diagnostics", "planned", "in_progress"] as const;

export const CRM_EDITABLE_DEAL_STAGES = ["diagnostics", "planned", "in_progress", "closed", "cancelled"] as const;

export type CrmDealStage = (typeof CRM_DEAL_STAGES)[number];
export type CrmVisibleDealStage = (typeof CRM_VISIBLE_DEAL_STAGES)[number];
export type CrmEditableDealStage = (typeof CRM_EDITABLE_DEAL_STAGES)[number];

const crmVisibleDealStageSet = new Set<string>(CRM_VISIBLE_DEAL_STAGES);
const crmEditableDealStageSet = new Set<string>(CRM_EDITABLE_DEAL_STAGES);

export function isCrmVisibleDealStage(value: string): value is CrmVisibleDealStage {
  return crmVisibleDealStageSet.has(value);
}

export function mapCrmStageToVisible(stage?: string): CrmVisibleDealStage | null {
  if (!stage) return null;
  if (stage === "ready") return "in_progress";
  return isCrmVisibleDealStage(stage) ? stage : null;
}

export function normalizeCrmEditableStage(stage?: string): CrmEditableDealStage {
  if (!stage) return "diagnostics";
  if (stage === "ready") return "in_progress";
  return crmEditableDealStageSet.has(stage) ? (stage as CrmEditableDealStage) : "diagnostics";
}

// ---------------------------------------------------------------------------
// Enrolment / Education
// ---------------------------------------------------------------------------

export const ENROLLMENT_STATUSES = [
  "pending",
  "active",
  "paused",
  "completed",
  "canceled",
] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const COHORT_STATUSES = [
  "draft",
  "planned",
  "active",
  "completed",
  "archived",
] as const;

export type CohortStatus = (typeof COHORT_STATUSES)[number];

export const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Billing / Payments
// ---------------------------------------------------------------------------

export const INVOICE_STATUSES = [
  "draft",
  "pending",
  "paid",
  "overdue",
  "canceled",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "canceled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ---------------------------------------------------------------------------
// Common API helpers
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
