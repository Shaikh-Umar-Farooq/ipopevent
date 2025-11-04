/**
 * TypeScript type definitions
 */

export interface TicketPayload {
  ticket_id: string;
  email: string;
  ts: string;
}

export interface TicketRecord {
  _id?: string;
  payment_id: string;
  ticket_id: string;
  email: string;
  name: string;
  phone?: string;
  event_name?: string;
  event_date?: string;
  ticket_type?: string;
  price?: number;
  used: boolean;
  created_at: Date;
  used_at?: Date;
  scanned_by?: string;
}

export interface VerifyResponse {
  success: boolean;
  status: 'valid' | 'used' | 'invalid' | 'error';
  message: string;
  ticket?: TicketRecord;
}

export interface MarkUsedResponse {
  success: boolean;
  message: string;
  ticket?: TicketRecord;
}

