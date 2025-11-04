/**
 * API Route: Generate QR Codes and Send Emails
 * POST /api/generate-and-send
 * Generates QR codes and sends them via email to pending entries
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { encrypt } from '@/lib/encryption';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

interface GenerateResponse {
  success: boolean;
  processed?: number;
  message?: string;
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

  try {
    const db = await getDatabase();
    const ticketsCollection = db.collection('tickets');
    const processedCollection = db.collection('qr_processed');

    // Get all tickets
    const tickets = await ticketsCollection.find({}).toArray();

    // Get already processed payment_ids
    const processedRecords = await processedCollection.find({}).toArray();
    const processedIds = new Set(
      processedRecords
        .filter((r: any) => r.qr_generated && r.email_sent)
        .map((r: any) => r.payment_id)
    );

    // Filter pending entries
    const pendingTickets = tickets.filter(
      (ticket: any) => !processedIds.has(ticket.payment_id)
    );

    if (pendingTickets.length === 0) {
      return res.status(200).json({
        success: true,
        processed: 0,
        message: 'No pending entries to process'
      });
    }

    // Configure email transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.APP_PASSWORD 
      }
    });

    let processedCount = 0;

    // Process each pending ticket
    for (const ticket of pendingTickets as any[]) {
      try {
        // Generate QR code payload
        const payload = {
          ticket_id: ticket.ticket_id,
          email: ticket.email,
          ts: Date.now().toString()
        };

        // Encrypt payload
        const encryptedData = encrypt(payload);

        // Generate QR code as base64 data URL
        const qrCodeDataURL = await QRCode.toDataURL(encryptedData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 400,
          margin: 2
        });

        // Extract base64 string (remove data:image/png;base64, prefix)
        const qrCodeBase64 = qrCodeDataURL.split(',')[1];

        // Send email
        await transporter.sendMail({
          from: `"iPOP Event" <${process.env.EMAIL_ADDRESS || 'smuf7080@gmail.com'}>`,
          to: ticket.email,
          subject: `Your ${ticket.ticket_type || 'Event'} Ticket QR Code`,
          html: generateEmailHTML(ticket, qrCodeDataURL),
          attachments: [
            {
              filename: `ticket-${ticket.payment_id}.png`,
              content: qrCodeBase64,
              encoding: 'base64',
              cid: 'qrcode@ticket'
            }
          ]
        });

        // Mark as processed in database
        await processedCollection.updateOne(
          { payment_id: ticket.payment_id },
          {
            $set: {
              payment_id: ticket.payment_id,
              ticket_id: ticket.ticket_id,
              email: ticket.email,
              qr_generated: true,
              email_sent: true,
              sent_at: new Date()
            }
          },
          { upsert: true }
        );

        processedCount++;
        console.log(`✅ Sent QR code to ${ticket.email} (${ticket.payment_id})`);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err: any) {
        console.error(`❌ Failed to process ${ticket.payment_id}:`, err.message);
        // Continue with next ticket even if one fails
      }
    }

    return res.status(200).json({
      success: true,
      processed: processedCount,
      message: `Successfully processed ${processedCount} out of ${pendingTickets.length} entries`
    });

  } catch (error: any) {
    console.error('Error generating and sending:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate and send QR codes'
    });
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(ticket: any, qrCodeDataURL: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .ticket-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea; }
    .qr-container { text-align: center; margin: 30px 0; }
    .qr-code { max-width: 300px; border: 10px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 10px; }
    .ticket-type { display: inline-block; background: #667eea; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    .info-row { margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎫 Your Event Ticket</h1>
      <p>Get ready for an amazing experience!</p>
    </div>
    
    <div class="content">
      <p>Hi <strong>${ticket.name}</strong>,</p>
      
      <p>Thank you for your purchase! Your ticket is ready.</p>
      
      <div class="ticket-info">
        <div class="info-row">
          <span class="label">Ticket Type:</span>
          <span class="ticket-type">${ticket.ticket_type || 'Standard'}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Name:</span> ${ticket.name}
        </div>
        
        <div class="info-row">
          <span class="label">Email:</span> ${ticket.email}
        </div>
        
        <div class="info-row">
          <span class="label">Payment ID:</span> ${ticket.payment_id}
        </div>
        
        ${ticket.event_name ? `
        <div class="info-row">
          <span class="label">Event:</span> ${ticket.event_name}
        </div>
        ` : ''}
        
        ${ticket.event_date ? `
        <div class="info-row">
          <span class="label">Date:</span> ${ticket.event_date}
        </div>
        ` : ''}
      </div>
      
      <div class="qr-container">
        <h2>Your QR Code</h2>
        <p>Show this QR code at the entrance</p>
        <img src="${qrCodeDataURL}" alt="Your Ticket QR Code" class="qr-code" />
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>⚠️ Important:</strong>
        <ul>
          <li>Save this QR code on your phone or print it</li>
          <li>This QR code is unique and can only be used once</li>
          <li>Arrive at least 30 minutes before the event starts</li>
        </ul>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">
        <strong>See you at the event! 🎉</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>If you have any questions, contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `;
}

