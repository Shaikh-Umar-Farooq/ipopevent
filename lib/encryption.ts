/**
 * Encryption/Decryption utilities
 * Uses AES-256-CBC to match the QR code generation script
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * Get encryption key and IV from environment variables
 */
function getEncryptionConfig() {
  const key = process.env.ENCRYPTION_KEY || 'your_32_character_encryption_key_change_this';
  const iv = process.env.ENCRYPTION_IV || 'your_16_char_iv';
  
  return {
    key: Buffer.from(key.padEnd(32, '0').slice(0, 32)),
    iv: Buffer.from(iv.padEnd(16, '0').slice(0, 16))
  };
}

/**
 * Decrypt QR code data
 */
export function decrypt(encryptedData: string): any {
  try {
    const { key, iv } = getEncryptionConfig();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Invalid QR code data');
  }
}

/**
 * Encrypt data (for testing purposes)
 */
export function encrypt(data: any): string {
  try {
    const { key, iv } = getEncryptionConfig();
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const jsonString = JSON.stringify(data);
    
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Validate decrypted payload structure
 */
export function isValidPayload(payload: any): boolean {
  return (
    payload &&
    typeof payload === 'object' &&
    'ticket_id' in payload &&
    'email' in payload &&
    'ts' in payload
  );
}

