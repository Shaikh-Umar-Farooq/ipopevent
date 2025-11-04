/**
 * Sample Data for MongoDB
 * 
 * Use this to populate your MongoDB database with test tickets
 * You can paste these documents directly into MongoDB Atlas or use MongoDB Compass
 */

const sampleTickets = [
  {
    payment_id: "PAY-001-ABC123",
    ticket_id: "TKT-001-ABC123",
    email: "john.doe@example.com",
    name: "John Doe",
    phone: "+1-555-0101",
    event_name: "Summer Music Festival 2025",
    event_date: "2025-07-15",
    ticket_type: "VIP",
    price: 150,
    used: false,
    created_at: new Date("2025-01-15T10:00:00Z")
  },
  {
    payment_id: "PAY-002-DEF456",
    ticket_id: "TKT-002-DEF456",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    phone: "+1-555-0102",
    event_name: "Summer Music Festival 2025",
    event_date: "2025-07-15",
    ticket_type: "General Admission",
    price: 75,
    used: false,
    created_at: new Date("2025-01-16T14:30:00Z")
  },
  {
    payment_id: "PAY-003-GHI789",
    ticket_id: "TKT-003-GHI789",
    email: "bob.johnson@example.com",
    name: "Bob Johnson",
    phone: "+1-555-0103",
    event_name: "Summer Music Festival 2025",
    event_date: "2025-07-15",
    ticket_type: "VIP",
    price: 150,
    used: true,
    created_at: new Date("2025-01-17T09:15:00Z"),
    used_at: new Date("2025-01-20T18:00:00Z")
  }
];

console.log('Sample Tickets for MongoDB:');
console.log(JSON.stringify(sampleTickets, null, 2));

console.log('\n\n📋 Instructions to add to MongoDB Atlas:');
console.log('1. Go to your MongoDB Atlas dashboard');
console.log('2. Click "Browse Collections"');
console.log('3. Create database: ticket-scanner');
console.log('4. Create collection: tickets');
console.log('5. Click "INSERT DOCUMENT"');
console.log('6. Paste each document from above (or copy from this file)');
console.log('\nOr use MongoDB Compass to import the JSON array directly.');

