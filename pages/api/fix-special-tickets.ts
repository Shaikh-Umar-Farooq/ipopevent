/**
 * API Route: Fix Existing Special Tickets
 * POST /api/fix-special-tickets
 * Updates all existing special tickets to mark email_sent as true
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

interface FixResponse {
  success: boolean;
  message: string;
  ticketsUpdated?: number;
  processedUpdated?: number;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FixResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('ticket-scanner');
    const ticketsCollection = db.collection('tickets');
    const processedCollection = db.collection('qr_processed');

    // Query to find special tickets with email_sent: false
    const specialTicketsQuery = {
      $or: [
        { special_ticket: true },
        { email: '***' },
        { payment_id: { $regex: /^SPECIAL-/ } }
      ],
      email_sent: false
    };

    // Count tickets to update
    const ticketsCount = await ticketsCollection.countDocuments(specialTicketsQuery);
    const processedCount = await processedCollection.countDocuments(specialTicketsQuery);

    console.log(`Found ${ticketsCount} tickets and ${processedCount} processed records to update`);

    // Update tickets collection
    const ticketsResult = await ticketsCollection.updateMany(
      specialTicketsQuery,
      { 
        $set: { 
          email_sent: true,
          updated_at: new Date()
        } 
      }
    );

    // Update qr_processed collection
    const processedResult = await processedCollection.updateMany(
      specialTicketsQuery,
      { 
        $set: { 
          email_sent: true,
          sent_at: new Date()
        } 
      }
    );

    await client.close();

    return res.status(200).json({
      success: true,
      message: `Successfully updated special tickets`,
      ticketsUpdated: ticketsResult.modifiedCount,
      processedUpdated: processedResult.modifiedCount,
      details: `Updated ${ticketsResult.modifiedCount} in tickets collection and ${processedResult.modifiedCount} in qr_processed collection`
    });

  } catch (error: any) {
    console.error('Error fixing special tickets:', error);
    await client.close();
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update special tickets'
    });
  }
}

