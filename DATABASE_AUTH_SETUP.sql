-- ============================================
-- GottaGo Database Setup Instructions
-- ============================================
-- 
-- Go to your Supabase Dashboard → SQL Editor → New Query
-- Copy and paste this entire file and run it
--

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 2. FUNCTION TO CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. GOOGLE OAUTH SETUP
-- ============================================
-- 
-- To enable Google Sign-In:
-- 1. Go to Supabase Dashboard → Authentication → Providers
-- 2. Enable "Google" provider
-- 3. Get OAuth credentials from Google Cloud Console:
--    - Go to https://console.cloud.google.com/
--    - Create a new project or select existing
--    - Go to APIs & Services → Credentials
--    - Create OAuth 2.0 Client ID
--    - Application type: Web application
--    - Authorized redirect URIs: Add your Supabase callback URL
--      (shown in Supabase dashboard)
-- 4. Copy Client ID and Client Secret to Supabase
-- 5. Save configuration
--

-- ============================================
-- 4. CREATE FIRST ADMIN USER
-- ============================================
-- 
-- After you sign in for the first time with Google:
-- 1. Go to SQL Editor and run this query with YOUR email:
--

-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@gmail.com';

-- ============================================
-- 5. UPDATED AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. BATHROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bathrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Overall rating (calculated from reviews)
  overall_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Detailed ratings (averages from reviews)
  cleanliness_rating DECIMAL(3,2) DEFAULT 0,
  accessibility_rating DECIMAL(3,2) DEFAULT 0,
  privacy_rating DECIMAL(3,2) DEFAULT 0,
  facilities_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Amenities
  has_changing_table BOOLEAN DEFAULT false,
  has_accessible BOOLEAN DEFAULT false,
  has_gender_neutral BOOLEAN DEFAULT false,
  has_family_friendly BOOLEAN DEFAULT false,
  has_air_dryer BOOLEAN DEFAULT false,
  has_paper_towels BOOLEAN DEFAULT false,
  has_soap BOOLEAN DEFAULT false,
  has_sanitizer BOOLEAN DEFAULT false,
  has_changing_station BOOLEAN DEFAULT false,
  has_tampons BOOLEAN DEFAULT false,
  
  -- Access requirements
  requires_purchase BOOLEAN DEFAULT false,
  key_required BOOLEAN DEFAULT false,
  
  -- Additional info
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE bathrooms ENABLE ROW LEVEL SECURITY;

-- Policies for bathrooms
CREATE POLICY "Bathrooms are viewable by everyone"
  ON bathrooms FOR SELECT
  USING (is_approved = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can insert bathrooms"
  ON bathrooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own bathrooms"
  ON bathrooms FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Moderators can update any bathroom"
  ON bathrooms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can delete bathrooms"
  ON bathrooms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bathrooms_location ON bathrooms(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bathrooms_created_by ON bathrooms(created_by);
CREATE INDEX IF NOT EXISTS idx_bathrooms_rating ON bathrooms(overall_rating);
CREATE INDEX IF NOT EXISTS idx_bathrooms_approved ON bathrooms(is_approved);

-- Trigger for updated_at
CREATE TRIGGER update_bathrooms_updated_at
  BEFORE UPDATE ON bathrooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id UUID NOT NULL REFERENCES bathrooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Ratings (0-10 scale)
  overall DECIMAL(3,1) NOT NULL CHECK (overall >= 0 AND overall <= 10),
  cleanliness DECIMAL(3,1) NOT NULL CHECK (cleanliness >= 0 AND cleanliness <= 10),
  accessibility DECIMAL(3,1) NOT NULL CHECK (accessibility >= 0 AND accessibility <= 10),
  privacy DECIMAL(3,1) NOT NULL CHECK (privacy >= 0 AND privacy <= 10),
  facilities DECIMAL(3,1) NOT NULL CHECK (facilities >= 0 AND facilities <= 10),
  
  comment TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(bathroom_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_bathroom ON reviews(bathroom_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. FUNCTION TO UPDATE BATHROOM RATINGS
-- ============================================
CREATE OR REPLACE FUNCTION update_bathroom_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bathrooms SET
    overall_rating = (
      SELECT AVG(overall) FROM reviews WHERE bathroom_id = COALESCE(NEW.bathroom_id, OLD.bathroom_id)
    ),
    cleanliness_rating = (
      SELECT AVG(cleanliness) FROM reviews WHERE bathroom_id = COALESCE(NEW.bathroom_id, OLD.bathroom_id)
    ),
    accessibility_rating = (
      SELECT AVG(accessibility) FROM reviews WHERE bathroom_id = COALESCE(NEW.bathroom_id, OLD.bathroom_id)
    ),
    privacy_rating = (
      SELECT AVG(privacy) FROM reviews WHERE bathroom_id = COALESCE(NEW.bathroom_id, OLD.bathroom_id)
    ),
    facilities_rating = (
      SELECT AVG(facilities) FROM reviews WHERE bathroom_id = COALESCE(NEW.bathroom_id, OLD.bathroom_id)
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews WHERE bathroom_id = COALESCE(NEW.bathroom_id, OLD.bathroom_id)
    )
  WHERE id = COALESCE(NEW.bathroom_id, OLD.bathroom_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update ratings when reviews change
DROP TRIGGER IF EXISTS update_ratings_on_insert ON reviews;
CREATE TRIGGER update_ratings_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_bathroom_ratings();

DROP TRIGGER IF EXISTS update_ratings_on_update ON reviews;
CREATE TRIGGER update_ratings_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_bathroom_ratings();

DROP TRIGGER IF EXISTS update_ratings_on_delete ON reviews;
CREATE TRIGGER update_ratings_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_bathroom_ratings();

-- ============================================
-- 9. PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id UUID NOT NULL REFERENCES bathrooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policies for photos
CREATE POLICY "Photos are viewable by everyone"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON photos FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Moderators can delete any photo"
  ON photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_bathroom ON photos(bathroom_id);
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos(user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_bathroom ON photos(bathroom_id);
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos(user_id);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- 
-- Next steps:
-- 1. Run this entire SQL file in Supabase SQL Editor
-- 2. Configure Google OAuth in Supabase Dashboard (see section 3 above)
-- 3. Sign in with Google on your app
-- 4. Promote your account to admin:
--    UPDATE user_profiles SET role = 'admin' WHERE email = 'your@email.com';
-- 5. Start adding bathrooms!
--
-- Database includes:
-- ✅ User profiles with role management
-- ✅ Bathrooms with detailed ratings and amenities
-- ✅ Reviews system with automatic rating calculations
-- ✅ Photos support
-- ✅ Row Level Security policies
-- ✅ Automatic triggers for ratings and timestamps
--
