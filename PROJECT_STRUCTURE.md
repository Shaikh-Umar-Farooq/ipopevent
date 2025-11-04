# 📁 Project Structure

Complete overview of the QR Ticket Scanner project structure.

```
ipoplive2/
├── 📄 Configuration Files
│   ├── package.json              # Project dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── vercel.json               # Vercel deployment configuration
│   ├── .gitignore                # Git ignore rules
│   ├── .env.example              # Environment variables template
│   └── .env.local                # Local environment variables (create this!)
│
├── 📚 Documentation
│   ├── README.md                 # Main project documentation
│   ├── DEPLOYMENT.md             # Step-by-step deployment guide
│   ├── QUICK_START.md            # 10-minute quick start guide
│   ├── API_REFERENCE.md          # Complete API documentation
│   ├── PROJECT_STRUCTURE.md      # This file
│   └── scripts/
│       └── mongodb-setup.md      # MongoDB database setup guide
│
├── 🎨 Frontend (Pages & Components)
│   ├── pages/
│   │   ├── _app.tsx              # Next.js app wrapper
│   │   ├── index.tsx             # Main scanner page
│   │   └── api/                  # API routes (serverless functions)
│   │       ├── verify-qr.ts      # Verify QR code endpoint
│   │       └── mark-used.ts      # Mark ticket as used endpoint
│   │
│   ├── components/
│   │   ├── QRScanner.tsx         # QR code scanner component
│   │   └── TicketDisplay.tsx     # Ticket details display component
│   │
│   └── styles/
│       └── globals.css           # Global CSS styles
│
├── 🔧 Backend Logic (Lib)
│   └── lib/
│       ├── mongodb.ts            # MongoDB connection handler
│       ├── encryption.ts         # AES-256-CBC encryption/decryption
│       └── types.ts              # TypeScript type definitions
│
├── 📱 QR Code Generation
│   └── scripts/
│       ├── generate-qr.js        # QR code generator script
│       ├── sample-data.js        # Sample MongoDB data
│       ├── package.json          # Dependencies for QR generation
│       └── qr-codes/             # Generated QR codes (created when running script)
│           ├── TKT-001-ABC123.png
│           ├── TKT-002-DEF456.png
│           └── TKT-003-GHI789.png
│
└── 🌐 Public Assets
    └── public/
        └── favicon.ico           # Site favicon
```

---

## 📂 Directory Descriptions

### `/pages` - Next.js Pages & API Routes
- **Purpose**: Main application pages and serverless API endpoints
- **Key Files**:
  - `index.tsx`: Main QR scanner interface
  - `api/verify-qr.ts`: Decrypt and validate QR codes
  - `api/mark-used.ts`: Mark tickets as used in database

### `/components` - React Components
- **Purpose**: Reusable UI components
- **Key Files**:
  - `QRScanner.tsx`: Camera-based QR code scanner
  - `TicketDisplay.tsx`: Display ticket information and status

### `/lib` - Backend Utilities
- **Purpose**: Server-side logic and utilities
- **Key Files**:
  - `mongodb.ts`: Database connection pooling
  - `encryption.ts`: Encryption/decryption functions
  - `types.ts`: Shared TypeScript interfaces

### `/scripts` - QR Code Generation
- **Purpose**: Generate encrypted QR codes for tickets
- **Key Files**:
  - `generate-qr.js`: Main QR generation script
  - `sample-data.js`: Sample MongoDB documents
  - `mongodb-setup.md`: Database setup instructions

### `/styles` - Styling
- **Purpose**: Global styles and Tailwind CSS
- **Key Files**:
  - `globals.css`: Global CSS with Tailwind imports

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    QR CODE GENERATION                        │
│  (Run locally with scripts/generate-qr.js)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
                    Encrypted QR Code
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    TICKET SCANNING                           │
│  1. Camera scans QR code                                    │
│  2. Send encrypted data to /api/verify-qr                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERIFICATION API                          │
│  1. Decrypt using lib/encryption.ts                         │
│  2. Extract ticket_id and email                             │
│  3. Query MongoDB via lib/mongodb.ts                        │
│  4. Check if ticket exists and not used                     │
│  5. Return status: valid/used/invalid                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DISPLAY RESULTS                           │
│  - Show ticket details in TicketDisplay component           │
│  - Display "Mark Entry" button if valid                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    MARK AS USED                              │
│  1. User clicks "Mark Entry"                                │
│  2. POST to /api/mark-used with payment_id                  │
│  3. Update MongoDB: set used=true, used_at=now()            │
│  4. Update UI to show "Already Used" status                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌──────────────┐    AES-256-CBC     ┌──────────────┐
│   QR Code    │ ←─────────────────→ │   Backend    │
│  (Encrypted) │    Same Keys       │   Decrypt    │
└──────────────┘                     └──────────────┘
                                             │
                                             ↓
                                     ┌──────────────┐
                                     │   MongoDB    │
                                     │   (Verify)   │
                                     └──────────────┘
```

**Key Security Features**:
1. QR codes contain encrypted data (AES-256-CBC)
2. Encryption keys stored in environment variables
3. Database credentials never exposed to client
4. HTTPS enforced by Vercel
5. Serverless functions isolate backend logic

---

## 📦 Dependencies

### Production Dependencies
```json
{
  "next": "^14.0.4",              // React framework
  "react": "^18.2.0",             // UI library
  "react-dom": "^18.2.0",         // React DOM renderer
  "html5-qrcode": "^2.3.8",       // QR code scanner
  "mongodb": "^6.3.0",            // MongoDB driver
  "crypto-browserify": "^3.12.0"  // Crypto polyfill
}
```

### Development Dependencies
```json
{
  "typescript": "^5.3.3",         // TypeScript compiler
  "tailwindcss": "^3.4.0",        // CSS framework
  "autoprefixer": "^10.4.16",     // CSS vendor prefixes
  "postcss": "^8.4.32"            // CSS processing
}
```

### QR Generation Dependencies (scripts/)
```json
{
  "qrcode": "^1.5.3"              // QR code generation
}
```

---

## 🌍 Environment Variables

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |
| `ENCRYPTION_KEY` | AES encryption key | `32_character_key_here_123456789` |
| `ENCRYPTION_IV` | AES initialization vector | `16_char_iv_here` |

### Where to Set

1. **Local Development**: `.env.local` (create from `.env.example`)
2. **Production (Vercel)**: Vercel Dashboard → Project → Settings → Environment Variables
3. **QR Generation**: `scripts/generate-qr.js` (hardcoded)

---

## 🚀 Deployment Files

### Vercel
- `vercel.json` - Deployment configuration
- `.env.local` - Local environment (not deployed)
- Environment variables set in Vercel dashboard

### Git
- `.gitignore` - Prevents committing sensitive files:
  - `.env.local`
  - `node_modules/`
  - `.next/`
  - `scripts/qr-codes/`

---

## 📊 File Sizes (Approximate)

| Component | Size | Notes |
|-----------|------|-------|
| Next.js Build | ~500KB | Optimized for production |
| QR Scanner Library | ~150KB | html5-qrcode |
| MongoDB Driver | ~5MB | Server-side only |
| Total Bundle (Client) | ~650KB | Fast load times |

---

## 🔄 Build Process

```bash
npm run dev    # Development server (hot reload)
npm run build  # Production build
npm run start  # Production server (local)
```

### Build Output
```
.next/
├── static/              # Static assets
├── server/              # Server-side code
│   └── pages/
│       └── api/         # API routes (serverless functions)
└── cache/               # Build cache
```

---

## 📝 File Naming Conventions

- **Pages**: `kebab-case.tsx` (e.g., `verify-ticket.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `QRScanner.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `mongodb.ts`)
- **Types**: `types.ts` or `*.types.ts`
- **Docs**: `SCREAMING_SNAKE_CASE.md` (e.g., `README.md`)

---

## 🧪 Testing Structure (Future)

Recommended structure for adding tests:

```
ipoplive2/
├── __tests__/
│   ├── components/
│   │   ├── QRScanner.test.tsx
│   │   └── TicketDisplay.test.tsx
│   ├── lib/
│   │   ├── encryption.test.ts
│   │   └── mongodb.test.ts
│   └── api/
│       ├── verify-qr.test.ts
│       └── mark-used.test.ts
└── jest.config.js
```

---

## 📱 Mobile Compatibility

### Browser Requirements
- **iOS**: Safari 14+ (camera access)
- **Android**: Chrome 90+ (camera access)
- **Desktop**: Chrome, Firefox, Safari, Edge (latest)

### PWA Support (Future Enhancement)
Add `manifest.json` for Progressive Web App:
```
public/
├── manifest.json
└── icons/
    ├── icon-192x192.png
    └── icon-512x512.png
```

---

## 🔧 Development Tools

### Recommended VSCode Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens

### Useful Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type checking
npx tsc --noEmit

# Lint code
npm run lint

# Generate QR codes
cd scripts && npm install && node generate-qr.js
```

---

## 📈 Scalability Considerations

### Current Architecture (Free Tier)
- **Frontend**: Vercel Edge Network (global CDN)
- **Backend**: Serverless functions (auto-scale)
- **Database**: MongoDB Atlas M0 (shared cluster)

### Scaling Options
1. **More Traffic**: Upgrade Vercel plan
2. **More Data**: Upgrade MongoDB to M10+
3. **More Features**: Add caching (Redis/Vercel KV)
4. **Analytics**: Add Vercel Analytics or custom tracking

---

For questions about the project structure, see the main [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md).

