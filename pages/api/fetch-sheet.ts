/**
 * API Route: Fetch Sheet Data
 * GET /api/fetch-sheet
 * Fetches data from SharePoint Excel and merges with MongoDB status
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';

interface SheetRow {
  payment_id: string;
  name: string;
  email: string;
  type: string;
  qr_generated: boolean;
  email_sent: boolean;
}

interface FetchResponse {
  success: boolean;
  data?: SheetRow[];
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FetchResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // SharePoint public Excel URL (convert to CSV export)
    const sharePointUrl = 'https://ruskmedia-my.sharepoint.com/:x:/p/umar/EURWPUctLWJPtAhimMft9JIBtAEkG3k9e6Gmv8hKWfktZQ?e=JT9UZC';
    
    // For now, we'll fetch from MongoDB tickets collection
    // In production, you'd fetch from SharePoint or upload CSV
    const db = await getDatabase();
    const ticketsCollection = db.collection('tickets');
    const processedCollection = db.collection('qr_processed');

    // Get all tickets from database
    const tickets = await ticketsCollection.find({}).toArray();

    // Get processed status from tracking collection
    const processedRecords = await processedCollection.find({}).toArray();
    const processedMap = new Map(
      processedRecords.map(r => [r.payment_id, r])
    );

    // Combine data
    const data: SheetRow[] = tickets.map(ticket => {
      const processed = processedMap.get(ticket.payment_id);
      return {
        payment_id: ticket.payment_id,
        name: ticket.name,
        email: ticket.email,
        type: ticket.ticket_type || 'Standard',
        qr_generated: processed?.qr_generated || false,
        email_sent: processed?.email_sent || false
      };
    });

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sheet data'
    });
  }
}

