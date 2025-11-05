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
 * Send email via Microsoft Graph API
 */
export async function sendEmailViaGraph(
  to: string,
  subject: string,
  htmlContent: string,
  qrCodeBase64?: string,
  attachmentFilename?: string
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

  // Add attachment if provided
  if (qrCodeBase64 && attachmentFilename) {
    message.message.attachments = [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: attachmentFilename,
        contentType: 'image/png',
        contentBytes: qrCodeBase64
      }
    ];
  }

  // Send email using the sendMail endpoint
  await client
    .api(`/users/${fromEmail}/sendMail`)
    .post(message);

  return true;
}

