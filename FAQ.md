# ❓ Frequently Asked Questions (FAQ)

---

## General Questions

### Q: Is this really free to deploy?
**A:** Yes! Both Vercel and MongoDB Atlas offer generous free tiers:
- **Vercel**: 100GB bandwidth/month, unlimited requests
- **MongoDB Atlas**: 512MB storage, shared cluster

This is perfect for small to medium events (up to ~1000 tickets).

---

### Q: Can I use this for commercial events?
**A:** Yes, the code is MIT licensed. You can use it for any purpose, including commercial events. Just ensure you comply with Vercel and MongoDB's terms of service.

---

### Q: Do I need a backend server?
**A:** No! This uses Vercel's serverless functions (API routes). No traditional server needed. Everything runs on Vercel's infrastructure.

---

### Q: What if I can't use MongoDB?
**A:** Alternatives:
- **Vercel Postgres** (free tier available)
- **Supabase** (PostgreSQL, free tier)
- **PlanetScale** (MySQL, has free tier)
- **Airtable** (via API)

You'll need to modify the database connection in `lib/mongodb.ts`.

---

## Technical Questions

### Q: Why AES-256-CBC encryption?
**A:** AES-256-CBC is a strong, widely-used encryption standard. It ensures:
- QR codes can't be forged without the encryption key
- Data in QR codes is secure even if intercepted
- Industry-standard security for sensitive data

---

### Q: Can someone reuse a QR code?
**A:** No. Once a ticket is marked as "used", subsequent scans will show "Already Used" status. The database tracks which tickets have been scanned.

---

### Q: What prevents someone from creating fake QR codes?
**A:** The encryption keys. Without knowing your `ENCRYPTION_KEY` and `ENCRYPTION_IV`, it's computationally infeasible to create valid QR codes. Keep these keys secret!

---

### Q: What data is stored in the QR code?
**A:** Only three pieces of data:
- `ticket_id` - The unique ticket identifier
- `email` - User's email address
- `ts` - Timestamp when QR was generated

All other data is fetched from the database when verifying.

---

### Q: Can I scan without internet?
**A:** No, an internet connection is required because:
- The app needs to verify tickets against the database
- Real-time updates prevent duplicate scans across multiple scanners

For offline scanning, you'd need a different architecture with local sync.

---

## Database Questions

### Q: How many tickets can I store?
**A:** MongoDB Atlas M0 (free tier) has 512MB storage. Approximate capacity:
- Each ticket document: ~500 bytes
- **Capacity**: ~1,000,000 tickets

You'll run out of network bandwidth before storage!

---

### Q: Can I export my ticket data?
**A:** Yes! In MongoDB Atlas:
1. Go to Browse Collections
2. Select your collection
3. Click "Export Collection"
4. Download as JSON or CSV

---

### Q: What if my database gets deleted?
**A:** MongoDB Atlas M0 includes:
- Daily snapshots (retained for 2 days)
- Point-in-time recovery

**Best practice**: Regularly export your data as backup.

---

## Security Questions

### Q: Is it safe to allow access from anywhere (0.0.0.0/0)?
**A:** For development and small events, yes. MongoDB still requires authentication (username/password). For production:
- Consider restricting to Vercel's IP ranges
- Use strong database passwords
- Enable 2FA on MongoDB Atlas

---

### Q: Should I change the default encryption keys?
**A:** **YES!** The example keys in the code should NEVER be used in production. Generate secure random keys:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```

---

### Q: Can someone scan tickets from another event?
**A:** No, because:
1. Each event should use different encryption keys
2. QR codes from Event A won't decrypt with Event B's keys
3. Even if decrypted, ticket IDs won't exist in Event B's database

---

### Q: What if someone steals my encryption keys?
**A:** If keys are compromised:
1. Generate new encryption keys
2. Regenerate ALL QR codes with new keys
3. Update `.env.local` and Vercel environment variables
4. Redeploy the application

This is why keeping keys secure is critical!

---

## Deployment Questions

### Q: How long does deployment take?
**A:** 
- First deployment: ~3-5 minutes
- Subsequent deployments: ~1-2 minutes

Vercel builds and deploys automatically when you push to GitHub.

---

### Q: Can I have multiple environments (dev/staging/prod)?
**A:** Yes! Vercel supports:
- **Production**: `main` branch → your-app.vercel.app
- **Preview**: Other branches → unique preview URLs
- Each can have different environment variables

---

### Q: What if Vercel's free tier isn't enough?
**A:** Upgrade to Vercel Pro ($20/month) for:
- More bandwidth
- Team collaboration
- Advanced analytics
- Priority support

---

## Scanning Questions

### Q: Does it work on all phones?
**A:** Works on:
- **iOS**: Safari 14+ (iPhone 6s and newer)
- **Android**: Chrome 90+ (most phones from 2017+)
- **Desktop**: Chrome, Firefox, Safari, Edge (with webcam)

Requires HTTPS (Vercel provides this automatically).

---

### Q: Can multiple people scan tickets at the same time?
**A:** Yes! The system is designed for concurrent scanning:
- Each scanner has their own instance
- Database handles concurrent updates
- First scan marks as used, subsequent scans see "Already Used"

---

### Q: What if the internet is slow at the venue?
**A:** The system is optimized for slow connections:
- Small payload sizes (QR scan → verify ~2KB data)
- Vercel's global CDN for fast response
- Consider testing connection at venue beforehand

---

### Q: Can I scan from a printed QR code?
**A:** Yes! QR codes can be:
- Printed on paper tickets
- Displayed on phone screens
- Embedded in emails
- Printed on badges/wristbands

---

### Q: What's the scanning accuracy?
**A:** Very high with proper QR generation:
- Error correction level H (30% damage recovery)
- 500x500px QR codes (clear scanning)
- Works in various lighting conditions

---

## Customization Questions

### Q: Can I change the design/colors?
**A:** Yes! The app uses Tailwind CSS. Edit:
- `pages/index.tsx` - Main page layout
- `components/TicketDisplay.tsx` - Ticket display design
- `styles/globals.css` - Global styles

---

### Q: Can I add more fields to tickets?
**A:** Yes! Just:
1. Add fields to MongoDB documents
2. Update `lib/types.ts` interface
3. Display in `components/TicketDisplay.tsx`

No changes needed to scanning/encryption.

---

### Q: Can I add authentication for scanners?
**A:** The current version has no authentication. To add it:
- Implement login page
- Add JWT or session authentication
- Protect API routes with middleware
- Track which user scanned which ticket

---

### Q: Can I send notifications when tickets are scanned?
**A:** Yes! Add to `pages/api/mark-used.ts`:
- Email notifications (using SendGrid, Resend, etc.)
- SMS notifications (using Twilio)
- Webhook to external system
- Real-time updates (using Pusher, Socket.io)

---

## Troubleshooting Questions

### Q: "Cannot read property 'tickets' of undefined"
**A:** Database connection issue. Check:
- `MONGODB_URI` is correct
- Database name is `ticket-scanner`
- Collection name is `tickets`
- Network access allows connections

---

### Q: "TypeError: Cannot read property 'id' of undefined" in QRScanner
**A:** Camera access issue. Check:
- Browser has camera permissions
- Site is HTTPS (Vercel provides this)
- Camera not in use by another app
- Try different browser

---

### Q: QR scan succeeds but shows "Ticket not found"
**A:** Mismatch between QR and database. Check:
- Ticket ID in QR matches database
- Encryption keys match in both places
- Ticket actually exists in MongoDB
- Database and collection names are correct

---

### Q: "Invalid QR code - decryption failed"
**A:** Encryption key mismatch. Check:
- Keys in `.env.local` match `generate-qr.js`
- No extra whitespace in keys
- Keys are exactly 32 and 16 characters (or padded)
- QR code was generated with current keys

---

## Performance Questions

### Q: How many scans per minute can it handle?
**A:** With free tier:
- **Vercel**: ~100 requests/second (far more than needed)
- **MongoDB M0**: ~100 operations/second
- **Realistic**: 10-20 simultaneous scanners easily

---

### Q: Will it work for large events (5000+ attendees)?
**A:** Yes, but consider:
- Upgrade MongoDB to M10+ for better performance
- Use Vercel Pro for more bandwidth
- Test load before event day
- Have multiple scanning stations

---

### Q: What's the scanning speed?
**A:** Typical flow:
1. QR detection: <1 second
2. API verification: 0.2-0.5 seconds
3. Database query: 0.1-0.3 seconds
4. Display result: <0.1 seconds

**Total**: ~1-2 seconds from scan to result

---

## Cost Questions

### Q: When would I need to upgrade?
**A:** Consider upgrading when:
- Event has >1000 attendees
- Need >512MB storage
- Want custom domain with branding
- Need team collaboration features
- Require priority support

---

### Q: What's the cost to scale up?
**A:** Approximate costs:
- **Vercel Pro**: $20/month
- **MongoDB M10**: ~$57/month (2GB RAM)
- **Custom Domain**: $10-15/year
- **Total**: ~$77/month + domain

Still very affordable for professional events!

---

## Integration Questions

### Q: Can I integrate with Stripe/payment systems?
**A:** Yes! When user completes payment:
1. Generate ticket_id and payment_id
2. Store in MongoDB
3. Generate QR code with ticket_id
4. Email QR to customer

---

### Q: Can I integrate with ticketing platforms?
**A:** Yes! Most ticketing platforms allow:
- Webhooks on ticket purchase
- API access to ticket data
- Custom QR code generation

You'd need to build a bridge between their system and yours.

---

### Q: Can I use this with existing ticket systems?
**A:** Yes! If you have existing tickets:
1. Export ticket data
2. Import to MongoDB (format as needed)
3. Generate QR codes for each ticket
4. Send QR codes to ticket holders

---

## Event Day Questions

### Q: What if the system goes down during the event?
**A:** Contingency plan:
1. Have backup: manual check-in list
2. Monitor Vercel status page
3. Check MongoDB Atlas status
4. Have IT support contact ready

Both Vercel and MongoDB have 99.9%+ uptime.

---

### Q: Should I test before the event?
**A:** **Absolutely!** Test checklist:
- [ ] Generate all QR codes
- [ ] Test scanning with team
- [ ] Verify multiple scanners work simultaneously
- [ ] Test mark entry functionality
- [ ] Check internet connection at venue
- [ ] Have backup device ready

---

### Q: Can I see real-time scan statistics?
**A:** Not built-in, but you can add:
- Query MongoDB for count of used tickets
- Build dashboard page
- Add analytics with Vercel Analytics
- Create real-time webhook to external dashboard

---

## Legal Questions

### Q: Is this GDPR compliant?
**A:** The code provides the foundation, but YOU are responsible for:
- Privacy policy
- Terms of service
- Data processing agreements
- User consent for data storage
- Right to deletion (implement in MongoDB)

Consult a legal professional for compliance.

---

### Q: Do I need terms & conditions?
**A:** Yes, you should have:
- Terms of service
- Privacy policy
- Data retention policy
- Contact information

Add these as separate pages in your app.

---

## Still Have Questions?

- Check the [README.md](./README.md) for detailed documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- See [API_REFERENCE.md](./API_REFERENCE.md) for API details
- Check [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for setup steps

**Can't find your answer?** Open an issue on GitHub with:
- Clear description of your question
- What you've tried
- Relevant error messages
- Your environment (OS, browser, etc.)

