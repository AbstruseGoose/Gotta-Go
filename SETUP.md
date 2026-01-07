# 🚽 GottaGo - Bathroom Discovery App

Community-powered bathroom discovery and rating app built with Next.js, TypeScript, and Supabase.

## 🚀 Quick Start

The app is now running at **http://localhost:3000**

### What's Working:

✅ **Interactive Map View** - Browse bathrooms on an interactive map (with Mapbox integration)  
✅ **List View** - See all bathrooms in a sortable list  
✅ **Sorting** - Sort by distance, overall rating, cleanliness, smell, safety, supplies, accessibility, and crowding  
✅ **Bathroom Detail Pages** - View detailed information and ratings for each bathroom  
✅ **Add Bathroom Page** - Form to add new bathrooms (uses GPS location automatically)  
✅ **Mock Data** - 4 sample bathrooms in NYC area for testing  
✅ **Responsive Design** - Mobile-first UI with Tailwind CSS  

### Current Status:

🏗️ Using **mock data** - Database not yet connected  
📍 **GPS location** enabled for distance sorting  
🗺️ **Map placeholder** ready (add Mapbox token to see real map)  

---

## 📦 Setup Instructions

### 1. Install Dependencies (Already Done!)
```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and add your API keys:

```env
# Supabase (Optional - using mock data for now)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Mapbox (Optional - shows placeholder without it)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

**To get a Mapbox token:**
1. Go to https://account.mapbox.com/
2. Create a free account
3. Copy your default public token
4. Paste it into `.env.local`

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## 🗄️ Database Setup (Next Step)

When you're ready to connect Supabase:

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Copy your Project URL and anon key to `.env.local`

### 2. Run Database Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'user',
  contribution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bathrooms table
CREATE TABLE bathrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bathroom_id UUID REFERENCES bathrooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  overall INTEGER CHECK (overall >= 1 AND overall <= 5),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  smell INTEGER CHECK (smell >= 1 AND smell <= 5),
  safety INTEGER CHECK (safety >= 1 AND safety <= 5),
  supplies INTEGER CHECK (supplies >= 1 AND supplies <= 5),
  accessibility INTEGER CHECK (accessibility >= 1 AND accessibility <= 5),
  crowding INTEGER CHECK (crowding >= 1 AND crowding <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bathroom_id UUID REFERENCES bathrooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_bathrooms_location ON bathrooms(latitude, longitude);
CREATE INDEX idx_reviews_bathroom ON reviews(bathroom_id);
CREATE INDEX idx_photos_bathroom ON photos(bathroom_id);

-- Create view for bathroom ratings
CREATE OR REPLACE VIEW bathroom_ratings AS
SELECT 
  b.id,
  b.name,
  b.description,
  b.latitude,
  b.longitude,
  b.created_at,
  b.created_by,
  AVG(r.overall) as overall_rating,
  AVG(r.cleanliness) as cleanliness_rating,
  AVG(r.smell) as smell_rating,
  AVG(r.safety) as safety_rating,
  AVG(r.supplies) as supplies_rating,
  AVG(r.accessibility) as accessibility_rating,
  AVG(r.crowding) as crowding_rating,
  COUNT(r.id) as review_count
FROM bathrooms b
LEFT JOIN reviews r ON b.id = r.bathroom_id
GROUP BY b.id, b.name, b.description, b.latitude, b.longitude, b.created_at, b.created_by;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bathrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Public read access" ON bathrooms FOR SELECT USING (true);
CREATE POLICY "Public read access" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read access" ON photos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON user_profiles FOR SELECT USING (true);

-- Policies for authenticated writes
CREATE POLICY "Authenticated users can insert" ON bathrooms FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
  
CREATE POLICY "Authenticated users can insert" ON reviews FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
  
CREATE POLICY "Authenticated users can insert" ON photos FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. Enable Google Auth

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

---

## 📁 Project Structure

```
/app
  /bathroom/[id]/page.tsx  # Bathroom detail page
  /add/page.tsx            # Add bathroom page
  page.tsx                 # Main map + list view
/components
  BathroomCard.tsx         # Bathroom list item
  MapView.tsx              # Interactive map
  SortBar.tsx              # Sorting dropdown
/lib
  supabase.ts              # Supabase client & types
  mock-data.ts             # Mock bathroom data
```

---

## 🎯 Next Steps

1. **Add Mapbox token** to see the interactive map
2. **Set up Supabase** to enable real data storage
3. **Implement Google Auth** for user login
4. **Add review form** on bathroom detail pages
5. **Add photo upload** functionality
6. **Add admin panel** for moderation

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)
- **Maps:** Mapbox GL JS
- **Hosting:** Vercel (recommended)

---

## 📝 Features Overview

### Core Features ✅
- Interactive map with bathroom markers
- List view with sorting options
- Bathroom detail pages
- GPS-based distance calculation
- Add new bathrooms
- Responsive mobile-first design

### Coming Soon 🚧
- User authentication (Google login)
- Submit reviews and ratings
- Upload photos
- Real-time database integration
- Admin/moderator tools
- User profiles and roles

---

## 🤝 Contributing

This is an MVP in active development. Keep things simple and ship fast!

---

## 📄 License

MIT
