# Deploy Budget Master landing page to Vercel

This folder is a **static project page** for recruiters and portfolio visitors — not the mobile app itself.

**Live site (after deploy):** `https://your-project.vercel.app`

## What's included

- Hero with app screenshot and tech stack
- Feature highlights
- On-track progress formula
- **App demo video** (`assets/budget-master-quick-flow.mov`) in a phone frame
- Architecture overview
- GitHub link

## Deploy to Vercel (recommended)

### Option A: Vercel Dashboard

1. Push this repo to GitHub: `https://github.com/asanmiguel12/BudgetMaster`
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the **BudgetMaster** repository
4. Set **Root Directory** to `landing`
5. Framework Preset: **Other** (static — no build command)
6. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
cd landing
vercel
```

Follow prompts. For production:

```bash
vercel --prod
```

## Custom domain (optional)

In Vercel → Project → Settings → Domains, add e.g. `budgetmaster.vercel.app` or your own domain.

## Demo video

The demo section plays `assets/budget-master-quick-flow.mov` (screen recording of the full app flow). For maximum browser support on Windows Chrome/Firefox, optionally convert to MP4 with ffmpeg and add a second `<source type="video/mp4">` in `index.html`.

## Update links

- GitHub: already points to `asanmiguel12/BudgetMaster`
- App Store: replace "coming soon" in `index.html` when you publish

## Local preview

```bash
cd landing
npx serve .
# or: python3 -m http.server 8080
```

Open `http://localhost:8080`
