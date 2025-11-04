/**
 * API Route: Upload Sheet Data
 * POST /api/upload-sheet
 * Manually upload ticket data from SharePoint Excel (as JSON)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';

interface UploadRequest {
  tickets: Array<{
    payment_id: string;
    name: string;
    email: string;
    type: string;
  }>;
}

interface UploadResponse {
  success: boolean;
  inserted?: number;
  updated?: number;
  message?: string;
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
    const { tickets } = req.body as UploadRequest;

    if (!tickets || !Array.isArray(tickets)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: tickets array is required'
      });
    }

    const db = await getDatabase();
    const ticketsCollection = db.collection('tickets');

    let insertedCount = 0;
    let updatedCount = 0;

    // Process each ticket
    for (const ticket of tickets) {
      // Generate ticket_id from payment_id
      const ticket_id = `TKT-${ticket.payment_id}`;

      const result = await ticketsCollection.updateOne(
        { payment_id: ticket.payment_id },
        {
          $set: {
            payment_id: ticket.payment_id,
            ticket_id: ticket_id,
            name: ticket.name,
            email: ticket.email,
            ticket_type: ticket.type,
            used: false,
            created_at: new Date()
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount) {
        insertedCount++;
      } else if (result.modifiedCount) {
        updatedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      message: `Processed ${tickets.length} tickets: ${insertedCount} inserted, ${updatedCount} updated`
    });

  } catch (error: any) {
    console.error('Error uploading sheet data:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload sheet data'
    });
  }
}

