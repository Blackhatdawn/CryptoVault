import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// These are safe to expose — they are the anon/publishable key, not the secret key.
const SUPABASE_URL     = process.env.EXPO_PUBLIC_SUPABASE_URL     || 'https://xssekmwtjtzdwobodnup.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2VrbXd0anR6ZHdvYm9kbnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzI1OTYsImV4cCI6MjA5MDE0ODU5Nn0.cvSzfo7dokNgVSoLMkOIUrXKu62uxhcIlSq2mYLj6jo';

/**
 * Frontend Supabase client.
 * Used for realtime subscriptions (wallet balance updates, notification push).
 * All authentication still flows through the Express backend API — the
 * frontend does NOT call Supabase directly for auth or writes.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
