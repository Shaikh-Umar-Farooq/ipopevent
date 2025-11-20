# 🎟️ Special Tickets Feature

## Overview

The **Special Tickets** feature allows you to generate QR codes for special ticket types without requiring email, name, or phone information. These tickets are ideal for:

- VIP passes
- Media/Press passes
- Staff credentials
- Complimentary tickets
- On-site ticket generation
- Emergency ticket allocation

---

## ✨ Features

✅ **No Email Required** - Generate QR codes without sending emails  
✅ **Bulk Generation** - Create up to 100 tickets at once  
✅ **Organized Storage** - QR codes saved in folders by ticket type  
✅ **Unique IDs** - Automatically generates unique payment IDs  
✅ **Database Tracked** - All tickets stored in MongoDB  
✅ **Scanner Compatible** - Works with existing QR scanner  

---

## 🚀 How to Use

### Step 1: Access QR Generator Page

1. Navigate to `/qr-generator`
2. Login with admin password
3. Look for the **🎟️ Special Tickets** button (amber/orange color)

### Step 2: Generate Special Tickets

1. Click **🎟️ Special Tickets** button
2. A modal will appear with two fields:
   - **Ticket Type** (dropdown)
   - **Number of Tickets** (1-100)

### Step 3: Select Options

**Available Ticket Types:**
- Day 1 Single
- Day 2 Single
- 2 Day Pass
- VIP Pass
- Media Pass
- Artist Pass
- Staff Pass
- Complimentary Pass

**Number of Tickets:**
- Minimum: 1
- Maximum: 100 per batch

### Step 4: Generate

1. Click **🎫 Generate X Ticket(s)** button
2. Wait for processing (shows "⏳ Generating...")
3. Success message will show folder location
4. QR codes are saved and ready to use!

---

## 📂 File Storage

### Directory Structure

```
/qr-codes/
  ├── VIP_Pass/
  │   ├── SPECIAL-1234567890-ABC123.png
  │   ├── SPECIAL-1234567891-DEF456.png
  │   └── ...
  ├── Media_Pass/
  │   ├── SPECIAL-1234567892-GHI789.png
  │   └── ...
  └── Staff_Pass/
      └── ...
```

### File Naming

Each QR code is named with its unique payment ID:
```
SPECIAL-{timestamp}-{random}.png
```

**Example:**
```
SPECIAL-1699876543210-X7K9M2P.png
```

### Folder Naming

Folders are named after the ticket type with spaces replaced by underscores:
- "VIP Pass" → `VIP_Pass`
- "Day 1 Single" → `Day_1_Single`
- "2 Day Pass" → `2_Day_Pass`

---

## 💾 Database Records

### Special Ticket Fields

Each special ticket is stored in MongoDB with:

| Field | Value | Description |
|-------|-------|-------------|
| `_id` | ObjectId | MongoDB unique ID |
| `ticket_id` | String | Ticket identifier |
| `payment_id` | String | Unique payment ID (SPECIAL-...) |
| `name` | "***" | Placeholder for name |
| `email` | "***" | Placeholder for email |
| `phone` | "***" | Placeholder for phone |
| `ticket_type` | String | Selected ticket type |
| `price` | 0 | Set to zero |
| `qr_generated` | true | Marked as generated |
| `email_sent` | false | No email sent |
| `used` | false | Initially unused |
| `created_at` | Date | Generation timestamp |
| `special_ticket` | true | Identifies as special ticket |

### Example Record

```json
{
  "_id": ObjectId("65abc123..."),
  "ticket_id": "65abc123...",
  "payment_id": "SPECIAL-1699876543210-X7K9M2P",
  "name": "***",
  "email": "***",
  "phone": "***",
  "ticket_type": "VIP Pass",
  "price": 0,
  "qr_generated": true,
  "email_sent": false,
  "used": false,
  "created_at": "2025-11-11T10:30:00.000Z",
  "special_ticket": true
}
```

---

## 🔍 QR Scanner Compatibility

### How It Works

1. **QR Code Contains**: Encrypted JSON with:
   ```json
   {
     "ticket_id": "65abc123...",
     "payment_id": "SPECIAL-1699876543210-X7K9M2P",
     "name": "***",
     "email": "***",
     "ticket_type": "VIP Pass"
   }
   ```

2. **Scanner Decrypts**: Uses same encryption key

3. **Validates**: Checks against MongoDB database

4. **Displays**:
   - ✅ Ticket Type: **VIP Pass** (prominent)
   - ✅ Name: ***
   - ✅ Email: ***
   - ✅ Payment ID: SPECIAL-1699876543210-X7K9M2P

5. **Mark as Used**: Works the same as regular tickets

### Scanner Display

When scanning a special ticket:

```
┌─────────────────────────────┐
│   ✅ Valid Ticket           │
├─────────────────────────────┤
│ 🎫 VIP Pass                 │  ← Large & prominent
│                             │
│ 👤 Name: ***                │
│ 📧 Email: ***               │
│ 💳 Payment ID: SPECIAL-...  │
│                             │
│ [ Mark Entry ]  [ Scan New ]│
└─────────────────────────────┘
```

---

## 📋 Use Cases

### 1. On-Site VIP Check-In

**Scenario:** Last-minute VIP guest arrives

**Solution:**
1. Generate 1 VIP Pass special ticket
2. Print QR code or display on tablet
3. Guest can scan at entrance
4. Mark as used upon entry

### 2. Media/Press Credentials

**Scenario:** Multiple press passes needed for event

**Solution:**
1. Generate 10 Media Pass special tickets
2. Print all QR codes
3. Attach to press badges
4. Scan at media entrance

### 3. Staff Passes

**Scenario:** Event staff need access credentials

**Solution:**
1. Generate 50 Staff Pass special tickets
2. Print QR codes
3. Distribute to staff members
4. Track entry with scanner

### 4. Complimentary Tickets

**Scenario:** Sponsors need comp tickets

**Solution:**
1. Generate Complimentary Pass tickets
2. Email QR code images directly
3. No payment processing needed
4. Still tracked in system

---

## 🔒 Security Features

### Unique Payment IDs

- ✅ Each ticket gets unique ID
- ✅ Checked against database for uniqueness
- ✅ Prevents duplicate IDs
- ✅ Format: `SPECIAL-{timestamp}-{random}`

### Encryption

- ✅ QR codes contain encrypted data
- ✅ Uses same AES-256-CBC encryption as regular tickets
- ✅ Cannot be forged or tampered with
- ✅ Validated server-side

### Database Validation

- ✅ All tickets verified against MongoDB
- ✅ Can be marked as "used" to prevent re-entry
- ✅ Audit trail with timestamps
- ✅ Special tickets flagged with `special_ticket: true`

---

## 📊 Admin Dashboard Display

### How Special Tickets Appear

In the QR Generator dashboard table, special tickets show:

| Payment ID | Name | Email | Type | Amount | Status |
|------------|------|-------|------|--------|--------|
| SPECIAL-... | *** | *** | VIP Pass | ₹0 | ✅ Sent |

**Notes:**
- Status shows "✅ Sent" (qr_generated=true, email_sent=false)
- Amount is ₹0
- Name/Email show as "***"
- Payment ID starts with "SPECIAL-"

---

## 🛠️ Technical Details

### API Endpoint

**POST** `/api/generate-special-tickets`

**Request Body:**
```json
{
  "count": 5,
  "ticketType": "VIP Pass"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated 5 special tickets",
  "generated": 5,
  "folderPath": "qr-codes/VIP_Pass",
  "tickets": [
    {
      "payment_id": "SPECIAL-1699876543210-X7K9M2P",
      "ticket_id": "65abc123..."
    }
  ]
}
```

### Files Modified/Created

**New Files:**
- `/components/SpecialTicketModal.tsx` - Modal UI component
- `/pages/api/generate-special-tickets.ts` - API route
- `/SPECIAL_TICKETS_GUIDE.md` - This documentation

**Updated Files:**
- `/pages/qr-generator.tsx` - Added button and modal
- `/.gitignore` - Added `/qr-codes/` folder

---

## 🚨 Limitations

### Maximum Tickets Per Batch
- **Limit:** 100 tickets per generation
- **Reason:** Prevents server overload and timeout
- **Solution:** Generate multiple batches if needed

### No Email Sending
- Special tickets are **NOT** sent via email
- QR codes must be manually distributed
- Files saved locally in `/qr-codes/` folder

### File Storage
- QR codes stored on server filesystem
- Not automatically uploaded to cloud storage
- For production, consider implementing cloud storage (S3, Cloudinary, etc.)

### Vercel Limitations
- Vercel serverless functions have temp filesystem
- QR codes generated in `/tmp` folder are ephemeral
- **For production:** Implement cloud storage or download immediately

---

## 💡 Best Practices

### 1. Download QR Codes Immediately

After generation:
1. Access server filesystem
2. Download entire folder
3. Back up to cloud storage
4. Have copies before deploying

### 2. Organize by Event/Date

Create folder structure:
```
/qr-codes-backup/
  └── 2025-11-23-Event/
      ├── VIP_Pass/
      ├── Media_Pass/
      └── Staff_Pass/
```

### 3. Track Distribution

Keep a spreadsheet:
| Payment ID | Ticket Type | Issued To | Date | Status |
|------------|-------------|-----------|------|--------|
| SPECIAL-... | VIP Pass | John Doe | 11/11 | Used |

### 4. Test Before Event

1. Generate test special ticket
2. Scan with QR scanner
3. Verify display and validation
4. Test "mark as used" functionality

### 5. Print Quality

For printed QR codes:
- Use high-quality printer (300+ DPI)
- Minimum size: 2" x 2" (5cm x 5cm)
- White background, black QR code
- Test scan after printing

---

## 🧪 Testing

### Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login to QR Generator:**
   Navigate to `http://localhost:3000/qr-generator`

3. **Generate test tickets:**
   - Click "🎟️ Special Tickets"
   - Select "VIP Pass"
   - Enter "2" tickets
   - Click Generate

4. **Check folder:**
   ```bash
   ls -la qr-codes/VIP_Pass/
   ```

5. **Scan QR codes:**
   - Open scanner at `http://localhost:3000/`
   - Scan generated QR code images
   - Verify ticket displays correctly
   - Test "Mark Entry" button

### Production Testing

1. Deploy to Vercel
2. Generate 1 test special ticket
3. Download QR code immediately (Vercel ephemeral filesystem)
4. Scan and verify
5. Check MongoDB for record

---

## 📞 Support

### Common Issues

**Issue:** QR codes not found in folder  
**Solution:** Check Vercel logs, files are in `/tmp` and ephemeral

**Issue:** Duplicate payment IDs  
**Solution:** API checks uniqueness, try again

**Issue:** QR code won't scan  
**Solution:** Check encryption key matches in `.env.local`

**Issue:** Shows as "used" immediately  
**Solution:** Check database, someone may have scanned it

---

## ✅ Feature Status: Ready!

Your Special Tickets feature is fully implemented and ready to use!

**What's included:**
- ✅ Modal UI for ticket generation
- ✅ API endpoint for processing
- ✅ Unique ID generation with collision prevention
- ✅ QR code generation and storage
- ✅ MongoDB integration
- ✅ Scanner compatibility
- ✅ Admin dashboard integration

**Next steps:**
1. Test locally
2. Generate test tickets
3. Verify scanning works
4. Deploy to production
5. Set up cloud storage for QR codes (recommended)

**Enjoy your new Special Tickets feature!** 🎉

