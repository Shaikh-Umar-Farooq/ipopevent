# 📡 API Reference

Complete API documentation for the QR Ticket Scanner backend.

---

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

---

## Endpoints

### 1. Verify QR Code

Decrypt and verify a scanned QR code.

**Endpoint**: `POST /api/verify-qr`

**Request Body**:
```json
{
  "encryptedData": "hex_encrypted_string_from_qr_code"
}
```

**Success Response (Valid Ticket)**:
```json
{
  "success": true,
  "status": "valid",
  "message": "Valid ticket - Entry allowed",
  "ticket": {
    "_id": "507f1f77bcf86cd799439011",
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
    "created_at": "2025-01-15T10:00:00.000Z"
  }
}
```

**Response (Already Used)**:
```json
{
  "success": true,
  "status": "used",
  "message": "This ticket has already been used",
  "ticket": {
    ...same as above...,
    "used": true,
    "used_at": "2025-01-20T18:00:00.000Z"
  }
}
```

**Error Response (Invalid Ticket)**:
```json
{
  "success": false,
  "status": "invalid",
  "message": "Ticket not found in database - Invalid ticket"
}
```

**Error Response (Decryption Failed)**:
```json
{
  "success": false,
  "status": "invalid",
  "message": "Invalid QR code - decryption failed"
}
```

**Status Codes**:
- `200` - Success (valid or used ticket)
- `400` - Bad request (invalid data or decryption failed)
- `404` - Ticket not found
- `405` - Method not allowed
- `500` - Internal server error

---

### 2. Mark Ticket as Used

Mark a verified ticket as used (entry granted).

**Endpoint**: `POST /api/mark-used`

**Request Body**:
```json
{
  "payment_id": "PAY-001-ABC123"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Entry marked successfully",
  "ticket": {
    "_id": "507f1f77bcf86cd799439011",
    "payment_id": "PAY-001-ABC123",
    "ticket_id": "TKT-001-ABC123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "used": true,
    "created_at": "2025-01-15T10:00:00.000Z",
    "used_at": "2025-01-20T18:00:00.000Z"
  }
}
```

**Error Response (Already Used)**:
```json
{
  "success": false,
  "message": "Ticket already marked as used"
}
```

**Error Response (Not Found)**:
```json
{
  "success": false,
  "message": "Ticket not found"
}
```

**Status Codes**:
- `200` - Successfully marked as used
- `400` - Bad request (missing payment_id or already used)
- `404` - Ticket not found
- `405` - Method not allowed
- `500` - Internal server error

---

## TypeScript Types

### VerifyResponse
```typescript
interface VerifyResponse {
  success: boolean;
  status: 'valid' | 'used' | 'invalid' | 'error';
  message: string;
  ticket?: TicketRecord;
}
```

### MarkUsedResponse
```typescript
interface MarkUsedResponse {
  success: boolean;
  message: string;
  ticket?: TicketRecord;
}
```

### TicketRecord
```typescript
interface TicketRecord {
  _id?: string;
  payment_id: string;
  ticket_id: string;
  email: string;
  name: string;
  phone?: string;
  event_name?: string;
  event_date?: string;
  ticket_type?: string;
  price?: number;
  used: boolean;
  created_at: Date;
  used_at?: Date;
  scanned_by?: string;
}
```

### TicketPayload (from QR code)
```typescript
interface TicketPayload {
  ticket_id: string;
  email: string;
  ts: string;  // timestamp when QR was generated
}
```

---

## Example Usage

### JavaScript/Fetch

```javascript
// Verify QR Code
async function verifyTicket(encryptedData) {
  const response = await fetch('/api/verify-qr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ encryptedData }),
  });
  
  return await response.json();
}

// Mark as Used
async function markTicketUsed(payment_id) {
  const response = await fetch('/api/mark-used', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_id }),
  });
  
  return await response.json();
}

// Usage
const result = await verifyTicket(scannedQRData);
if (result.status === 'valid') {
  console.log('Valid ticket:', result.ticket);
  await markTicketUsed(result.ticket.payment_id);
}
```

### cURL

```bash
# Verify QR Code
curl -X POST https://your-app.vercel.app/api/verify-qr \
  -H "Content-Type: application/json" \
  -d '{"encryptedData":"abc123..."}'

# Mark as Used
curl -X POST https://your-app.vercel.app/api/mark-used \
  -H "Content-Type: application/json" \
  -d '{"payment_id":"PAY-001-ABC123"}'
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 405 Method Not Allowed | Using GET instead of POST | Use POST method |
| 400 Invalid QR code | Wrong encryption keys or corrupted data | Check encryption keys match |
| 404 Ticket not found | Ticket doesn't exist in database | Add ticket to database first |
| 500 Internal Server Error | Database connection or server issue | Check logs and database connection |

### Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "status": "error",
  "message": "Human-readable error message"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. For production, consider:
- Adding rate limiting middleware
- Using Vercel Edge Middleware
- Implementing request throttling

---

## Authentication

Currently no authentication required. For production:
- Add API key authentication
- Implement JWT tokens
- Use OAuth for scanner operators

---

## CORS

CORS is enabled by default in Next.js API routes. For custom CORS:

```typescript
// Add to API route
export const config = {
  api: {
    externalResolver: true,
  },
};

// Set headers
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

---

## Testing

### Test Valid Ticket
1. Generate QR code with `generate-qr.js`
2. Scan QR or copy encrypted data
3. POST to `/api/verify-qr`
4. Should return `status: "valid"`

### Test Used Ticket
1. Mark ticket as used via `/api/mark-used`
2. Scan same QR code again
3. Should return `status: "used"`

### Test Invalid Ticket
1. Generate random encrypted string
2. POST to `/api/verify-qr`
3. Should return `status: "invalid"`

---

## Monitoring

### Vercel Analytics
- View in Vercel dashboard
- Real-time request logs
- Performance metrics

### MongoDB Metrics
- View in Atlas dashboard
- Connection count
- Query performance

---

## Changelog

**v1.0.0** (2025-01-01)
- Initial release
- Verify QR endpoint
- Mark as used endpoint
- MongoDB integration
- AES-256-CBC encryption support

