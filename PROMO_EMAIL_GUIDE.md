# 📧 Promotional Email Feature

## Overview

The **Promotional Email** feature allows you to send marketing/promotional emails with an embedded image to multiple recipients at once. Perfect for event announcements, updates, and promotional campaigns.

---

## ✨ Features

✅ **Multiple Recipients** - Send to unlimited email addresses  
✅ **Embedded Image** - Image appears directly in email (not as attachment)  
✅ **Email Client Compatible** - Works with Gmail, Outlook, Yahoo, and all major clients  
✅ **One-by-One Sending** - Emails sent individually to avoid spam filters  
✅ **Progress Tracking** - Real-time progress indicator  
✅ **Error Handling** - Shows which emails succeeded/failed  
✅ **Email Validation** - Validates email format before sending  

---

## 🚀 How to Use

### Step 1: Access the Feature

1. Go to `/qr-generator` page
2. Login with admin password
3. Click **📧 Send Promo Email** button (pink color)

### Step 2: Add Recipients

1. Modal opens with email input field
2. Enter email addresses in any of these formats:
   - Comma-separated: `email1@test.com, email2@test.com`
   - Semicolon-separated: `email1@test.com; email2@test.com`
   - Line-by-line:
     ```
     email1@test.com
     email2@test.com
     email3@test.com
     ```
3. Click **➕ Add Emails** button
4. Emails appear in the recipients list

### Step 3: Review Recipients

- View all added recipients in the list
- Remove any email by clicking the ❌ button
- Add more emails if needed
- Total recipient count shown: "Recipients (10)"

### Step 4: Send Emails

1. Click **📧 Send to X Recipients** button
2. Confirm the action in the popup
3. Watch progress bar as emails are sent
4. Success message shows when complete

---

## 📧 Email Details

### Email Content

**Subject:**  
`i-Popstar Live - Special Announcement`

**From:**  
`ticketing@ruskmedia.com`

**Content:**  
- Promotional image (embedded using Content-ID)
- Footer with event branding
- Responsive design for mobile/desktop

### Email Structure

```html
<!DOCTYPE html>
<html>
<body>
  <div class="container">
    <!-- Embedded Promotional Image -->
    <img src="cid:lineup" alt="i-Popstar Live" />
    
    <!-- Footer -->
    <div class="footer">
      <p>This is a promotional email from i-Popstar Live.</p>
      <p>© 2025 i-Popstar Live. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### Image Specifications

**Source File:**  
`/scripts/Emailer.jpg`

**File Size:**  
152 KB (optimized for email)

**Delivery Method:**  
Embedded using CID (Content-ID) attachment

**Display:**  
- Width: 100% (max 600px)
- Height: Auto (maintains aspect ratio)
- Responsive on all devices

---

## 🎯 Use Cases

### 1. Event Announcement

**Scenario:** Announce event details to interested attendees

**Usage:**
1. Collect email addresses from website/social media
2. Paste into promo email modal
3. Send announcement to all

### 2. Last-Minute Updates

**Scenario:** Venue change or schedule update

**Usage:**
1. Use existing attendee email list
2. Send updated information quickly
3. Track delivery success

### 3. Post-Event Follow-up

**Scenario:** Thank attendees, share photos/videos

**Usage:**
1. Export attendee emails from database
2. Send thank you email with highlights
3. Include links to photo galleries

### 4. Early Bird Promotions

**Scenario:** Offer early bird tickets to subscribers

**Usage:**
1. Segment email list (subscribers only)
2. Send exclusive promo email
3. Drive ticket sales

---

## 📊 Progress Tracking

### Real-Time Progress Bar

While sending, you'll see:
- Current status: "Sending... 5 / 10"
- Progress bar: Visual indicator (50%)
- Percentage complete: "50%"

### Success Summary

After completion:
```
✅ Successfully sent to all 10 recipients!
```

Or if some failed:
```
✅ Sent to 8 recipients. 2 failed.
```

### Error Details

Failed emails are logged with reason:
- `user@example.com: Invalid email address`
- `user2@example.com: Mailbox full`

---

## 🔧 Technical Details

### API Endpoint

**POST** `/api/send-promo-email`

**Request Body:**
```json
{
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully sent to all 3 recipients",
  "sent": 3,
  "failed": 0,
  "total": 3,
  "errors": []
}
```

### Email Sending Flow

1. **Load Image**
   - Read `/scripts/Emailer.jpg`
   - Convert to Base64
   - Log file size

2. **Generate HTML**
   - Create responsive email template
   - Reference image via CID
   - Add footer

3. **Send via Microsoft Graph API**
   - Authenticate with Azure AD
   - Send from `ticketing@ruskmedia.com`
   - Attach image as CID attachment
   - Set `isInline: true` for display

4. **Rate Limiting**
   - 500ms delay between sends
   - Prevents API throttling
   - Avoids spam filters

5. **Error Handling**
   - Continue on individual failures
   - Track success/failure counts
   - Return detailed error messages

---

## 🔒 Security Features

### Access Control

✅ **Password Protected** - Must login to `/qr-generator`  
✅ **Admin Only** - No public access  
✅ **Session-Based** - Auth stored in sessionStorage  

### Email Validation

✅ **Format Check** - Validates email regex  
✅ **Duplicate Prevention** - Removes duplicate emails  
✅ **Invalid Rejection** - Won't send to malformed addresses  

### Rate Limiting

✅ **500ms Delay** - Between each email send  
✅ **One-by-One** - Sequential sending  
✅ **API Throttling** - Respects Microsoft Graph limits  

---

## 💡 Best Practices

### 1. Optimize Email List

**Do:**
- ✅ Remove duplicates before sending
- ✅ Verify email validity
- ✅ Segment by interest/region
- ✅ Keep lists up-to-date

**Don't:**
- ❌ Send to purchased lists
- ❌ Include invalid emails
- ❌ Send too frequently
- ❌ Ignore unsubscribe requests

### 2. Timing

**Best Times:**
- Tuesday-Thursday: 10 AM - 2 PM
- Avoid weekends
- Avoid late nights
- Consider time zones

### 3. Content

**Keep It:**
- ✅ Visual (image-focused)
- ✅ Concise (one message)
- ✅ Mobile-friendly (responsive)
- ✅ Professional (good design)

### 4. Testing

Before mass sending:
1. Send test to yourself
2. Check Gmail display
3. Check Outlook display
4. Verify mobile view
5. Test links (if any)

---

## 🚨 Troubleshooting

### "Promotional image not found"

**Problem:** Image file missing or wrong path

**Solution:**
```bash
# Verify file exists
ls -lh scripts/Emailer.jpg

# Should show: 152K file size
```

### "Failed to send to all recipients"

**Problem:** Microsoft Graph API issues

**Solution:**
1. Check Azure AD credentials in `.env.local`
2. Verify `FROM_EMAIL` is correct
3. Check API permissions (Mail.Send)
4. Review error messages for details

### "Some emails failed"

**Problem:** Individual recipient issues

**Solution:**
- Check error details in response
- Verify email addresses are valid
- Some mailboxes may be full/inactive
- Retry failed emails separately

### Image not displaying in email

**Problem:** Email client blocking images

**Solution:**
- Gmail: Images should auto-display
- Outlook: Check "Download pictures" setting
- Some clients block by default
- CID attachment should work universally

---

## 📈 Email Statistics

### Delivery Rate

Expected: **95-99%** delivery success  
Factors affecting delivery:
- Valid email addresses
- Not marked as spam
- Mailbox not full
- Domain not blacklisted

### Open Rate (Industry Average)

- Event invitations: 40-50%
- Promotional: 20-30%
- Follow-ups: 15-25%

**Note:** This tool sends emails but doesn't track opens/clicks.

---

## 🔄 Future Enhancements

Potential features to add:

1. **Email Templates**
   - Multiple promotional images
   - Customizable content
   - Subject line editor

2. **CSV Import**
   - Upload CSV file with emails
   - Bulk import from file
   - Field mapping

3. **Scheduled Sending**
   - Schedule for later
   - Time zone aware
   - Queue management

4. **Analytics**
   - Track opens
   - Track clicks
   - Delivery reports

5. **Unsubscribe Management**
   - Unsubscribe link
   - Preference center
   - Compliance (GDPR, CAN-SPAM)

---

## 📝 Files Modified/Created

### New Files:
- `/components/PromoEmailModal.tsx` - Modal UI component
- `/pages/api/send-promo-email.ts` - API route for sending
- `/PROMO_EMAIL_GUIDE.md` - This documentation

### Updated Files:
- `/pages/qr-generator.tsx`:
  - Added "Send Promo Email" button
  - Integrated PromoEmailModal
  - Added state management

### Required Files:
- `/scripts/Emailer.jpg` - Promotional image (152 KB)

---

## ✅ Feature Status: Ready!

Your promotional email feature is fully implemented and ready to use!

**What's included:**
- ✅ Modal UI for email management
- ✅ API endpoint for sending
- ✅ Image embedding (CID)
- ✅ Progress tracking
- ✅ Error handling
- ✅ Email validation
- ✅ Microsoft Graph integration

**Next steps:**
1. Test with your own email first
2. Send to small group (5-10 emails)
3. Verify display in Gmail/Outlook
4. Use for promotional campaigns

**Happy emailing!** 📧🎉

