# 🎫 QR Ticket Scanner & Authentication System

A secure, serverless QR code scanning and ticket validation system built with Next.js, MongoDB, and deployed on Vercel.

## ✨ Features

- 🔐 **Encrypted QR Codes** - AES-256-CBC encryption for secure ticket data
- 📱 **Mobile Camera Scanning** - Real-time QR code scanning using device camera
- ✅ **Ticket Validation** - Verify tickets against MongoDB database
- 🔒 **Usage Tracking** - Mark tickets as used to prevent duplicate entries
- 🚀 **Serverless Deployment** - Free hosting on Vercel with MongoDB Atlas
- 📊 **Real-time Status** - Display ticket details with valid/used/invalid states

## 🏗️ Architecture

- **Frontend**: Next.js (React) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas (Free Tier)
- **Deployment**: Vercel (Free Tier)
- **QR Scanner**: html5-qrcode library

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Vercel account (free tier)
- Git installed

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd ipoplive2
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free M0 tier)
4. Go to Database Access → Add Database User
   - Create username and password
   - Grant "Read and write to any database" permission
5. Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticket-scanner?retryWrites=true&w=majority

# Encryption Keys (MUST match your QR generation script)
ENCRYPTION_KEY=your_32_character_encryption_key_change_this
ENCRYPTION_IV=your_16_char_iv
```

⚠️ **IMPORTANT**: Use the SAME encryption keys as your QR code generation script!

### 4. Set Up Database

Create a collection called `tickets` in your MongoDB database with sample documents:

```javascript
{
  "payment_id": "PAY-12345",
  "ticket_id": "TKT-001-ABC123",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "event_name": "Concert 2025",
  "event_date": "2025-12-31",
  "ticket_type": "VIP",
  "price": 150,
  "used": false,
  "created_at": new Date()
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Testing with Sample QR Codes

Use the provided QR generation script to create test QR codes:

```bash
node scripts/generate-qr.js
```

Make sure the encryption keys match in both scripts!

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/qr-scanner.git
git push -u origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Add Environment Variables:
   - `MONGODB_URI`
   - `ENCRYPTION_KEY`
   - `ENCRYPTION_IV`
6. Click "Deploy"

### Set Environment Variables on Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://...
ENCRYPTION_KEY=your_32_character_encryption_key_change_this
ENCRYPTION_IV=your_16_char_iv
```

## 📊 Database Schema

### Tickets Collection

```typescript
{
  payment_id: string;        // Unique payment identifier
  ticket_id: string;         // Ticket ID (from QR code)
  email: string;             // User email
  name: string;              // User name
  phone?: string;            // User phone (optional)
  event_name?: string;       // Event name (optional)
  event_date?: string;       // Event date (optional)
  ticket_type?: string;      // Ticket type (optional)
  price?: number;            // Ticket price (optional)
  used: boolean;             // Whether ticket has been used
  created_at: Date;          // Creation timestamp
  used_at?: Date;            // Usage timestamp (optional)
  scanned_by?: string;       // Scanner identifier (optional)
}
```

### Indexes (Recommended)

Create indexes for better performance:

```javascript
db.tickets.createIndex({ "ticket_id": 1 }, { unique: true })
db.tickets.createIndex({ "payment_id": 1 }, { unique: true })
db.tickets.createIndex({ "email": 1 })
```

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use strong encryption keys** - Change the default keys!
3. **MongoDB Network Access** - Restrict IP addresses in production
4. **HTTPS Only** - Vercel provides HTTPS by default
5. **Rate Limiting** - Consider adding rate limiting for production

## 🔄 Workflow

1. **Generate QR Code** → User receives encrypted QR code
2. **Scan QR Code** → Scanner decrypts and extracts ticket_id
3. **Verify Ticket** → Check if ticket exists in database
4. **Check Status** → Determine if ticket is valid/used/invalid
5. **Display Details** → Show ticket information
6. **Mark Entry** → Update database to mark as used

## 🐛 Troubleshooting

### Camera Not Working

- Ensure HTTPS (Vercel provides this automatically)
- Grant camera permissions in browser
- Try different camera if multiple available

### QR Code Not Decrypting

- Verify encryption keys match exactly
- Check QR code generation script uses same keys
- Ensure no extra whitespace in keys

### Database Connection Failed

- Check MongoDB URI format
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Vercel Deployment Issues

- Check environment variables are set
- Review build logs in Vercel dashboard
- Ensure MongoDB URI is accessible from Vercel

## 💰 Cost Breakdown (FREE!)

- **Vercel**: Free tier (100GB bandwidth, unlimited requests)
- **MongoDB Atlas**: Free M0 tier (512MB storage)
- **Domain**: Free `.vercel.app` subdomain (custom domain optional)

Total: **$0/month** ✅

## 📈 Scaling Options

When you outgrow the free tier:

- **Vercel Pro**: $20/month (more bandwidth, team features)
- **MongoDB Atlas M10**: $0.08/hour (~$57/month) (2GB RAM, 10GB storage)
- **Custom Domain**: $10-15/year

## 🛠️ Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- MongoDB
- html5-qrcode
- Vercel Serverless Functions

## 📝 License

MIT

## 🤝 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for secure ticket management

# ipopevent
