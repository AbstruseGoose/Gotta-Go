# 🗄️ GottaGo Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Run the SQL Schema
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pmyvqzvfgfhuagfdinhc
2. Click **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Open `DATABASE_AUTH_SETUP.sql` in this project
5. Copy the **entire contents** and paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 2: Verify Tables Created
1. In Supabase, click **Table Editor** in the left sidebar
2. You should now see these tables:
   - ✅ `user_profiles` - User accounts with roles
   - ✅ `bathrooms` - Bathroom locations and details
   - ✅ `reviews` - User reviews and ratings
   - ✅ `photos` - Bathroom photos

### Step 3: Test the App
1. Go to your app and try adding a bathroom
2. Sign in with Google (if OAuth is configured)
3. Fill out the form and submit
4. Check Supabase Table Editor → `bathrooms` to see your new entry!

## What the Database Includes

### 📊 Tables

**user_profiles**
- User authentication data
- Role system (user/moderator/admin)
- Profile information

**bathrooms**
- Location (latitude/longitude)
- Ratings (overall, cleanliness, accessibility, privacy, facilities)
- 10 amenities (changing table, accessible, soap, etc.)
- Access requirements (purchase required, key needed)
- Approval system for moderation

**reviews**
- 5 detailed ratings per review (0-10 scale)
- Comments
- Automatic calculation of bathroom averages
- One review per user per bathroom

**photos**
- Photo URLs
- Linked to bathrooms and users

### 🔒 Security (Row Level Security)

- ✅ Everyone can view approved bathrooms
- ✅ Authenticated users can add bathrooms
- ✅ Users can edit their own bathrooms
- ✅ Moderators/admins can edit/delete any bathroom
- ✅ Automatic profile creation on signup

### ⚡ Automatic Features

- **Rating calculations** - Bathroom ratings update automatically when reviews are added
- **Timestamps** - `created_at` and `updated_at` managed automatically
- **User profiles** - Created automatically on first Google sign-in

## Making Yourself an Admin

After signing in for the first time:

1. Go to Supabase → **SQL Editor**
2. Run this query with YOUR email:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@gmail.com';
```

3. Refresh your app - you'll now see the Admin Panel in your account menu!

## Current Status

- ✅ Database schema created
- ✅ App connected to Supabase
- ✅ Add bathroom form saves to database
- ✅ Homepage fetches from database (falls back to mock data if empty)
- ⚠️ Google OAuth needs configuration (optional for now)
- 📝 Review system ready but UI not built yet
- 📷 Photo upload system ready but UI not built yet

## Troubleshooting

**"No bathrooms showing"**
- The app falls back to mock data if database is empty
- Add your first bathroom to see real data!

**"You must be signed in to add a bathroom"**
- You need to configure Google OAuth (see main README)
- Or temporarily disable auth check in the code

**"Error adding bathroom"**
- Check browser console for details
- Verify Supabase credentials in `.env.local`
- Make sure SQL schema was run successfully

## Next Steps

1. ✅ Run the SQL schema (you're doing this now!)
2. Add your first bathroom
3. Make yourself an admin
4. Configure Google OAuth (optional but recommended)
5. Deploy to production!
