# Supabase Authentication Quick Setup

## Current Configuration
- **Supabase URL**: https://pmyvqzvfgfhuagfdinhc.supabase.co
- **Project**: Already configured with environment variables

## 1. Enable Email/Password Authentication

Go to your Supabase Dashboard:
1. Navigate to: https://supabase.com/dashboard/project/pmyvqzvfgfhuagfdinhc
2. Click **Authentication** → **Providers**
3. Find **Email** provider
4. Toggle it **ON**
5. Settings to configure:
   - ✅ **Confirm email**: ON (recommended) or OFF (for faster testing)
   - ✅ **Secure email change**: ON
   - ✅ **Secure password change**: ON
6. Click **Save**

## 2. Configure Google OAuth

### Step A: Get Credentials from Google
1. Go to https://console.cloud.google.com/
2. Select your project or create a new one:
   - Click "Select a project" dropdown
   - Click "New Project"
   - Name it "GottaGo" or similar
   - Click "Create"

3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External
     - App name: GottaGo
     - User support email: your email
     - Developer contact: your email
     - Click Save and Continue (skip optional sections)
   - Application type: **Web application**
   - Name: "GottaGo Auth"

5. Add Authorized Redirect URIs:
   ```
   https://pmyvqzvfgfhuagfdinhc.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
   (You'll add your Vercel URL after deployment)

6. Click **Create**
7. **Copy** the Client ID and Client Secret (keep this window open)

### Step B: Configure in Supabase
1. Go back to Supabase Dashboard
2. **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable**
5. Paste your **Client ID** (from Google)
6. Paste your **Client Secret** (from Google)
7. Click **Save**

## 3. Update URL Configuration (After Deployment)

After deploying to Vercel, you'll need to update:

### In Supabase:
1. **Authentication** → **URL Configuration**
2. Update **Site URL** to: `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   ```

### In Google Cloud Console:
1. Go back to your OAuth credentials
2. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```

## 4. Test Authentication (localhost first)

Before deploying, test locally:

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Click account menu → "Sign In"
4. Try both methods:
   - **Email**: Create account, check email, confirm
   - **Google**: Sign in with Google

## 5. Make Yourself Admin

After first sign-in:
1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query (replace with YOUR email):
   ```sql
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@gmail.com';
   ```
3. Refresh your app
4. You should now see "Admin Panel" in account menu

## Troubleshooting

### Email auth not working
- Check that Email provider is enabled in Supabase
- Verify SMTP settings if using custom email
- Check spam folder for confirmation emails

### Google OAuth "redirect_uri_mismatch" error
- Verify exact callback URL in Google Console matches Supabase
- Must be: `https://pmyvqzvfgfhuagfdinhc.supabase.co/auth/v1/callback`
- Check for typos, trailing slashes, http vs https

### "Invalid API key" error
- Check environment variables are set correctly
- Restart dev server after changing .env.local

### Profile not created after sign-in
- Check database trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Verify user_profiles table exists
- Check Supabase logs for errors

## Quick Links

- 🗂️ **Supabase Dashboard**: https://supabase.com/dashboard/project/pmyvqzvfgfhuagfdinhc
- 🔐 **Google Cloud Console**: https://console.cloud.google.com/
- 📊 **Auth Logs**: https://supabase.com/dashboard/project/pmyvqzvfgfhuagfdinhc/auth/users
- 💾 **Database**: https://supabase.com/dashboard/project/pmyvqzvfgfhuagfdinhc/editor

## Security Notes

✅ **Row Level Security** enabled on all tables
✅ **Email confirmation** prevents fake accounts
✅ **OAuth** provides secure third-party auth
✅ **Role-based access** controls admin features
⚠️ Keep your API keys secret (never commit .env.local)
⚠️ Use environment variables in production
