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
