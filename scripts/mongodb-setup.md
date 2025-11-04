# MongoDB Database Setup

## Database Structure

**Database Name:** `ticket-scanner`

**Collection Name:** `tickets`

---

## Indexes (Recommended for Performance)

Run these commands in MongoDB Shell or MongoDB Compass:

```javascript
// Unique index on ticket_id
db.tickets.createIndex({ "ticket_id": 1 }, { unique: true })

// Unique index on payment_id
db.tickets.createIndex({ "payment_id": 1 }, { unique: true })

// Index on email for faster lookups
db.tickets.createIndex({ "email": 1 })

// Index on used status
db.tickets.createIndex({ "used": 1 })

// Compound index for common queries
db.tickets.createIndex({ "ticket_id": 1, "email": 1 })
```

---

## Sample Documents

### Document 1: Valid Ticket

```json
{
  "payment_id": "PAY-001-ABC123",
  "ticket_id": "TKT-001-ABC123",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "+1-555-0101",
  "event_name": "Summer Music Festival 2025",
  "event_date": "2025-07-15",
  "ticket_type": "VIP",
  "price": 150,
  "used": false,
  "created_at": { "$date": "2025-01-15T10:00:00.000Z" }
}
```

### Document 2: General Admission

```json
{
  "payment_id": "PAY-002-DEF456",
  "ticket_id": "TKT-002-DEF456",
  "email": "jane.smith@example.com",
  "name": "Jane Smith",
  "phone": "+1-555-0102",
  "event_name": "Summer Music Festival 2025",
  "event_date": "2025-07-15",
  "ticket_type": "General Admission",
  "price": 75,
  "used": false,
  "created_at": { "$date": "2025-01-16T14:30:00.000Z" }
}
```

### Document 3: Already Used Ticket

```json
{
  "payment_id": "PAY-003-GHI789",
  "ticket_id": "TKT-003-GHI789",
  "email": "bob.johnson@example.com",
  "name": "Bob Johnson",
  "phone": "+1-555-0103",
  "event_name": "Summer Music Festival 2025",
  "event_date": "2025-07-15",
  "ticket_type": "VIP",
  "price": 150,
  "used": true,
  "created_at": { "$date": "2025-01-17T09:15:00.000Z" },
  "used_at": { "$date": "2025-01-20T18:00:00.000Z" }
}
```

---

## Schema Fields Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_id` | String | Yes | Unique payment identifier |
| `ticket_id` | String | Yes | Ticket ID (used in QR code) |
| `email` | String | Yes | User's email address |
| `name` | String | Yes | User's full name |
| `phone` | String | No | User's phone number |
| `event_name` | String | No | Name of the event |
| `event_date` | String | No | Date of the event (YYYY-MM-DD) |
| `ticket_type` | String | No | Type of ticket (VIP, GA, etc.) |
| `price` | Number | No | Ticket price |
| `used` | Boolean | Yes | Whether ticket has been used |
| `created_at` | Date | Yes | When ticket was created |
| `used_at` | Date | No | When ticket was scanned |
| `scanned_by` | String | No | ID of scanner who marked it |

---

## Import Sample Data

### Option 1: MongoDB Atlas Web Interface

1. Go to MongoDB Atlas → Browse Collections
2. Select `ticket-scanner` database
3. Select `tickets` collection
4. Click "INSERT DOCUMENT"
5. Switch to "JSON" view
6. Paste one of the sample documents above
7. Click "Insert"

### Option 2: MongoDB Compass

1. Connect to your cluster
2. Select `ticket-scanner` database
3. Select `tickets` collection
4. Click "ADD DATA" → "Import File"
5. Select JSON file with array of documents
6. Click "Import"

### Option 3: mongosh (MongoDB Shell)

```javascript
use ticket-scanner

db.tickets.insertMany([
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
  }
])
```

---

## Validation Rules (Optional)

You can add validation rules in MongoDB Atlas:

```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["payment_id", "ticket_id", "email", "name", "used", "created_at"],
    "properties": {
      "payment_id": {
        "bsonType": "string",
        "description": "Unique payment ID"
      },
      "ticket_id": {
        "bsonType": "string",
        "description": "Unique ticket ID"
      },
      "email": {
        "bsonType": "string",
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        "description": "Valid email address"
      },
      "name": {
        "bsonType": "string",
        "description": "User's full name"
      },
      "used": {
        "bsonType": "bool",
        "description": "Whether ticket has been used"
      },
      "created_at": {
        "bsonType": "date",
        "description": "Creation timestamp"
      },
      "price": {
        "bsonType": ["number", "null"],
        "minimum": 0,
        "description": "Ticket price"
      }
    }
  }
}
```

---

## Backup Strategy

### Automated Backups (Atlas Free Tier)

MongoDB Atlas M0 (free) clusters get:
- Daily snapshots
- Retained for 2 days
- Restore via Atlas UI

### Manual Export

```bash
# Export entire collection
mongoexport --uri="mongodb+srv://..." --collection=tickets --out=tickets-backup.json

# Import backup
mongoimport --uri="mongodb+srv://..." --collection=tickets --file=tickets-backup.json
```

---

## Monitoring & Alerts

In MongoDB Atlas, set up alerts for:
- High connection count
- Storage usage > 80%
- Failed authentications
- Unusual query patterns

