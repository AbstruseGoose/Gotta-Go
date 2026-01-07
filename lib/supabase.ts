import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if valid credentials are provided
const isConfigured = !!(supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== 'your-supabase-url' && 
                     supabaseAnonKey !== 'your-supabase-anon-key');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Fallback for when Supabase is not configured

export const isSupabaseConfigured: boolean = isConfigured;

export type Bathroom = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  
  // Ratings
  overall_rating?: number;
  cleanliness_rating?: number;
  accessibility_rating?: number;
  privacy_rating?: number;
  facilities_rating?: number;
  review_count?: number;
  
  // Amenities
  has_changing_table?: boolean;
  has_accessible?: boolean;
  has_gender_neutral?: boolean;
  has_family_friendly?: boolean;
  has_air_dryer?: boolean;
  has_paper_towels?: boolean;
  has_soap?: boolean;
  has_sanitizer?: boolean;
  has_changing_station?: boolean;
  has_tampons?: boolean;
  
  // Access
  requires_purchase?: boolean;
  key_required?: boolean;
  
  // Additional
  notes?: string;
  is_approved?: boolean;
  approved_by?: string;
  
  // Deprecated fields for backwards compatibility with mock data
  smell_rating?: number;
  safety_rating?: number;
  supplies_rating?: number;
  crowding_rating?: number;
};

export type Review = {
  id: string;
  bathroom_id: string;
  user_id: string;
  overall: number;
  cleanliness: number;
  accessibility: number;
  privacy: number;
  facilities: number;
  comment?: string;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  bathroom_id: string;
  user_id: string;
  url: string;
  created_at: string;
};

export type UserRole = 'user' | 'moderator' | 'admin';

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};
