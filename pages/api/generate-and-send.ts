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
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1a1a1a; 
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container { 
      max-width: 500px; 
      margin: 0 auto; 
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header { 
      background: #000; 
      color: white; 
      padding: 24px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content { 
      padding: 32px 24px; 
    }
    .thank-you {
      text-align: center;
      margin-bottom: 24px;
    }
    .thank-you h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #000;
    }
    .thank-you p {
      margin: 0;
      color: #666;
      font-size: 15px;
    }
    .ticket-info { 
      margin: 24px 0;
      padding: 20px 0;
      border-top: 1px solid #e5e5e5;
      border-bottom: 1px solid #e5e5e5;
    }
    .info-row { 
      display: flex;
      justify-content: space-between;
      margin: 12px 0;
      font-size: 15px;
    }
    .label { 
      color: #666;
    }
    .value {
      font-weight: 600;
      color: #000;
      text-align: right;
    }
    .ticket-type {
      background: #000;
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 14px;
      display: inline-block;
    }
    .event-details {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .event-details .date {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
      text-align: center;
    }
    .event-details .time {
      color: #666;
      font-size: 14px;
      text-align: center;
      margin-bottom: 16px;
    }
    .venue {
      border-top: 1px solid #e5e5e5;
      padding-top: 16px;
      margin-top: 16px;
      display:flex;
      justify-content:center;
      align-content:flex-end;
    }
    .venue-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .venue-link {
      display: inline-flex;
      align-items: center;
      color: #000;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 12px;
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .venue-link:hover {
      background: #f5f5f5;
      border-color: #000;
    }
    .venue-link svg {
      margin-right: 6px;
    }
    .qr-container { 
      text-align: center; 
      margin: 32px 0; 
    }
    .qr-code { 
      max-width: 200px; 
      width: 100%;
      border: 8px solid #f5f5f5;
      border-radius: 8px;
    }
    .warning { 
      background: #fff8e1; 
      border-left: 3px solid #ffa726;
      padding: 16px; 
      border-radius: 4px; 
      margin: 24px 0;
      font-size: 14px;
    }
    .warning strong {
      display: block;
      margin-bottom: 8px;
      color: #f57c00;
    }
    .warning ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }
    .warning li {
      margin: 4px 0;
      color: #666;
    }
    .footer { 
      text-align: center; 
      padding: 20px;
      font-size: 12px; 
      color: #999;
      border-top: 1px solid #e5e5e5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>I-Popstar Live - Ticket</h1>
    </div>
    
    <div class="content">
      <div class="thank-you">
        <h2>Thank You for Your Purchase! 🎉</h2>
        <p>We're excited to see you at the event</p>
      </div>

      <div class="ticket-info">
        <div class="info-row">
          <span class="label">Ticket Type</span>
          <span class="value"><span class="ticket-type">${ticket.ticket_type || 'Standard'}</span></span>
        </div>
        
        <div class="info-row">
          <span class="label">Name</span>
          <span class="value">${ticket.name}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Email</span>
          <span class="value">${ticket.email}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Amount Paid</span>
          <span class="value">₹${ticket.price || '0'}</span>
        </div>
      </div>

      <div class="event-details">
        <div class="date">${ticket.ticket_type && String(ticket.ticket_type).toLowerCase().trim().includes('day 1') ? '22 November 2025' : '23 November 2025'}</div>
        <div class="time">${ticket.ticket_type && String(ticket.ticket_type).toLowerCase().trim().includes('day 1') ? '5:00 PM onwards' : '4:00 PM onwards'}</div>q
        
        <div class="venue">
          <a href="https://maps.app.goo.gl/VRVtgiKmCHmyr1LZ6" class="venue-link" target="_blank">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            View Location on Map
          </a>
        </div>
      </div>
      
      <div class="qr-container">
        <img src="${qrCodeDataURL}" alt="Ticket QR Code" class="qr-code" />
        <p style="margin-top: 12px; font-size: 14px; color: #666;">Scan at venue entrance</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important</strong>
        <ul>
          <li>Don't share this QR code with anyone</li>
          <li>One-time use only</li>
          <li>Arrive 30 minutes before event time</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
}

