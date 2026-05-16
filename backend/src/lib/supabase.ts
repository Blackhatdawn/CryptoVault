import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';

const realtimeTransport = WebSocket as unknown as WebSocketLikeConstructor;

const SUPABASE_URL             = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY        = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL)              throw new Error('SUPABASE_URL is required');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
if (!SUPABASE_ANON_KEY)         throw new Error('SUPABASE_ANON_KEY is required');

/**
 * Admin client — uses the service role key.
 * Bypasses Row-Level Security. Use for all server-side DB reads/writes and
 * admin auth operations (createUser, updateUserById, getUser).
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: realtimeTransport },
});

/**
 * Auth client — uses the anon (publishable) key.
 * Used for user-level auth operations that must run as the user:
 * signInWithPassword, refreshSession.
 */
export const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: realtimeTransport },
});
