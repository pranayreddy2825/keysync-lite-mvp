# Vercel Deployment Guide for KeySync Lite

This guide will help you deploy KeySync Lite to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier works)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Environment Variables**: You'll need your API keys ready

## Step-by-Step Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Your Repository**
   - Click "Import Project"
   - Select your GitHub repository: `keysync-lite-mvp`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Leave as "Other" (we have custom config)
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: Leave empty (Vercel will use vercel.json)
   - **Output Directory**: Leave empty (Vercel will use vercel.json)
   - **Install Command**: `npm install && cd client && npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   QDRANT_URL=your_qdrant_url_here
   QDRANT_API_KEY=your_qdrant_api_key_here
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked about settings, accept defaults
   - Add environment variables when prompted

4. **Add Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add QDRANT_URL
   vercel env add QDRANT_API_KEY
   vercel env add NODE_ENV
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment

### 1. Seed Property Data

After deployment, you need to seed Qdrant with properties. You can do this locally:

```bash
# Make sure your .env has the correct QDRANT credentials
npm run seed:properties
```

Or create a Vercel serverless function to do this (optional).

### 2. Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test the Dashboard
3. Test WhatsApp Demo
4. Test Gmail Demo
5. Test API endpoint: `https://your-project.vercel.app/api/lead`

### 3. Update Frontend API Base URL (if needed)

The frontend should automatically use the same domain for API calls. If you need to change it, update `client/src/api/leadAnalysis.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
```

Then add `VITE_API_URL` to your Vercel environment variables.

## Troubleshooting

### Build Fails

- **Error: "Cannot find module"**
  - Make sure all dependencies are in `package.json`
  - Check that `node_modules` is not in `.vercelignore`

- **Error: "Build command failed"**
  - Check build logs in Vercel dashboard
  - Ensure `client/package.json` has `vercel-build` script

### API Routes Not Working

- **404 on `/api/lead`**
  - Check `vercel.json` routes configuration
  - Ensure `api/index.js` exists and exports the Express app correctly

### Environment Variables Not Working

- **"API key not found"**
  - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  - Ensure all variables are added for "Production"
  - Redeploy after adding variables

### Frontend Not Loading

- **Blank page or 404**
  - Check that `client/dist` is being generated
  - Verify `vercel.json` routes point to correct paths
  - Check browser console for errors

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. To disable:

1. Go to Settings → Git
2. Uncheck "Automatically deploy"

## Monitoring

- **Logs**: View in Vercel Dashboard → Your Project → Logs
- **Analytics**: Available in Vercel Dashboard (Pro plan)
- **Performance**: Check "Speed Insights" tab

## Cost

- **Free Tier**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for MVP/demo

- **Pro Plan** ($20/month):
  - More bandwidth
  - Team collaboration
  - Advanced analytics

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)

---

**Your app is now live! 🚀**

Share your Vercel URL with judges, investors, or teammates.

