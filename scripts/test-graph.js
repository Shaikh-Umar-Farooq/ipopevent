/**
 * Test Microsoft Graph API Connection
 * Run: node scripts/test-graph.js
 * 
 * Tests if Microsoft Graph API credentials are working using User.Read permission
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
require('dotenv').config({ path: '.env.local' });

async function testGraph() {
  console.log('🔍 Testing Microsoft Graph API connection...\n');

  const TENANT_ID = process.env.AZURE_TENANT_ID;
  const CLIENT_ID = process.env.AZURE_CLIENT_ID;
  const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'ticketing@ruskmedia.com';

  // Check environment variables
  console.log('Configuration:');
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
    // Step 1: Authenticate
    console.log('🔐 Step 1: Authenticating with Azure AD...');
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    
    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
    console.log('✅ Authentication successful!');
    console.log('   Token expires:', new Date(tokenResponse.expiresOnTimestamp).toLocaleString());
    console.log('   Token type:', tokenResponse.tokenType || 'Bearer');
    console.log('');

    // Step 2: Create Graph client
    console.log('🔌 Step 2: Initializing Microsoft Graph client...');
const client = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
          return tokenResponse.token;
    }
  }
});
    console.log('✅ Graph client initialized!\n');

    // Step 3: Test User.Read permission - Fetch user data
    console.log('👤 Step 3: Testing User.Read permission...');
    console.log(`   Fetching user data for: ${FROM_EMAIL}\n`);
    
    try {
      // Fetch user data using User.Read permission
      const user = await client
        .api(`/users/${FROM_EMAIL}`)
        .select('id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,officeLocation,userType,accountEnabled,createdDateTime')
        .get();
      
      console.log('═════════════════════════════════════════');
      console.log('✅ User Data Fetched Successfully!');
      console.log('═════════════════════════════════════════');
      console.log('');
      console.log('📋 User Information:');
      console.log('─────────────────────────────────────────');
      console.log('   User ID:          ', user.id || 'N/A');
      console.log('   Display Name:     ', user.displayName || 'N/A');
      console.log('   Given Name:       ', user.givenName || 'N/A');
      console.log('   Surname:          ', user.surname || 'N/A');
      console.log('   Email:            ', user.mail || 'N/A');
      console.log('   User Principal:   ', user.userPrincipalName || 'N/A');
      console.log('   Job Title:        ', user.jobTitle || 'N/A');
      console.log('   Department:       ', user.department || 'N/A');
      console.log('   Office Location:  ', user.officeLocation || 'N/A');
      console.log('   User Type:        ', user.userType || 'N/A');
      console.log('   Account Enabled:  ', user.accountEnabled !== undefined ? user.accountEnabled : 'N/A');
      console.log('   Created:          ', user.createdDateTime ? new Date(user.createdDateTime).toLocaleString() : 'N/A');
      console.log('');
      
      // Display raw JSON for verification
      console.log('📄 Raw JSON Data:');
      console.log('─────────────────────────────────────────');
      console.log(JSON.stringify(user, null, 2));
      console.log('');
      
      console.log('═════════════════════════════════════════');
      console.log('✅ CREDENTIALS VERIFIED!');
      console.log('═════════════════════════════════════════');
      console.log('');
      console.log('🎉 Your Microsoft Graph API credentials are working!');
      console.log('   ✅ Authentication: SUCCESS');
      console.log('   ✅ User.Read Permission: SUCCESS');
      console.log('   ✅ Graph API Connection: SUCCESS');
      console.log('');
      console.log('📝 Note: Mail.Send permission is still missing');
      console.log('   To enable email sending:');
      console.log('   1. Go to Azure Portal → App registrations');
      console.log('   2. Find your app (Client ID: ' + CLIENT_ID.substring(0, 8) + '...)');
      console.log('   3. Go to API permissions');
      console.log('   4. Add: Mail.Send (Application permission)');
      console.log('   5. Click "Grant admin consent"');
      console.log('');

    } catch (userError) {
      console.error('❌ Failed to fetch user data:', userError.message);
      console.log('');
      
      if (userError.statusCode === 404) {
        console.log('⚠️  User not found:', FROM_EMAIL);
        console.log('   • Verify the email exists in Microsoft 365');
        console.log('   • Check if it\'s the correct user principal name');
        console.log('');
      } else if (userError.statusCode === 403 || userError.message.includes('Insufficient')) {
        console.log('⚠️  Permission Error:');
        console.log('   • Need User.Read or User.Read.All permission');
        console.log('   • Go to: Azure Portal → App registrations');
        console.log('   • Add: User.Read (Application permission)');
        console.log('   • Click "Grant admin consent"');
        console.log('');
      } else {
        console.log('⚠️  Error Details:');
        console.log('   Status:', userError.statusCode || 'N/A');
        console.log('   Message:', userError.message);
        console.log('');
      }
      
      throw userError;
    }

    // Summary
    console.log('═════════════════════════════════════════');
    console.log('✅ Microsoft Graph API Connection Test');
    console.log('═════════════════════════════════════════');
    console.log('Status: ✅ CONNECTED');
    console.log('Authentication: ✅ WORKING');
    console.log('Graph Client: ✅ INITIALIZED');
    console.log('User.Read Permission: ✅ VERIFIED');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n⚠️  Troubleshooting:');
    console.log('─────────────────────────────────────────');
    
    if (error.message.includes('AADSTS')) {
      console.log('🔐 Authentication Error:');
      console.log('   • Verify Tenant ID, Client ID, and Client Secret');
      console.log('   • Check Azure Portal → App registrations');
      console.log('   • Ensure credentials match exactly');
    } else if (error.message.includes('Forbidden') || error.message.includes('Insufficient')) {
      console.log('🚫 Permission Error:');
      console.log('   • Azure Portal → App registrations');
      console.log('   • Find your app → API permissions');
      console.log('   • Add: User.Read (Application permission)');
      console.log('   • Click "Grant admin consent"');
    } else if (error.message.includes('not found') || error.message.includes('404')) {
      console.log('📪 Resource Not Found:');
      console.log('   • Verify ' + FROM_EMAIL + ' exists in Microsoft 365');
      console.log('   • Check if user is active and enabled');
    } else {
      console.log('🔍 General Error:');
      console.log('   • Check internet connection');
      console.log('   • Verify all environment variables');
      console.log('   • Check Azure Portal for service status');
      console.log('   • Error details:', error.message);
    }
    
    console.log('\n📚 See: MICROSOFT_GRAPH_MIGRATION.md for detailed setup');
  }
}

// Run test
testGraph().catch(console.error);
