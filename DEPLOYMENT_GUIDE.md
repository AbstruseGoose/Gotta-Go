# GottaGo Deployment Guide

## Prerequisites
- [x] Database set up in Supabase
- [ ] GitHub repository created
- [ ] Vercel account connected to GitHub

## Step 1: Configure Supabase Authentication

### A. Enable Email/Password Auth
1. Go to Supabase Dashboard → Authentication → Providers
2. Find "Email" provider
3. Enable "Confirm email" (recommended) or disable for faster testing
4. Save

### B. Fix Google OAuth Callback

**Current Issue:** OAuth redirect URL needs to be updated for production deployment

**Quick Setup:**

1. **In Supabase Dashboard:**
   - Go to Authentication → URL Configuration
   - Note your Site URL and Redirect URLs

2. **In Google Cloud Console:**
   - Go to https://console.cloud.google.com/
   - Select your project (or create new one)
   - Navigate to: APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID
   - Under "Authorized redirect URIs", add:
     - `https://pmyvqzvfgfhuagfdinhc.supabase.co/auth/v1/callback` (Supabase callback)
     - `https://your-app.vercel.app/auth/callback` (Your app callback - add after deploying)
     - `http://localhost:3000/auth/callback` (for local dev)
   - Save

3. **Copy credentials to Supabase:**
   - Back in Supabase: Authentication → Providers → Google
   - Paste Client ID and Client Secret
   - Save

## Step 2: Deploy to Vercel

### A. Push to GitHub (if not already)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### B. Deploy on Vercel
1. Go to https://vercel.com/
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

5. **Environment Variables** (IMPORTANT):
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://pmyvqzvfgfhuagfdinhc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteXZxenZmZ2ZodWFnZmRpbmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzA3ODMsImV4cCI6MjA1MjQ0Njc4M30.9w-UiAq7y4v8lN0rUq2rz5lJoZ-ZTmH_xYCz3eqiLAU
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWJzdHJ1c2UiLCJhIjoiY21qYzZzMzdiMHE3OTNlcTY2MHFjdXhnbSJ9.EqNV-b-Qc4kWJF4LE4ivCA
   ```

6. Click "Deploy"

### C. Update OAuth Callback (Post-Deploy)
Once deployed, you'll get a URL like `https://gotta-go-xyz.vercel.app`

1. Go back to Google Cloud Console → Credentials
2. Add your Vercel URL to Authorized redirect URIs:
   - `https://your-vercel-url.vercel.app/auth/callback`
3. Save

4. In Supabase → Authentication → URL Configuration:
   - Update Site URL to your Vercel URL
   - Add `https://your-vercel-url.vercel.app/**` to Redirect URLs

## Step 3: Make Yourself Admin

1. Sign in to your deployed app (or localhost)
2. Go to Supabase Dashboard → SQL Editor
3. Run this query with YOUR email:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@gmail.com';
   ```
4. Refresh your app - you should see the Admin Panel option

## Step 4: Test Everything

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google
- [ ] Verify profile creation
- [ ] Verify admin panel access
- [ ] Add a bathroom
- [ ] View bathroom on map
- [ ] Test from mobile phone

## Troubleshooting

### "Invalid redirect URL" error
- Double-check all callback URLs in Google Cloud Console
- Ensure Supabase callback URL is added
- Check Supabase URL Configuration

### Email confirmation not working
- In Supabase → Authentication → Email Templates
- Ensure confirmation email template is set up
- For testing, you can disable email confirmation

### Can't add bathrooms
- Ensure you're signed in
- Check browser console for errors
- Verify database tables exist (use SQL Editor: `SELECT * FROM bathrooms;`)

### Map not loading
- Check Mapbox token is set in environment variables
- Verify token is valid at https://account.mapbox.com/

## Quick Commands

### Local Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### View Logs
```bash
# Vercel logs
vercel logs your-deployment-url
```

## Next Steps After Deployment

1. Test adding bathrooms from your phone
2. Share with friends to start crowdsourcing data
3. Monitor usage in Supabase Dashboard → Database → Tables
4. Consider setting up:
   - Custom domain
   - Analytics (Vercel Analytics)
   - Error tracking (Sentry)
   - Rate limiting for API calls
