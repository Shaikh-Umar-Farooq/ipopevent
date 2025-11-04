/**
 * Upload SharePoint Ticket Data to MongoDB
 * 
 * Since the SharePoint link requires authentication, manually copy the data
 * and paste it here, then run: node scripts/upload-sharepoint-data.js
 */

// STEP 1: Copy data from SharePoint Excel and paste here
const tickets = [
  {
    payment_id: "PAY-001",
    name: "John Doe",
    email: "john.doe@example.com",
    type: "VIP"
  },
  {
    payment_id: "PAY-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    type: "General"
  },
  // Add more tickets from your SharePoint sheet...
];

// STEP 2: Run this script
async function uploadTickets() {
  console.log('🎫 Uploading ticket data to server...\n');

  try {
    const response = await fetch('http://localhost:3000/api/upload-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tickets }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Success!');
      console.log(`   Inserted: ${result.inserted}`);
      console.log(`   Updated: ${result.updated}`);
      console.log(`   Message: ${result.message}`);
    } else {
      console.error('❌ Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Failed to upload:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Development server is running (npm run dev)');
    console.log('   2. MongoDB is configured in .env.local');
    console.log('   3. Server is accessible at http://localhost:3000');
  }
}

// Run if executed directly
if (require.main === module) {
  uploadTickets();
}

module.exports = { uploadTickets };

