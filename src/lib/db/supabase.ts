// =====================================================================
// SUPABASE CLIENT CONFIGURATION
// Provides both client-side and secure server-role instances
// =====================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && (supabaseAnonKey || supabaseServiceKey)
);

let clientInstance: SupabaseClient | null = null;
let serverInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey);
  }
  return clientInstance;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!serverInstance) {
    serverInstance = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
  }
  return serverInstance;
}
