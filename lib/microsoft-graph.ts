/**
 * Microsoft Graph API Helper
 * For sending emails via Microsoft 365
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

/**
 * Get authenticated Microsoft Graph client
 */
export function getGraphClient(): Client {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing Azure AD credentials in environment variables');
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      }
    }
  });

  return client;
}

/**
 * Send email via Microsoft Graph API with inline images (CID attachments)
 * This format works better with Gmail
 */
export async function sendEmailViaGraph(
  to: string,
  subject: string,
  htmlContent: string,
  qrCodeBase64?: string,
  qrFilename?: string,
  lineupImageBase64?: string,
  lineupFilename?: string
) {
  const client = getGraphClient();
  const fromEmail = process.env.FROM_EMAIL || 'ticketing@ruskmedia.com';

  const message: any = {
    message: {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ],
      from: {
        emailAddress: {
          address: fromEmail
        }
      }
    }
  };

  // Add inline attachments with Content-ID for Gmail compatibility
  const attachments = [];

  // QR Code as inline attachment
  if (qrCodeBase64 && qrFilename) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: qrFilename,
      contentType: 'image/png',
      contentBytes: qrCodeBase64,
      contentId: 'qrcode',
      isInline: true
    });
  }

  // Lineup image as inline attachment
  if (lineupImageBase64 && lineupFilename) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: lineupFilename,
      contentType: 'image/jpeg',
      contentBytes: lineupImageBase64,
      contentId: 'lineup',
      isInline: true
    });
  }

  if (attachments.length > 0) {
    message.message.attachments = attachments;
  }

  // Send email using the sendMail endpoint
  await client
    .api(`/users/${fromEmail}/sendMail`)
    .post(message);

  return true;
}

