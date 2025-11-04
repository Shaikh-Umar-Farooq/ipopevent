/**
 * QR Code Generator Script
 * 
 * This script generates encrypted QR codes for tickets.
 * Run: node scripts/generate-qr.js
 */

const crypto = require('crypto');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// ⚠️ IMPORTANT: Use the same encryption keys as your backend
const ENCRYPTION_KEY = 'your_32_character_encryption_key_change_this'; // Must be 32 chars
const ENCRYPTION_IV = 'your_16_char_iv'; // Must be 16 chars
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt data using AES-256-CBC
 */
function encrypt(data) {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const iv = Buffer.from(ENCRYPTION_IV.padEnd(16, '0').slice(0, 16));
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const jsonString = JSON.stringify(data);
  
  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return encrypted;
}

/**
 * Generate QR code for a ticket
 */
async function generateQRCode(ticketData, outputPath) {
  try {
    // Create payload
    const payload = {
      ticket_id: ticketData.ticket_id,
      email: ticketData.email,
      ts: Date.now().toString()
    };

    console.log('Payload:', payload);

    // Encrypt payload
    const encryptedData = encrypt(payload);
    console.log('Encrypted Data:', encryptedData);

    // Generate QR code
    await QRCode.toFile(outputPath, encryptedData, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log(`✅ QR Code generated: ${outputPath}`);
    return encryptedData;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate QR codes for sample tickets
 */
async function main() {
  console.log('🎫 QR Code Generator for Ticket Scanner\n');

  // Create output directory
  const outputDir = path.join(__dirname, 'qr-codes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sample tickets (match the database migration data)
  const tickets = [
    {
      ticket_id: 'TKT-001-ABC123',
      email: 'john.doe@example.com',
      name: 'John Doe'
    },
    {
      ticket_id: 'TKT-002-DEF456',
      email: 'jane.smith@example.com',
      name: 'Jane Smith'
    },
    {
      ticket_id: 'TKT-003-GHI789',
      email: 'bob.johnson@example.com',
      name: 'Bob Johnson'
    }
  ];

  // Generate QR codes
  for (const ticket of tickets) {
    const filename = `${ticket.ticket_id}.png`;
    const outputPath = path.join(outputDir, filename);
    
    console.log(`\nGenerating QR for: ${ticket.name} (${ticket.ticket_id})`);
    await generateQRCode(ticket, outputPath);
  }

  console.log('\n✅ All QR codes generated successfully!');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('\n⚠️  IMPORTANT: Make sure to use the same encryption keys in your backend .env file!');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { encrypt, generateQRCode };

