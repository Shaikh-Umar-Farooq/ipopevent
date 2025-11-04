# 📧 QR Generator & Email Sender Guide

Complete guide to generating and sending QR codes to ticket holders.

---

## 🎯 Overview

The QR Generator system:
1. **Reads** ticket data from SharePoint Excel
2. **Displays** all entries with status tracking
3. **Generates** encrypted QR codes for pending entries
4. **Sends** QR codes via email to ticket holders
5. **Tracks** which tickets have been processed

---

## 📋 Features

### Admin Dashboard (`/qr-generator`)
- ✅ View all ticket entries from database
- ✅ See QR generation & email status for each entry
- ✅ Stats: Total, Generated, Pending
- ✅ Bulk generate and send QR codes
- ✅ Refresh data from sheet
- ✅ Prevent duplicate sends

### Email System
- ✅ Beautiful HTML email templates
- ✅ Embedded QR code images
- ✅ Ticket details included
- ✅ Professional branding
- ✅ Gmail SMTP integration

### Tracking System
- ✅ MongoDB tracking of processed tickets
- ✅ Prevents duplicate QR generation
- ✅ Prevents duplicate emails
- ✅ Tracks send timestamps

---

## 🚀 Setup Instructions

### Step 1: Configure Gmail

1. **Enable 2FA** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "iPOP Ticket Scanner"
   - Copy the generated 16-character password

3. **Add to `.env.local`**:
```env
EMAIL_ADDRESS=smuf7080@gmail.com
APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Step 2: Upload Ticket Data

Since the SharePoint Excel link requires authentication, you need to manually upload the data:

**Option A: Via API** (Recommended)

Create a script `upload-tickets.js`:
```javascript
const tickets = [
  {
    payment_id: "PAY-001",
    name: "John Doe",
    email: "john@example.com",
    type: "VIP"
  },
  {
    payment_id: "PAY-002",
    name: "Jane Smith",
    email: "jane@example.com",
    type: "General"
  }
  // ... more tickets
];

fetch('http://localhost:3000/api/upload-sheet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tickets })
})
.then(res => res.json())
.then(data => console.log(data));
```

Run: `node upload-tickets.js`

**Option B: Via MongoDB Directly**

Upload to MongoDB Atlas using MongoDB Compass or mongosh.

### Step 3: Install Dependencies

```bash
npm install
```

New packages added:
- `nodemailer` - Email sending
- `qrcode` - QR code generation (server-side)
- `xlsx` - Excel file parsing

### Step 4: Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000/qr-generator

---

## 🎨 Admin Interface

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  🎫 QR Code Generator & Email Sender                │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Total   │  │Generated │  │ Pending  │         │
│  │   150    │  │   120    │  │   30     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                      │
│  [🔄 Refresh] [✉️ Generate & Send (30)]            │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Payment ID │ Name │ Email │ Type │ Status │    │
│  ├────────────────────────────────────────────┤    │
│  │ PAY-001    │ John │ john@ │ VIP  │ ✅ Sent │    │
│  │ PAY-002    │ Jane │ jane@ │ Gen  │ ❌ Pend │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Status Badges

- **✅ Sent** - QR generated and email sent (Green)
- **⚠️ Generated** - QR created but email failed (Yellow)
- **❌ Pending** - Not yet processed (Red)

---

## 📧 Email Template

### What Recipients See:

```
┌─────────────────────────────────────┐
│   🎫 Your Event Ticket              │
│   Get ready for an amazing exp!     │
├─────────────────────────────────────┤
│ Hi John Doe,                        │
│                                     │
│ Thank you for your purchase!        │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Ticket Type: [VIP]          │   │
│ │ Name: John Doe              │   │
│ │ Email: john@example.com     │   │
│ │ Payment ID: PAY-001         │   │
│ └─────────────────────────────┘   │
│                                     │
│        Your QR Code                 │
│   Show this at the entrance         │
│                                     │
│   [QR CODE IMAGE - 300x300px]      │
│                                     │
│ ⚠️ Important:                       │
│ • Save this QR code                 │
│ • Can only be used once             │
│ • Arrive 30 min early               │
│                                     │
│ See you at the event! 🎉           │
└─────────────────────────────────────┘
```

---

## 🔄 Workflow

### Processing Flow

```
1. Admin clicks "Generate & Send"
     ↓
2. System fetches all pending entries
     ↓
3. For each pending ticket:
   a. Generate unique ticket_id
   b. Create encrypted payload
   c. Generate QR code image
   d. Send email with QR code
   e. Mark as processed in DB
     ↓
4. Display success message
     ↓
5. Refresh data to show updated status
```

### Database Collections

**1. `tickets` Collection**
```javascript
{
  payment_id: "PAY-001",
  ticket_id: "TKT-PAY-001",
  name: "John Doe",
  email: "john@example.com",
  ticket_type: "VIP",
  used: false,
  created_at: ISODate("...")
}
```

**2. `qr_processed` Collection** (Tracking)
```javascript
{
  payment_id: "PAY-001",
  ticket_id: "TKT-PAY-001",
  email: "john@example.com",
  qr_generated: true,
  email_sent: true,
  sent_at: ISODate("...")
}
```

---

## 🔐 Security Features

### QR Code Encryption
- AES-256-CBC encryption
- Unique timestamp per QR
- Cannot be forged without encryption keys

### Email Security
- Gmail App Password (not account password)
- TLS encryption for SMTP
- One-time use QR codes

### Duplicate Prevention
- Tracks processed payment_ids
- Prevents double-sending
- Database-backed tracking

---

## 📊 API Endpoints

### 1. GET `/api/fetch-sheet`

Fetch all ticket data with status.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "payment_id": "PAY-001",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "VIP",
      "qr_generated": true,
      "email_sent": true
    }
  ]
}
```

### 2. POST `/api/generate-and-send`

Generate QR codes and send emails.

**Response**:
```json
{
  "success": true,
  "processed": 30,
  "message": "Successfully processed 30 out of 30 entries"
}
```

### 3. POST `/api/upload-sheet`

Upload ticket data manually.

**Request**:
```json
{
  "tickets": [
    {
      "payment_id": "PAY-001",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "VIP"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "inserted": 5,
  "updated": 2,
  "message": "Processed 7 tickets"
}
```

---

## 🐛 Troubleshooting

### "Failed to send email"

**Cause**: Gmail authentication issue

**Solution**:
1. Check App Password is correct
2. Ensure 2FA is enabled
3. Check `EMAIL_ADDRESS` and `APP_PASSWORD` in `.env.local`
4. Try generating a new App Password

### "No pending entries"

**Cause**: All tickets already processed

**Solution**:
1. Check database `qr_processed` collection
2. Clear tracking for testing:
```javascript
db.qr_processed.deleteMany({})
```

### "QR code not decrypting"

**Cause**: Encryption key mismatch

**Solution**:
1. Ensure `ENCRYPTION_KEY` and `ENCRYPTION_IV` match in:
   - `.env.local`
   - Vercel environment variables
2. Keys must be identical for generation and scanning

### Emails going to spam

**Solution**:
1. Use a verified domain
2. Set up SPF and DKIM records
3. Ask recipients to whitelist your email
4. Use a professional email service (SendGrid, AWS SES)

---

## 🚀 Deployment to Vercel

### Step 1: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
EMAIL_ADDRESS=smuf7080@gmail.com
APP_PASSWORD=gfoc qtol uxrw hlqn
MONGODB_URI=mongodb+srv://...
ENCRYPTION_KEY=your_32_character_key
ENCRYPTION_IV=your_16_char_iv
```

### Step 2: Deploy

```bash
git add .
git commit -m "Add QR generator and email sender"
git push
```

Vercel deploys automatically!

### Step 3: Access Admin Panel

Visit: `https://your-app.vercel.app/qr-generator`

---

## 📈 Scaling Considerations

### Current Setup (Free Tier)
- Gmail: 500 emails/day limit
- Vercel: Serverless function timeout 10s
- MongoDB: 512MB storage

### For Large Events (>500 attendees)

**Option 1: Batch Processing**
- Process in batches of 50
- Add delays between batches
- Run multiple times

**Option 2: Use Professional Email Service**
- SendGrid: 100 emails/day free, then paid
- AWS SES: $0.10 per 1,000 emails
- Mailgun: 5,000 emails/month free

**Option 3: Background Jobs**
- Use Vercel Cron Jobs
- Process overnight
- Schedule in advance

---

## ✅ Best Practices

### Before Event
- [ ] Upload all ticket data
- [ ] Test with your own email first
- [ ] Generate & send QR codes at least 1 day before
- [ ] Monitor Gmail sending limits

### During Generation
- [ ] Start with a small batch (5-10) to test
- [ ] Check spam folder
- [ ] Verify QR codes scan correctly
- [ ] Monitor success rate

### After Sending
- [ ] Check "Generated & Sent" count matches total
- [ ] Export tracking data as backup
- [ ] Keep QR images saved
- [ ] Have support email ready for issues

---

## 🎉 Success Metrics

You'll know it's working when:
- ✅ Dashboard shows correct ticket count
- ✅ Status badges update correctly
- ✅ Emails arrive within 1-2 minutes
- ✅ QR codes scan successfully at scanner
- ✅ No duplicate sends occur
- ✅ "Pending" count decreases to 0

---

## 📞 Support

For issues:
1. Check error messages in browser console
2. Check Vercel logs for API errors
3. Verify MongoDB connections
4. Test Gmail credentials
5. Review this guide for troubleshooting

---

**Your QR generator is ready to use!** 🎫✨

