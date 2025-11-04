# 📋 Paste Data Feature - User Guide

## ✨ New Feature: Direct Data Import

You can now paste data directly from SharePoint Excel into the admin dashboard!

---

## 🚀 How to Use

### Step 1: Open SharePoint Excel
1. Go to your SharePoint Excel sheet
2. You'll see columns: `payment_id`, `Name`, `Email Id`, `Type`

### Step 2: Copy Data
1. Select all the data rows (including or excluding headers - both work!)
2. Copy with `Ctrl+C` (Windows) or `Cmd+C` (Mac)

Example data:
```
payment_id      Name            Email Id                Type
PAY-001        John Doe        john.doe@example.com    VIP
PAY-002        Jane Smith      jane.smith@example.com  General
PAY-003        Bob Johnson     bob.j@example.com       VIP
```

### Step 3: Paste into Dashboard
1. Go to http://localhost:3000/qr-generator (or your deployed URL)
2. Click the **📋 Paste Data** button (purple button on the left)
3. A modal will open

### Step 4: Paste Your Data
1. Click in the text area
2. Paste with `Ctrl+V` (Windows) or `Cmd+V` (Mac)
3. Data will automatically be parsed and shown as a table preview

### Step 5: Review Preview
- See all rows in a nice table format
- Check that payment IDs, names, emails, and types are correct
- If something's wrong, click "← Paste Different Data" to start over

### Step 6: Upload
1. Click **📤 Upload X Tickets** button
2. Wait for upload to complete (~1-2 seconds)
3. Success message will appear
4. Data is now in MongoDB and ready for QR generation!

---

## 📸 Visual Guide

```
┌─────────────────────────────────────────────────┐
│ 🎫 QR Code Generator & Email Sender            │
│                                                  │
│ [📋 Paste Data] [🔄 Refresh] [✉️ Generate]    │ ← Click here!
│                                                  │
└─────────────────────────────────────────────────┘

↓ Modal Opens ↓

┌─────────────────────────────────────────────────┐
│ 📋 Import Ticket Data                           │
│ Copy and paste data from SharePoint Excel       │
├─────────────────────────────────────────────────┤
│ 📝 Instructions:                                │
│ 1. Open SharePoint Excel                        │
│ 2. Select data (payment_id, name, email, type)  │
│ 3. Copy (Ctrl+C)                                │
│ 4. Paste below (Ctrl+V)                         │
│ 5. Review preview and click Upload              │
│                                                  │
│ ┌─────────────────────────────────────────┐    │
│ │ Paste your Excel data here...           │    │
│ │                                         │    │
│ │ [Paste or type data]                    │    │
│ │                                         │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ [Cancel]              [📤 Upload X Tickets]     │
└─────────────────────────────────────────────────┘
```

After pasting:

```
┌─────────────────────────────────────────────────┐
│ Preview (3 rows)      ← Paste Different Data    │
├──┬──────────┬──────────┬───────────────┬───────┤
│# │Payment ID│Name      │Email          │Type   │
├──┼──────────┼──────────┼───────────────┼───────┤
│1 │PAY-001   │John Doe  │john@exam.com  │[VIP]  │
│2 │PAY-002   │Jane Smith│jane@exam.com  │[Gen]  │
│3 │PAY-003   │Bob John  │bob@exam.com   │[VIP]  │
└──┴──────────┴──────────┴───────────────┴───────┘

            [Cancel]  [📤 Upload 3 Tickets]
```

---

## 🎯 Supported Formats

### Tab-Separated (From Excel)
```
PAY-001    John Doe    john@example.com    VIP
PAY-002    Jane Smith    jane@example.com    General
```

### Comma-Separated (CSV)
```
PAY-001,John Doe,john@example.com,VIP
PAY-002,Jane Smith,jane@example.com,General
```

### With Headers (Automatically Skipped)
```
payment_id    Name    Email Id    Type
PAY-001    John Doe    john@example.com    VIP
PAY-002    Jane Smith    jane@example.com    General
```

---

## ✅ Features

### Smart Parsing
- ✅ Automatically detects tabs or commas
- ✅ Skips header rows
- ✅ Trims whitespace
- ✅ Handles multiple rows at once

### Preview Before Upload
- ✅ See all data in table format
- ✅ Verify correctness before uploading
- ✅ Edit by re-pasting if needed

### Database Handling
- ✅ New entries are inserted
- ✅ Existing entries are updated (by payment_id)
- ✅ Prevents duplicates
- ✅ Shows count of inserted/updated

### User Friendly
- ✅ Clear instructions
- ✅ Visual feedback
- ✅ Error messages if parsing fails
- ✅ Success confirmation

---

## 🐛 Troubleshooting

### "No valid data found"
**Cause**: Data format is incorrect

**Solution**: Ensure you have 4 columns:
1. payment_id
2. name
3. email
4. type

### Data looks scrambled
**Cause**: Mixed tabs and commas

**Solution**: 
- Copy directly from Excel (preserves tabs)
- Or save as CSV and copy from there

### Some rows missing
**Cause**: Empty rows or incomplete data

**Solution**: 
- Check source data has all 4 fields
- Remove empty rows from Excel before copying

### Upload fails
**Cause**: MongoDB connection issue

**Solution**:
- Check MongoDB URI in `.env.local`
- Verify server is running
- Check Vercel logs if deployed

---

## 💡 Tips & Best Practices

### 1. Always Review Preview
Don't blindly upload - check the preview table to ensure data parsed correctly.

### 2. Start Small
Test with 2-3 rows first, then do bulk upload.

### 3. Keep Headers Simple
If including headers, use: `payment_id`, `Name`, `Email Id`, `Type`

### 4. Use Consistent Format
Always copy from the same source (Excel) for consistency.

### 5. Check Email Formats
Make sure emails are valid before uploading.

---

## 📊 Workflow Integration

### Complete Workflow:

```
SharePoint Excel
      ↓ [Copy]
Paste Data Modal
      ↓ [Parse & Preview]
Review Table
      ↓ [Upload]
MongoDB Database
      ↓ [Refresh]
Dashboard Shows New Data
      ↓ [Generate & Send]
QR Codes Sent via Email
```

---

## 🎨 Button Colors

- **📋 Paste Data** - Purple (Import data)
- **🔄 Refresh Data** - Blue (Reload from DB)
- **✉️ Generate & Send** - Green (Send emails)

---

## ⚡ Quick Example

1. Open SharePoint → Select data → Copy
2. Click **📋 Paste Data**
3. Paste in the text area
4. See preview table
5. Click **📤 Upload**
6. Done! Data is now in your system

**Time**: ~30 seconds for 100 tickets!

---

## 🎉 Benefits

### Before (Manual Script)
- Copy data to JS file
- Run script from terminal
- Multiple steps
- Technical knowledge needed

### After (Paste Feature)
- Copy from Excel
- Paste in UI
- Click Upload
- Non-technical friendly ✅

---

## 🔒 Security

- ✅ Data validated before upload
- ✅ Duplicate prevention (by payment_id)
- ✅ Admin-only access (/qr-generator page)
- ✅ Server-side processing
- ✅ No data stored in browser

---

**Your paste data feature is ready to use!** 📋✨

Just copy from SharePoint and paste directly into the dashboard. No more manual scripts needed!

