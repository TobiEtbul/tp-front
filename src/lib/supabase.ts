import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CatalogEntry = {
  id: string;
  user_id: string;
  title: string;
  type: 'movie' | 'series';
  status: 'watching' | 'completed' | 'wishlist' | 'dropped';
  rating: number | null;
  review: string | null;
  poster_url: string | null;
  genre: string | null;
  year: number | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CatalogFormData = Omit<CatalogEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
