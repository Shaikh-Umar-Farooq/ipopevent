/**
 * API Route: Upload Raw Payment Data
 * POST /api/upload-raw-data
 * Processes raw payment data and inserts tickets into database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';

interface ProcessedTicket {
  ticket_id: string;
  payment_id: string;
  name: string;
  email: string;
  phone: string;
  ticket_type: string;
  price: number;
  raw_data: any;
}

interface UploadResponse {
  success: boolean;
  inserted?: number;
  skipped?: number;
  message?: string;
  details?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { tickets } = req.body as { tickets: ProcessedTicket[] };

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or empty ticket data'
      });
    }

    const db = await getDatabase();
    const ticketsCollection = db.collection('tickets');

    let insertedCount = 0;
    let skippedCount = 0;
    const details: string[] = [];

    // Process each ticket
    for (const ticket of tickets) {
      try {
        // Check if ticket already exists (by payment_id or ticket_id)
        const existing = await ticketsCollection.findOne({
          $or: [
            { payment_id: ticket.payment_id },
            { ticket_id: ticket.ticket_id }
          ]
        });

        if (existing) {
          skippedCount++;
          details.push(`Skipped ${ticket.payment_id} (already exists)`);
          continue;
        }

        // Prepare ticket document
        const ticketDoc = {
          ticket_id: ticket.ticket_id,
          payment_id: ticket.payment_id,
          name: ticket.name,
          email: ticket.email,
          phone: ticket.phone,
          ticket_type: ticket.ticket_type,
          price: ticket.price,
          event_name: ticket.raw_data.payment_page_title || 'Event',
          event_date: ticket.raw_data.payment_date || new Date().toISOString().split('T')[0],
          payment_status: ticket.raw_data.payment_status || 'completed',
          currency: ticket.raw_data.currency || 'INR',
          used: false,
          created_at: new Date(),
          raw_payment_data: ticket.raw_data // Store original data for reference
        };

        // Insert into database
        await ticketsCollection.insertOne(ticketDoc);
        insertedCount++;
        details.push(`Inserted ${ticket.payment_id}`);

      } catch (err: any) {
        skippedCount++;
        details.push(`Error with ${ticket.payment_id}: ${err.message}`);
        console.error(`Error inserting ticket ${ticket.payment_id}:`, err);
      }
    }

    return res.status(200).json({
      success: true,
      inserted: insertedCount,
      skipped: skippedCount,
      message: `Successfully inserted ${insertedCount} tickets${skippedCount > 0 ? `, skipped ${skippedCount}` : ''}`,
      details
    });

  } catch (error: any) {
    console.error('Error uploading raw data:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload data'
    });
  }
}

