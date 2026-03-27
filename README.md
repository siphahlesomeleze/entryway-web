# EntryWay - Professional CV Generator

Create professional CVs in 5 minutes. Built with Next.js, Claude AI, and PayFast payments.

---

## Setup (Step by Step)

### 1. Create GitHub Account
1. Go to [github.com](https://github.com)
2. Sign up (takes 5 minutes)
3. Create a new repository called `entryway-app`

### 2. Initialize and Push to GitHub

```bash
# Go to your project directory
cd entryway-app

# Initialize Git
git init
git add .
git commit -m "Initial EntryWay commit"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/entryway-app.git
git branch -M main
git push -u origin main
```

### 3. Get API Keys

#### Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to API Keys → Create Key
4. Copy and save it

#### PayFast Merchant Details
1. Go to [payfast.co.za](https://payfast.co.za)
2. Sign up as Merchant (need ID number, bank details)
3. Go to Settings → API
4. Copy:
   - Merchant ID
   - Merchant Key
   - Passphrase (set this yourself)
5. For testing: Use **Sandbox** mode first

### 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up (use GitHub account)
3. Click "Import Project"
4. Select your `entryway-app` GitHub repo
5. Click Import

**Configure Environment Variables in Vercel:**
- Go to Settings → Environment Variables
- Add each variable from `.env.local.example`:
  - `ANTHROPIC_API_KEY` = your Claude API key
  - `PAYFAST_MERCHANT_ID` = from PayFast
  - `PAYFAST_MERCHANT_KEY` = from PayFast
  - `PAYFAST_PASSPHRASE` = your passphrase
  - `PAYFAST_LIVE` = false (for testing)
  - `NEXT_PUBLIC_APP_URL` = your Vercel URL (e.g., entryway.vercel.app)

6. Click Deploy

Your site is now **LIVE** at `entryway.vercel.app`

---

## Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Create .env.local file (copy from .env.local.example)
cp .env.local.example .env.local

# Add your API keys to .env.local
# Edit with your actual keys

# Run development server
npm run dev

# Visit http://localhost:3000
```

---

## How It Works

### User Flow
1. User lands on homepage
2. Clicks "Start Creating"
3. Fills 6-step form
4. Clicks "Generate my CV"
5. Claude rewrites CV professionally
6. User sees preview
7. Clicks "Download for R79"
8. Redirected to PayFast payment
9. After payment → PDF downloads automatically

### Behind the Scenes
- **Form → API**: `page.jsx` sends form data to `/api/generate-cv`
- **AI Generation**: Claude Opus rewrites CV with action verbs, better structure
- **Payment**: `/api/payment` builds PayFast redirect
- **Callback**: `/api/payment-callback` verifies payment signature
- **PDF**: Browser downloads using html2pdf.js

---

## File Structure

```
entryway-app/
├── app/
│   ├── page.jsx              # Main React component (landing + form + preview)
│   ├── layout.jsx            # Next.js layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── generate-cv.js    # Claude API integration
│       ├── payment.js        # PayFast payment initiation
│       └── payment-callback.js # PayFast webhook
├── package.json
├── .env.local.example        # Environment variables template
└── README.md
```

---

## Testing PayFast Payment

### Sandbox Mode (Recommended First)
1. Set `PAYFAST_LIVE=false` in `.env.local`
2. Use PayFast Sandbox: [sandbox.payfast.co.za](https://sandbox.payfast.co.za)
3. Test with sandbox merchant details

### Test Card Details
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVC: Any 3 digits
- Email: Use any email

### Go Live
1. Set `PAYFAST_LIVE=true`
2. Use your live PayFast merchant details
3. Update `NEXT_PUBLIC_APP_URL` to your domain

---

## What's Included

✅ Landing page (responsive, mobile-first)
✅ 6-step form with validation
✅ Claude AI CV generation (action verbs, professional tone)
✅ CV preview with real-time rendering
✅ PDF download (html2pdf.js)
✅ PayFast payment integration (sandbox + live)
✅ Payment callback verification
✅ Environment variable setup
✅ Deployed on Vercel (instant scaling)

---

## Next Steps (Future Improvements)

- [ ] Store submissions in Supabase
- [ ] Send PDF via email after payment
- [ ] User dashboard (view past CVs)
- [ ] Multiple CV templates
- [ ] Analytics (conversion tracking)
- [ ] Cover letter generator
- [ ] LinkedIn integration

---

## Support

- **Claude API Issues**: [console.anthropic.com/docs](https://console.anthropic.com/docs)
- **PayFast Integration**: [payfast.co.za/documentation](https://payfast.co.za/documentation)
- **Vercel Deployment**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

## Pricing

- **Anthropic API**: ~R0.10 per CV generated (claude-opus-4-1)
- **Vercel**: Free tier covers you. ~$20/month for high traffic
- **PayFast**: 2.5% + R0.50 per transaction
  - On R79 sale: ~R76.50 to you

**Unit Economics**
- Revenue per CV: R79.00
- Cost (API + payment): ~R2.50
- **Gross margin: 96.8%**

---

## Launch Checklist

- [ ] GitHub account created
- [ ] Anthropic API key obtained
- [ ] PayFast merchant account set up
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Environment variables added to Vercel
- [ ] Site deployed and live
- [ ] PayFast Sandbox tested
- [ ] PayFast Live enabled
- [ ] Domain configured (optional)
- [ ] DNS pointed to Vercel

---

Build fast. Ship today. Iterate tomorrow.
