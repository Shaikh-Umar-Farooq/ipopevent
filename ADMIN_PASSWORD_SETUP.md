# Admin Password Setup for QR Generator

## 🔒 Password Protection

The `/qr-generator` page is now password-protected to prevent unauthorized access.

---

## ✅ Setup Instructions

### Step 1: Add Password to `.env.local`

Add this line to your `.env.local` file:

```env
ADMIN_PASSWORD=your_secure_password_here
```

**Example:**
```env
ADMIN_PASSWORD=MySecurePass123!
```

### Step 2: Choose a Strong Password

✅ **Recommended:**
- At least 12 characters
- Mix of letters, numbers, and symbols
- Not easily guessable

❌ **Avoid:**
- Common words
- Sequential numbers (123456)
- Personal information

### Step 3: Deploy to Vercel

When deploying to Vercel, add the environment variable:

1. Go to Vercel Dashboard → Your Project
2. Go to Settings → Environment Variables
3. Add new variable:
   - **Name:** `ADMIN_PASSWORD`
   - **Value:** Your secure password
   - **Environment:** Production, Preview, Development
4. Click "Save"
5. Redeploy your app

---

## 🎯 How It Works

### Login Page

When accessing `/qr-generator`:
1. User sees a login form
2. Enter the admin password
3. If correct, access granted
4. Authentication stored in sessionStorage

### Features

✅ **Session-based auth:** Stays logged in during browser session  
✅ **Logout button:** Top right corner of QR Generator page  
✅ **Secure:** Password verified server-side via API  
✅ **Clean UI:** Professional login form with error messages  

---

## 📋 Complete `.env.local` File

Your `.env.local` should now include:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticket-scanner

# Encryption Keys
ENCRYPTION_KEY=your_32_character_encryption_key
ENCRYPTION_IV=your_16_char_iv

# Microsoft Graph API (Email)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
FROM_EMAIL=ticketing@ruskmedia.com

# Admin Password (NEW!)
ADMIN_PASSWORD=your_secure_password_here
```

---

## 🔧 Files Modified

### New Files:
- `/pages/api/verify-admin.ts` - API route for password verification
- `/ADMIN_PASSWORD_SETUP.md` - This documentation file

### Updated Files:
- `/pages/qr-generator.tsx`:
  - Added authentication state management
  - Added login form UI
  - Added logout button
  - Protected access to QR generator features

---

## 🧪 Testing

### Local Testing:

1. **Set password in `.env.local`:**
   ```env
   ADMIN_PASSWORD=testpass123
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Visit:** `http://localhost:3000/qr-generator`

4. **Login with:** `testpass123`

5. **You should see:**
   - ✅ Access granted
   - ✅ QR Generator page loads
   - ✅ Logout button in top right

---

## 🔐 Security Features

### What's Protected:
✅ `/qr-generator` page - Requires password  
✅ Password verified server-side - Cannot be bypassed  
✅ SessionStorage auth - Cleared on browser close  
✅ Logout functionality - Clears session  

### What's NOT Protected:
- `/` (Main QR scanner page) - Public access
- `/api/verify-qr` - Public (for scanning)
- `/api/mark-used` - Public (for marking entries)

---

## 🚨 Troubleshooting

### "Server configuration error"
**Problem:** `ADMIN_PASSWORD` not set in environment variables

**Solution:**
```bash
# Add to .env.local
ADMIN_PASSWORD=your_password_here

# Restart dev server
npm run dev
```

### "Invalid password" (but password is correct)
**Problem:** Trailing spaces or special characters

**Solution:**
```env
# Make sure no spaces around password
ADMIN_PASSWORD=MyPassword123  ← Wrong (space after)
ADMIN_PASSWORD=MyPassword123  ← Correct
```

### Can't access after refresh
**Problem:** SessionStorage cleared or browser closed

**Solution:**
- Just log in again with the password
- This is normal behavior for security

### Forgot password
**Problem:** Can't remember the password

**Solution:**
1. Check `.env.local` file locally
2. For production, check Vercel environment variables
3. Update if needed and redeploy

---

## 📱 User Experience

### Login Flow:
1. Visit `/qr-generator`
2. See centered login form with lock icon
3. Enter password
4. Click "🔓 Login" button
5. Redirected to QR Generator dashboard

### During Session:
- Full access to all features
- "Logout" button visible in top right
- Can paste data, generate QRs, send emails

### After Logout:
- Redirected back to login page
- Must re-enter password
- All data cleared from session

---

## 🎨 UI Features

### Login Page:
- 🔒 Lock icon
- Clean, centered design
- Dark mode support
- Error messages for wrong password
- Loading state while verifying
- Auto-focus on password field

### QR Generator Page:
- 🚪 Logout button (top right)
- All existing features accessible
- No change to functionality
- Just adds security layer

---

## ✅ Status: Implemented!

Your QR Generator page is now protected with password authentication.

**Next steps:**
1. ✅ Add `ADMIN_PASSWORD` to `.env.local`
2. ✅ Test login locally
3. ✅ Add password to Vercel environment variables
4. ✅ Deploy to production

**Share the password only with authorized team members!** 🔐

