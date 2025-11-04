/**
 * Test Email Configuration
 * Run: node scripts/test-email.js
 * 
 * Tests if Gmail SMTP is configured correctly
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('📧 Testing email configuration...\n');

  const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS ;
  const APP_PASSWORD = process.env.APP_PASSWORD ;

  console.log('Email Address:', EMAIL_ADDRESS);
  console.log('App Password:', APP_PASSWORD ? '✓ Set' : '✗ Not set');
  console.log('');

  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: EMAIL_ADDRESS,
        pass: APP_PASSWORD
      }
    });

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"iPOP Test" <${EMAIL_ADDRESS}>`,
      to: EMAIL_ADDRESS, // Send to yourself
      subject: 'Test Email - QR Scanner System',
      html: `
        <h1>✅ Email Configuration Working!</h1>
        <p>Your Gmail SMTP is configured correctly.</p>
        <p>You can now send QR codes to ticket holders.</p>
        <hr>
        <p><small>Test sent at: ${new Date().toLocaleString()}</small></p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('\n📬 Check your inbox:', EMAIL_ADDRESS);
    console.log('\n🎉 Email system is ready to use!');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n⚠️  Troubleshooting:');
    console.log('   1. Enable 2FA on your Gmail account');
    console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
    console.log('   3. Add to .env.local:');
    console.log('      EMAIL_ADDRESS=your-email@gmail.com');
    console.log('      APP_PASSWORD=your-app-password');
    console.log('   4. Ensure "Less secure app access" is OFF (use App Password instead)');
  }
}

// Run test
testEmail();

