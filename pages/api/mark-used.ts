/**
 * API Route: Mark Ticket as Used
 * POST /api/mark-used
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { MarkUsedResponse, TicketRecord } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarkUsedResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { payment_id } = req.body;

    if (!payment_id || typeof payment_id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid payment_id'
      });
    }

    // Connect to database
    const db = await getDatabase();
    const ticketsCollection = db.collection<TicketRecord>('tickets');

    // Find the ticket
    const ticket = await ticketsCollection.findOne({ payment_id });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if already marked as used
    if (ticket.used) {
      return res.status(400).json({
        success: false,
        message: 'Ticket already marked as used'
      });
    }

    // Mark ticket as used
    const result = await ticketsCollection.updateOne(
      { payment_id },
      {
        $set: {
          used: true,
          used_at: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update ticket'
      });
    }

    // Fetch updated ticket
    const updatedTicket = await ticketsCollection.findOne({ payment_id });

    return res.status(200).json({
      success: true,
      message: 'Entry marked successfully',
      ticket: updatedTicket || undefined
    });

  } catch (error) {
    console.error('Error marking ticket as used:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

