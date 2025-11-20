/**
 * Migration Script: Fix Existing Special Tickets
 * Sets email_sent = true for all existing special tickets
 * 
 * Usage: node scripts/fix-special-tickets.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function fixSpecialTickets() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ Error: MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('ticket-scanner');
    const ticketsCollection = db.collection('tickets');
    const processedCollection = db.collection('qr_processed');

    // Find special tickets with email_sent: false
    console.log('🔍 Finding special tickets with email_sent: false...\n');

    const specialTicketsQuery = {
      $or: [
        { special_ticket: true },
        { email: '***' },
        { payment_id: { $regex: /^SPECIAL-/ } }
      ],
      email_sent: false
    };

    // Check tickets collection
    const ticketsToUpdate = await ticketsCollection.find(specialTicketsQuery).toArray();
    console.log(`📋 Found ${ticketsToUpdate.length} special tickets in 'tickets' collection`);

    // Check qr_processed collection
    const processedToUpdate = await processedCollection.find(specialTicketsQuery).toArray();
    console.log(`📋 Found ${processedToUpdate.length} special tickets in 'qr_processed' collection\n`);

    // Update tickets collection
    let ticketsUpdatedCount = 0;
    if (ticketsToUpdate.length > 0) {
      console.log('🔄 Updating tickets collection...');
      const ticketsResult = await ticketsCollection.updateMany(
        specialTicketsQuery,
        { 
          $set: { 
            email_sent: true,
            updated_at: new Date()
          } 
        }
      );
      ticketsUpdatedCount = ticketsResult.modifiedCount;
      console.log(`✅ Updated ${ticketsUpdatedCount} tickets in 'tickets' collection`);
    } else {
      console.log("✅ No tickets to update in 'tickets' collection");
    }

    // Update qr_processed collection
    let processedUpdatedCount = 0;
    if (processedToUpdate.length > 0) {
      console.log('🔄 Updating qr_processed collection...');
      const processedResult = await processedCollection.updateMany(
        specialTicketsQuery,
        { 
          $set: { 
            email_sent: true,
            sent_at: new Date()
          } 
        }
      );
      processedUpdatedCount = processedResult.modifiedCount;
      console.log(`✅ Updated ${processedUpdatedCount} tickets in 'qr_processed' collection`);
    } else {
      console.log("✅ No tickets to update in 'qr_processed' collection");
    }

    console.log('\n📊 Summary:');
    console.log('─'.repeat(50));
    console.log(`Total special tickets found: ${ticketsToUpdate.length + processedToUpdate.length}`);
    console.log(`Tickets collection updated: ${ticketsUpdatedCount}`);
    console.log(`Processed collection updated: ${processedUpdatedCount}`);
    console.log('─'.repeat(50));
    console.log('\n✅ Migration completed successfully!');
    console.log('💡 Refresh your QR Generator dashboard to see the updated stats.\n');

  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
console.log('\n' + '═'.repeat(50));
console.log('  🔧 Special Tickets Migration Script');
console.log('═'.repeat(50) + '\n');

fixSpecialTickets();

