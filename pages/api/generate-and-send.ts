/**
 * API Route: Generate QR Codes and Send Emails
 * POST /api/generate-and-send
 * Generates QR codes and sends them via email to pending entries
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { encrypt } from '@/lib/encryption';
import { sendEmailViaGraph } from '@/lib/microsoft-graph';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

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

                // Get lineup image
                const lineupImageDataURL = getLineupImageBase64();
                const lineupImageBase64 = lineupImageDataURL ? lineupImageDataURL.split(',')[1] : undefined;

                // Send email via Microsoft Graph API with both QR and lineup as CID attachments
                await sendEmailViaGraph(
                    ticket.email,
                    ` Booking Confirmation for i-Popstar Live: Your ticket for ${ticket.ticket_type || 'Event'} `,
                    generateEmailHTML(ticket),
                    qrCodeBase64,
                    `ticket-${ticket.payment_id}.png`,
                    lineupImageBase64,
                    'lineup.jpg'
                );

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
 * Get lineup image as base64 data URL
 */
function getLineupImageBase64(): string {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'lineup-optimized.jpg');
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Lineup image not found at:', imagePath);
      return '';
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    const fileSizeKB = (imageBuffer.length / 1024).toFixed(2);
    console.log(`✅ Lineup image loaded: ${fileSizeKB} KB`);
    
    const base64Image = imageBuffer.toString('base64');
    
    if (imageBuffer.length > 500000) { // > 500KB
      console.warn('⚠️ Lineup image is large (>500KB), may affect email delivery');
    }
    
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('❌ Error reading lineup image:', error);
    return ''; // Return empty if error
  }
}

/**
 * Get just the base64 string without data URL prefix
 */
function getLineupImageBase64Only(): string {
  const dataURL = getLineupImageBase64();
  return dataURL ? dataURL.split(',')[1] : '';
}

/**
 * Generate HTML email template
 * Uses CID (Content-ID) references for images instead of base64 data URLs
 * This works better with Gmail
 */
function generateEmailHTML(ticket: any): string {
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
      background: #0075FF; 
      color: white; 
      padding: 24px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    /* --- NEW RIBBON STYLE --- */
    .ticket-type-ribbon {
      display: inline-block;
      margin: 24px auto 20px auto; /* Comfortable Spacing */
      padding: 10px 20px;
      font-size: 16px;
      font-weight: 600;
      color: #0075FF;
      border: 2px solid #0075FF;
      background: white;
      border-radius: 6px;
      position: relative;
    }

    .content { padding: 20px 24px; }

    .info-table {
      width: 100%;
      margin: 10px 0;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 8px 0;
      font-size: 15px;
    }
    .label { color: #666; }
    .value { font-weight: 600; color: #000; text-align: right; }

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
      color: #000;
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
      text-align: center;
    }
    .venue-link {
      display: inline-flex;
      align-items: center;
      color: #0075FF;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 12px;
      background: white;
      border: 1px solid #0075FF;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .venue-link:hover {
      background: #E8F2FF;
    }
    .venue-link svg { margin-right: 6px; }

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

    /* --- NEW BLUE SOFT INFO CARD --- */
    .info-box { 
      background: #EAF3FF; 
      border-left: 4px solid #0075FF;
      padding: 16px; 
      border-radius: 8px; 
      margin: 24px 0;
      font-size: 14px;
      color: #003B80;
    }
    .info-box strong {
      display: block;
      margin-bottom: 6px;
      color: #0056C7;
      font-weight: 600;
    }
    .info-box ul { margin: 6px 0 0 0; padding-left: 18px; }
    .info-box li { margin: 4px 0; }

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

      <!-- NEW RIBBON -->
      <div style="text-align:center;">
        <div class="ticket-type-ribbon">
          ${ticket.ticket_type || 'Standard'}
        </div>
      </div>

      <table class="info-table" role="presentation">
        <tr>
          <td class="label">Name</td>
          <td class="value">${ticket.name}</td>
        </tr>
        <tr>
          <td class="label">Email</td>
          <td class="value">${ticket.email}</td>
        </tr>
        <tr>
          <td class="label">Amount Paid</td>
          <td class="value">₹${ticket.price || '0'}</td>
        </tr>
      </table>

      <div class="event-details">
        <div class="date">
          ${ticket.ticket_type && String(ticket.ticket_type).toLowerCase().trim().includes('day 1') ? '22 November 2025' : '23 November 2025'}
        </div>
        <div class="time">7:30 PM onwards</div>
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
        <img src="cid:qrcode" alt="Ticket QR Code" class="qr-code" />
        <p style="margin-top: 12px; font-size: 14px; color: #666;">Scan at venue entrance</p>
      </div>
      
      <div class="info-box">
        <strong>Important</strong>
        <ul>
          <li>Do not share this QR code with anyone</li>
          <li>Valid for one-time use only</li>
          <li>Arrive 30 minutes before the event for smooth entry</li>
        </ul>
      </div>

    </div>
    
    <div style="text-align: center; padding: 20px 24px 10px 24px;">
      <img src="cid:lineup" alt="Event Lineup" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>

  `;
}

