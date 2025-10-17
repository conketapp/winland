export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  VIEWING = 'VIEWING',
  NEGOTIATING = 'NEGOTIATING',
  CLOSED = 'CLOSED',
  LOST = 'LOST',
}

export enum LeadSource {
  MANUAL = 'MANUAL',
  WEBSITE_FORM = 'WEBSITE_FORM',
  REFERRAL = 'REFERRAL',
  CALL = 'CALL',
}

export interface Lead {
  id: string;
  propertyId: string;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDto {
  propertyId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  source?: LeadSource;
  notes?: string;
}

export interface UpdateLeadDto {
  status?: LeadStatus;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

