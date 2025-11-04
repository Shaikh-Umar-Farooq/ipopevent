# 🚀 Get Started in 3 Steps

The fastest way to get your QR Ticket Scanner running!

---

## ⚡ Step 1: Setup MongoDB (5 minutes)

1. **Create Account**: https://mongodb.com/cloud/atlas
2. **Create FREE Cluster**: Choose M0 (free forever)
3. **Create Database User**:
   - Username: `scanner-admin`
   - Password: (auto-generate and save it!)
4. **Allow Network Access**: Add `0.0.0.0/0`
5. **Get Connection String**: 
   - Click "Connect" → "Connect your application"
   - Copy the URI
   - Replace `<password>` with your password

Example URI:
```
mongodb+srv://scanner-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ticket-scanner?retryWrites=true&w=majority
```

6. **Create Collection**:
   - Database name: `ticket-scanner`
   - Collection name: `tickets`
   - Insert one sample document:

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

---

## ⚡ Step 2: Run Locally (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local with your MongoDB URI
# Add your MongoDB connection string from Step 1
nano .env.local  # or use any text editor

# 4. Generate test QR code
cd scripts
npm install
node generate-qr.js
cd ..

# 5. Start development server
npm run dev
```

Open http://localhost:3000 and scan the QR code from `scripts/qr-codes/`!

---

## ⚡ Step 3: Deploy to Vercel (5 minutes)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables when prompted:
# - MONGODB_URI: (your connection string)
# - ENCRYPTION_KEY: your_32_character_encryption_key_change_this
# - ENCRYPTION_IV: your_16_char_iv

# 5. Visit your live site!
```

Your site is now live at: `https://your-project.vercel.app`

---

## ✅ Verify It Works

1. Open your Vercel URL on your phone
2. Click "Start Scanning"
3. Scan the QR code from `scripts/qr-codes/TKT-001-ABC123.png`
4. Should show: "✅ VALID TICKET"
5. Click "Mark Entry"
6. Scan again: "⚠️ ALREADY USED"

**Success!** Your QR scanner is operational.

---

## 📚 What's Next?

### For Production Use:
1. **Change encryption keys** to secure values
2. **Add your real tickets** to MongoDB
3. **Generate QR codes** for all tickets
4. **Test with your team** before event day

### Learn More:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [FAQ.md](./FAQ.md) - Common questions
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Complete checklist

---

## 🆘 Quick Troubleshooting

### "Cannot connect to database"
→ Check MongoDB URI in `.env.local` and Vercel environment variables

### "Camera not working"
→ Ensure HTTPS (Vercel provides this) and grant camera permissions

### "Invalid QR code"
→ Encryption keys in `.env.local` must match `scripts/generate-qr.js`

### Still stuck?
→ See [FAQ.md](./FAQ.md) or [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

---

## 💰 Total Cost: $0

- ✅ Vercel Free Tier: 100GB bandwidth
- ✅ MongoDB Atlas M0: 512MB storage
- ✅ No credit card required

Perfect for events up to ~1000 attendees!

---

## 🎉 That's It!

You now have a production-ready QR ticket scanner deployed for free.

**Time to setup**: ~15 minutes  
**Cost**: $0/month  
**Scalability**: Up to 1000+ tickets

Enjoy your event! 🎫

