import { DealStage, LeadStage } from "@prisma/client";

export interface CreateLeadDto {
  name: string;
  phone?: string;
  email?: string;
  source: string;
  stage?: LeadStage;
  utm?: Record<string, string | undefined>;
}

export interface CreateDealDto {
  leadId: string;
  title: string;
  stage?: DealStage;
  amount: number;
}

export interface CreateBookingDto {
  leadId: string;
  specialist: string;
  scheduledAt: string;
  status: string;
}

export interface CreateCampaignDto {
  name: string;
  source: string;
  spend: number;
  leads: number;
}
