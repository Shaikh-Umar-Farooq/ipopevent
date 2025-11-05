/**
 * Test Microsoft Graph API Email Configuration
 * Run: node scripts/test-email.js
 * 
 * Tests if Microsoft Graph API is configured correctly
 * Sends a test email with the actual production ticket template
 * including the lineup image and all styling
 * 
 * Make sure to: npm install
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

/**
 * Get lineup image as base64 data URL
 */
function getLineupImageBase64() {
  try {
    const imagePath = path.join(__dirname, '..', 'public', 'lineup-optimized.jpg');
    console.log('📷 Loading lineup image from:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image file not found at:', imagePath);
      return '';
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    const fileSizeKB = (imageBuffer.length / 1024).toFixed(2);
    console.log(`✅ Image loaded: ${fileSizeKB} KB`);
    
    const base64Image = imageBuffer.toString('base64');
    const base64SizeKB = (base64Image.length / 1024).toFixed(2);
    console.log(`📊 Base64 size: ${base64SizeKB} KB`);
    
    if (imageBuffer.length > 500000) { // > 500KB
      console.log('⚠️  Warning: Image is large (>500KB), may cause email delivery issues');
      console.log('   Consider compressing the image for better email compatibility');
    }
    
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('❌ Error loading lineup image:', error.message);
    return ''; // Return empty string if image not found
  }
}

/**
 * Generate actual ticket email template (same as production)
 * Uses CID references for images (works better with Gmail)
 */
function generateTicketEmailHTML(testRecipient, fromEmail) {
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

    .ticket-type-ribbon {
      display: inline-block;
      margin: 24px auto 20px auto;
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

      <div style="text-align:center;">
        <div class="ticket-type-ribbon">
          VIP Day 1 - TEST TICKET
        </div>
      </div>

      <table class="info-table" role="presentation">
        <tr>
          <td class="label">Name</td>
          <td class="value">Test User</td>
        </tr>
        <tr>
          <td class="label">Email</td>
          <td class="value">${testRecipient}</td>
        </tr>
        <tr>
          <td class="label">Amount Paid</td>
          <td class="value">₹1499</td>
        </tr>
      </table>

      <div class="event-details">
        <div class="date">
          22 November 2025
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
      <p style="margin-top: 10px; color: #0075FF; font-weight: 600;">✅ TEST EMAIL - Sent from ${fromEmail}</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function testEmail() {
  console.log('📧 Testing Microsoft Graph API email configuration...\n');

  const TENANT_ID = process.env.AZURE_TENANT_ID;
  const CLIENT_ID = process.env.AZURE_CLIENT_ID;
  const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'ticketing@ruskmedia.com';

  // Check environment variables
  console.log('Configuration Check:');
  console.log('─────────────────────────────────────────');
  console.log('Tenant ID:     ', TENANT_ID ? `✓ ${TENANT_ID.substring(0, 8)}...` : '✗ Not set');
  console.log('Client ID:     ', CLIENT_ID ? `✓ ${CLIENT_ID.substring(0, 8)}...` : '✗ Not set');
  console.log('Client Secret: ', CLIENT_SECRET ? '✓ Set (hidden)' : '✗ Not set');
  console.log('From Email:    ', FROM_EMAIL ? `✓ ${FROM_EMAIL}` : '✗ Not set');
  console.log('');

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing required environment variables!\n');
    console.log('⚠️  Please add to .env.local:');
    console.log('   AZURE_TENANT_ID=your-tenant-id');
    console.log('   AZURE_CLIENT_ID=your-client-id');
    console.log('   AZURE_CLIENT_SECRET=your-client-secret');
    console.log('   FROM_EMAIL=ticketing@ruskmedia.com');
    console.log('\n📝 Get these values from: Azure Portal → App registrations → Your app');
    return;
  }

  try {
    // Create credential
    console.log('🔐 Authenticating with Azure AD...');
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);

    // Get access token to verify authentication
    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
    console.log('✅ Authentication successful!\n');

    // Create Graph client
    console.log('🔌 Initializing Microsoft Graph client...');
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          return tokenResponse.token;
        }
      }
    });
    console.log('✅ Graph client initialized!\n');

    // Prompt for test recipient email
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const testRecipient = await new Promise((resolve) => {
      rl.question('📬 Enter test recipient email (or press Enter to skip): ', (answer) => {
        rl.close();
        resolve(answer.trim() || null);
      });
    });

    if (!testRecipient) {
      console.log('\n⏭️  Skipping test email send.');
      console.log('✅ Configuration verified successfully!');
      console.log('\n🎉 Microsoft Graph API is ready to use!');
      return;
    }

    // Send test email with actual ticket template
    console.log('\n📤 Sending test email to:', testRecipient);
    console.log('📋 Using production ticket email template with CID attachments...\n');
    
    // Get lineup image
    const lineupDataURL = getLineupImageBase64();
    const lineupBase64 = lineupDataURL ? lineupDataURL.split(',')[1] : null;
    
    // Sample QR code (placeholder)
    const qrPlaceholder = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC';
    
    const attachments = [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'qr-test.png',
        contentType: 'image/png',
        contentBytes: qrPlaceholder,
        contentId: 'qrcode',
        isInline: true
      }
    ];
    
    if (lineupBase64) {
      attachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'lineup.jpg',
        contentType: 'image/jpeg',
        contentBytes: lineupBase64,
        contentId: 'lineup',
        isInline: true
      });
    }
    
    const message = {
      message: {
        subject: `🎫 Test Ticket - I-Popstar Live`,
        body: {
          contentType: 'HTML',
          content: generateTicketEmailHTML(testRecipient, FROM_EMAIL)
        },
        toRecipients: [
          {
            emailAddress: {
              address: testRecipient
            }
          }
        ],
        from: {
          emailAddress: {
            address: FROM_EMAIL
          }
        },
        attachments: attachments
      }
    };

    await client
      .api(`/users/${FROM_EMAIL}/sendMail`)
      .post(message);

    console.log('✅ Test email sent successfully!\n');
    console.log('📬 Check inbox for:', testRecipient);
    console.log('   From:', FROM_EMAIL);
    console.log('   Subject: 🎫 Test Ticket - I-Popstar Live');
    console.log('\n📧 Email includes:');
    console.log('   ✓ Production ticket design & styling');
    console.log('   ✓ Event details (Date, Time, Venue)');
    console.log('   ✓ Sample QR code placeholder');
    console.log('   ✓ Lineup image (if available)');
    console.log('   ✓ Important instructions');
    console.log('\n🎉 Microsoft Graph API is ready to use!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n⚠️  Troubleshooting:');
    console.log('─────────────────────────────────────────');
    
    if (error.message.includes('AADSTS')) {
      console.log('🔐 Authentication Error:');
      console.log('   • Verify Tenant ID, Client ID, and Client Secret');
      console.log('   • Check if app is registered in Azure AD');
      console.log('   • Ensure credentials match Azure Portal');
    } else if (error.message.includes('Forbidden') || error.message.includes('Insufficient')) {
      console.log('🚫 Permission Error:');
      console.log('   • Go to Azure Portal → App registrations');
      console.log('   • Find your app → API permissions');
      console.log('   • Add: Mail.Send (Application permission)');
      console.log('   • Click "Grant admin consent"');
    } else if (error.message.includes('not found') || error.message.includes('Mailbox')) {
      console.log('📪 Mailbox Error:');
      console.log('   • Verify ticketing@ruskmedia.com exists in Microsoft 365');
      console.log('   • Check if mailbox is enabled and active');
      console.log('   • Ensure app has access to this mailbox');
    } else {
      console.log('🔍 General Error:');
      console.log('   • Check internet connection');
      console.log('   • Verify all environment variables are set');
      console.log('   • Check Azure Portal for service issues');
    }
    
    console.log('\n📚 Documentation:');
    console.log('   • See MICROSOFT_GRAPH_MIGRATION.md for setup guide');
    console.log('   • Azure Portal: https://portal.azure.com');
    
    console.log('\n📋 Your Configuration:');
    console.log('   AZURE_TENANT_ID=' + (TENANT_ID || 'NOT SET'));
    console.log('   AZURE_CLIENT_ID=' + (CLIENT_ID || 'NOT SET'));
    console.log('   AZURE_CLIENT_SECRET=' + (CLIENT_SECRET ? '***SET***' : 'NOT SET'));
    console.log('   FROM_EMAIL=' + (FROM_EMAIL || 'NOT SET'));
  }
}

// Run test
testEmail().catch(console.error);
