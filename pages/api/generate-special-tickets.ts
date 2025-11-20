/**
 * API Route: Generate Special Tickets
 * POST /api/generate-special-tickets
 * Generates special QR codes without sending emails
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import QRCode from 'qrcode';
import { encrypt } from '@/lib/encryption';
import fs from 'fs';
import path from 'path';

interface GenerateRequest {
  count: number;
  ticketType: string;
}

interface GenerateResponse {
  success: boolean;
  message: string;
  generated?: number;
  folderPath?: string;
  tickets?: Array<{
    payment_id: string;
    ticket_id: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    const { count, ticketType } = req.body as GenerateRequest;

    // Validation
    if (!count || count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket count. Must be between 1 and 100.'
      });
    }

    if (!ticketType) {
      return res.status(400).json({
        success: false,
        message: 'Ticket type is required'
      });
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db('ticket-scanner');
    const collection = db.collection('tickets');
    const processedCollection = db.collection('qr_processed');

    // Generate unique payment IDs
    const generatedTickets: Array<{ payment_id: string; ticket_id: string }> = [];
    const ticketsToInsert = [];
    const processedToInsert = [];

    for (let i = 0; i < count; i++) {
      let paymentId = '';
      let isUnique = false;

      // Keep generating until we find a unique payment_id
      while (!isUnique) {
        paymentId = `SPECIAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const existing = await collection.findOne({ payment_id: paymentId });
        if (!existing) {
          isUnique = true;
        }
      }

      const ticketId = new ObjectId().toString();

      generatedTickets.push({
        payment_id: paymentId,
        ticket_id: ticketId
      });

      ticketsToInsert.push({
        _id: new ObjectId(ticketId),
        payment_id: paymentId,
        ticket_id: ticketId,
        name: '***',
        email: '***',
        phone: '***',
        ticket_type: ticketType,
        price: 0,
        qr_generated: true,
        email_sent: true, // Set to true so special tickets don't show as "pending"
        used: false,
        created_at: new Date(),
        special_ticket: true
      });

      // Also add to qr_processed collection
      processedToInsert.push({
        payment_id: paymentId,
        ticket_id: ticketId,
        email: '***',
        qr_generated: true,
        email_sent: true, // Set to true so special tickets don't show as "pending"
        sent_at: new Date(),
        special_ticket: true
      });
    }

    // Insert all tickets into MongoDB
    await collection.insertMany(ticketsToInsert);
    
    // Insert into qr_processed collection
    await processedCollection.insertMany(processedToInsert);

    // Create folder for QR codes
    const sanitizedTicketType = ticketType.replace(/[^a-zA-Z0-9]/g, '_');
    const qrFolderPath = path.join(process.cwd(), 'qr-codes', sanitizedTicketType);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(qrFolderPath)) {
      fs.mkdirSync(qrFolderPath, { recursive: true });
    }

    // Generate QR codes for each ticket
    for (const ticket of generatedTickets) {
      const qrData = {
        ticket_id: ticket.ticket_id,
        payment_id: ticket.payment_id,
        name: '***',
        email: '***',
        ticket_type: ticketType,
        ts: Date.now().toString()
      };

      // Encrypt the data
      const encryptedData = encrypt(qrData);

      // Generate QR code and save to file
      const qrFilePath = path.join(qrFolderPath, `${ticket.payment_id}.png`);
      await QRCode.toFile(qrFilePath, encryptedData, {
        width: 500,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }

    await client.close();

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${count} special ticket${count > 1 ? 's' : ''}`,
      generated: count,
      folderPath: `qr-codes/${sanitizedTicketType}`,
      tickets: generatedTickets
    });

  } catch (error: any) {
    console.error('Error generating special tickets:', error);
    await client.close();
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate special tickets'
    });
  }
}

