/**
 * API Route: Verify QR Code
 * POST /api/verify-qr
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { decrypt, isValidPayload } from '@/lib/encryption';
import { VerifyResponse, TicketRecord } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      status: 'error',
      message: 'Method not allowed'
    });
  }

  try {
    const { encryptedData } = req.body;

    if (!encryptedData || typeof encryptedData !== 'string') {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Missing or invalid encrypted data'
      });
    }

    // Decrypt the QR code data
    let payload;
    try {
      payload = decrypt(encryptedData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        message: 'Invalid QR code - decryption failed'
      });
    }

    // Validate payload structure
    if (!isValidPayload(payload)) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        message: 'Invalid QR code format'
      });
    }

    // Connect to database
    const db = await getDatabase();
    const ticketsCollection = db.collection<TicketRecord>('tickets');

    // Search by ticket_id (from the decrypted QR code)
    const ticket = await ticketsCollection.findOne({
      ticket_id: payload.ticket_id
    });

    // Check if ticket exists
    if (!ticket) {
      return res.status(404).json({
        success: false,
        status: 'invalid',
        message: 'Ticket not found in database - Invalid ticket'
      });
    }

    // Verify email matches
    if (ticket.email !== payload.email) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        message: 'Ticket data mismatch - Invalid ticket'
      });
    }

    // Check if ticket has already been used
    if (ticket.used) {
      return res.status(200).json({
        success: true,
        status: 'used',
        message: 'This ticket has already been used',
        ticket: ticket
      });
    }

    // Valid ticket - not yet used
    return res.status(200).json({
      success: true,
      status: 'valid',
      message: 'Valid ticket - Entry allowed',
      ticket: ticket
    });

  } catch (error) {
    console.error('Error verifying QR code:', error);
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Internal server error'
    });
  }
}

