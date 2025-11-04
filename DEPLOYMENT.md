# 🚀 Deployment Guide

Step-by-step guide to deploy your QR Ticket Scanner to Vercel with MongoDB Atlas.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] MongoDB Atlas account (sign up at mongodb.com/cloud/atlas)

---

## Part 1: Set Up MongoDB Atlas (5 minutes)

### Step 1: Create MongoDB Account & Cluster

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Select "Create a deployment"
4. Choose **M0 FREE** tier
5. Select a cloud provider and region (closest to your users)
6. Name your cluster (e.g., "ticket-scanner-cluster")
7. Click "Create"

### Step 2: Create Database User

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., `scanner-admin`)
5. Click "Autogenerate Secure Password" - **SAVE THIS PASSWORD**
6. Set "Database User Privileges" to "Read and write to any database"
7. Click "Add User"

### Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ This is fine for development/free tier
   - For production, you can restrict to Vercel's IP ranges
4. Click "Confirm"

### Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `ticket-scanner`

Example:
```
mongodb+srv://scanner-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ticket-scanner?retryWrites=true&w=majority
```

### Step 5: Create Database & Collection

1. Click "Browse Collections"
2. Click "Add My Own Data"
3. Database name: `ticket-scanner`
4. Collection name: `tickets`
5. Click "Create"

### Step 6: Add Sample Data

1. Click on the `tickets` collection
2. Click "INSERT DOCUMENT"
3. Paste this sample document:

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

4. Click "Insert"
5. Repeat for more sample tickets (see `scripts/sample-data.js`)

---

## Part 2: Deploy to Vercel (5 minutes)

### Step 1: Prepare Repository

```bash
# Navigate to project
cd /Users/admin/Documents/ipoplive2

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - QR Scanner App"
```

### Step 2: Push to GitHub

1. Go to https://github.com/new
2. Create a new repository (e.g., "qr-ticket-scanner")
3. Don't initialize with README (we already have one)
4. Copy the commands and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/qr-ticket-scanner.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to https://vercel.com/login
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

### Step 4: Add Environment Variables

In the Vercel deployment screen, expand "Environment Variables":

Add these three variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your MongoDB connection string from Part 1 |
| `ENCRYPTION_KEY` | `your_32_character_encryption_key_change_this` |
| `ENCRYPTION_IV` | `your_16_char_iv` |

⚠️ **CRITICAL**: The encryption keys MUST match your QR generation script!

### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Click "Visit" to see your live site!

Your site will be at: `https://your-project-name.vercel.app`

---

## Part 3: Generate QR Codes

### Step 1: Install QR Code Dependencies

In a separate directory (or your backend), install:

```bash
npm install qrcode crypto
```

### Step 2: Configure Encryption Keys

Edit `scripts/generate-qr.js` and set the SAME keys as in Vercel:

```javascript
const ENCRYPTION_KEY = 'your_32_character_encryption_key_change_this';
const ENCRYPTION_IV = 'your_16_char_iv';
```

### Step 3: Generate QR Codes

```bash
node scripts/generate-qr.js
```

QR codes will be saved in `scripts/qr-codes/`

---

## Part 4: Test Your Deployment

### Step 1: Test with Mobile Device

1. Open your Vercel URL on your phone: `https://your-project-name.vercel.app`
2. Click "Start Scanning"
3. Grant camera permission
4. Scan one of the generated QR codes

### Step 2: Expected Flow

1. **Valid Ticket**: Shows green screen with ticket details and "Mark Entry" button
2. Click "Mark Entry"
3. Rescan the same QR code
4. **Used Ticket**: Shows yellow screen with "Already Used" message

### Step 3: Test Invalid Ticket

Try scanning a random QR code (not generated by your script):
- Should show "Invalid QR code - decryption failed"

---

## 🎉 You're Done!

Your QR Scanner is now live and ready to use!

### Next Steps

- [ ] Change encryption keys to something secure
- [ ] Add more tickets to MongoDB
- [ ] Share the Vercel URL with your team
- [ ] Generate QR codes for real events
- [ ] Optional: Add custom domain in Vercel settings

---

## 🔧 Troubleshooting

### "Cannot connect to database"

- Check MongoDB connection string format
- Verify password is correct (no special characters unencoded)
- Ensure IP whitelist includes 0.0.0.0/0
- Check database name is "ticket-scanner"

### "Camera not working"

- HTTPS is required (Vercel provides this automatically)
- Grant camera permissions in browser
- Try Chrome/Safari (best compatibility)
- Clear browser cache and reload

### "Invalid QR code"

- Verify encryption keys match exactly in:
  - Vercel environment variables
  - QR generation script
- Check for extra spaces or line breaks in keys
- Regenerate QR codes with correct keys

### Build Fails on Vercel

- Check `package.json` dependencies
- Review build logs in Vercel dashboard
- Ensure `next.config.js` is correct
- Try deploying again (sometimes transient issues)

---

## 📊 Monitoring Usage

### View Logs

In Vercel Dashboard:
1. Go to your project
2. Click "Logs" tab
3. See real-time requests and errors

### View Database

In MongoDB Atlas:
1. Go to "Browse Collections"
2. View `tickets` collection
3. See which tickets are marked as used

---

## 💰 Free Tier Limits

### Vercel Free Tier
- 100GB bandwidth/month
- Unlimited requests
- 100 deployments/day
- Serverless function execution: 100GB-hours

### MongoDB Atlas M0 Free Tier
- 512MB storage
- Shared RAM
- ~500 connections/day
- Perfect for testing and small events

### When to Upgrade

Upgrade when:
- Event has >1000 attendees
- Need more than 512MB storage
- Need dedicated support
- Want custom domain with SSL

---

## 🔒 Security Best Practices

1. **Change Default Keys**: Never use example encryption keys in production
2. **Restrict MongoDB Access**: In production, whitelist specific IPs
3. **Enable Rate Limiting**: Add rate limiting middleware
4. **Monitor Logs**: Regularly check for suspicious activity
5. **Backup Database**: Set up automated backups in MongoDB Atlas
6. **Use Environment Variables**: Never commit secrets to Git

---

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review Vercel documentation: https://vercel.com/docs
- MongoDB Atlas documentation: https://docs.atlas.mongodb.com
- Open an issue on GitHub

