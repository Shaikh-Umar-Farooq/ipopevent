# ⚡ Quick Start Guide

Get your QR Scanner running in 10 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up MongoDB

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create FREE M0 cluster
3. Add database user
4. Allow network access (0.0.0.0/0)
5. Copy connection string

## 3. Configure Environment

Create `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticket-scanner
ENCRYPTION_KEY=your_32_character_encryption_key_change_this
ENCRYPTION_IV=your_16_char_iv
```

## 4. Add Sample Data to MongoDB

Go to MongoDB Atlas → Browse Collections → Insert Document:

```json
{
  "payment_id": "PAY-001",
  "ticket_id": "TKT-001-ABC123",
  "email": "test@example.com",
  "name": "Test User",
  "used": false,
  "created_at": { "$date": "2025-01-01T00:00:00.000Z" }
}
```

## 5. Generate QR Code

```bash
cd scripts
npm install
node generate-qr.js
```

QR codes saved in `scripts/qr-codes/`

## 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 7. Test Scanning

1. Open the app on your phone or use a QR code app
2. Click "Start Scanning"
3. Scan the generated QR code
4. Should show ticket details!

## 8. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel
```

Add environment variables in Vercel dashboard.

---

## ✅ Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB Atlas account created
- [ ] Database user created
- [ ] Network access configured
- [ ] `.env.local` file created with correct values
- [ ] Sample ticket added to MongoDB
- [ ] QR code generated
- [ ] Development server running
- [ ] Successfully scanned a QR code
- [ ] Deployed to Vercel

---

## 🆘 Common Issues

**"Cannot connect to database"**
→ Check MongoDB URI and IP whitelist

**"Camera not working"**
→ Use HTTPS (Vercel provides this) and grant permissions

**"Invalid QR code"**
→ Ensure encryption keys match in both `.env.local` and `generate-qr.js`

---

For detailed deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)

