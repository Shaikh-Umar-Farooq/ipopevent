/**
 * Test Microsoft Graph API Email Configuration
 * Run: node scripts/test-email.js
 * 
 * Tests if Microsoft Graph API is configured correctly
 * Make sure to: npm install
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
require('dotenv').config({ path: '.env.local' });

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

    // Send test email
    console.log('\n📤 Sending test email to:', testRecipient);
    
    const message = {
      message: {
        subject: `✅ Test Email - Microsoft Graph API`,
        body: {
          contentType: 'HTML',
          content: `
<!DOCTYPE html>
<html>
<head>
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
      padding: 30px;
    }
    h1 {
      color: #10b981;
      margin: 0 0 20px 0;
    }
    .success {
      background: #d1fae5;
      color: #065f46;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
      font-weight: 600;
    }
    .info {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Email Configuration Working!</h1>
    
    <div class="success">
      Microsoft Graph API is configured correctly
    </div>
    
    <div class="info">
      <strong>📧 Sent from:</strong> ${FROM_EMAIL}<br>
      <strong>🔑 Tenant:</strong> ${TENANT_ID.substring(0, 8)}...<br>
      <strong>⏰ Sent at:</strong> ${new Date().toLocaleString()}<br>
    </div>
    
    <p>Your email system is now ready to send QR codes to ticket holders!</p>
    
    <p><strong>Next Steps:</strong></p>
    <ul>
      <li>Visit <code>/qr-generator</code> on your website</li>
      <li>Paste ticket data or upload from database</li>
      <li>Click "Generate & Send" to send QR codes</li>
    </ul>
    
    <div class="footer">
      <strong>iPOP Event - QR Scanner System</strong><br>
      Powered by Microsoft Graph API
    </div>
  </div>
</body>
</html>
          `
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
        }
      }
    };

    await client
      .api(`/users/${FROM_EMAIL}/sendMail`)
      .post(message);

    console.log('✅ Test email sent successfully!\n');
    console.log('📬 Check inbox for:', testRecipient);
    console.log('   From:', FROM_EMAIL);
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
