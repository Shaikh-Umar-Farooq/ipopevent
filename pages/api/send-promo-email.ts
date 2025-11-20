/**
 * API Route: Send Promotional Email
 * POST /api/send-promo-email
 * Sends promotional emails with embedded image to multiple recipients
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmailViaGraph } from '@/lib/microsoft-graph';
import fs from 'fs';
import path from 'path';

interface SendPromoRequest {
  emails: string[];
}

interface SendPromoResponse {
  success: boolean;
  message: string;
  sent?: number;
  failed?: number;
  total?: number;
  errors?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendPromoResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { emails } = req.body as SendPromoRequest;

    // Validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one email address'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(e => !emailRegex.test(e));
    
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid email addresses: ${invalidEmails.join(', ')}`
      });
    }

    // Load promotional image
    const promoImagePath = path.join(process.cwd(), 'scripts', 'Emailer.jpg');
    
    if (!fs.existsSync(promoImagePath)) {
      return res.status(500).json({
        success: false,
        message: 'Promotional image not found'
      });
    }

    const imageBuffer = fs.readFileSync(promoImagePath);
    const promoImageBase64 = imageBuffer.toString('base64');
    
    console.log(`📧 Promotional image loaded: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

    // Generate email HTML with embedded image
    const emailHTML = generatePromoEmailHTML();

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send emails one by one
    for (const email of emails) {
      try {
        console.log(`📧 Sending promo email to ${email}...`);
        
        await sendEmailViaGraph(
          email,
          'i-Popstar Live - Special Announcement',
          emailHTML,
          undefined, // No QR code
          undefined, // No QR filename
          promoImageBase64,
          'promo.jpg'
        );

        sentCount++;
        console.log(`✅ Sent to ${email}`);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err: any) {
        failedCount++;
        const errorMsg = `${email}: ${err.message || 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ Failed to send to ${email}:`, err.message);
      }
    }

    console.log(`\n📊 Summary: ${sentCount} sent, ${failedCount} failed out of ${emails.length} total`);

    return res.status(200).json({
      success: true,
      message: failedCount > 0 
        ? `Sent to ${sentCount} recipients. ${failedCount} failed.`
        : `Successfully sent to all ${sentCount} recipients`,
      sent: sentCount,
      failed: failedCount,
      total: emails.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error sending promotional emails:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send promotional emails'
    });
  }
}

/**
 * Generate promotional email HTML with embedded image
 */
function generatePromoEmailHTML(): string {
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
      padding: 0;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
    }
    .promo-image {
      width: 100%;
      max-width: 600px;
      height: auto;
      display: block;
      margin: 0;
      padding: 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background: #f9f9f9;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Promotional Image (embedded using CID) -->
    <img src="cid:lineup" alt="i-Popstar Live" class="promo-image" />
    
    <!-- Footer -->
    <div class="footer">
      <p style="margin-top: 10px; color: #999;">
        © 2025 i-Popstar Live. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

