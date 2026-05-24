import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CoinResult, FlipRow, FlipTotals } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TABLE_PREFIX = import.meta.env.VITE_TABLE_PREFIX as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TABLE_PREFIX) {
  throw new Error('Missing Supabase env vars.');
}

export const FLIPS_TABLE = `${TABLE_PREFIX}_flips`;

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: 'pkce' },
});

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithPassword(email: string, password: string): Promise<{ needsConfirmation: boolean }> {
  const redirectTo = window.location.origin + window.location.pathname;
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
  if (error) throw error;
  return { needsConfirmation: !data.session };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function insertFlip(result: CoinResult, userId: string): Promise<FlipRow> {
  const { data, error } = await supabase.from(FLIPS_TABLE).insert({ result, user_id: userId }).select().single();
  if (error) throw error;
  return data as FlipRow;
}

export async function fetchRecentFlips(limit = 5): Promise<FlipRow[]> {
  const { data, error } = await supabase.from(FLIPS_TABLE).select('id,user_id,result,flipped_at').order('flipped_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as FlipRow[];
}

export async function fetchTotals(): Promise<FlipTotals> {
  const { data, error } = await supabase.from(FLIPS_TABLE).select('result');
  if (error) throw error;
  const rows = (data ?? []) as Array<{ result: CoinResult }>;
  const heads = rows.filter((r) => r.result === 'heads').length;
  const tails = rows.filter((r) => r.result === 'tails').length;
  return { heads, tails, total: heads + tails };
}

export async function deleteAllFlips(userId: string): Promise<void> {
  const { error } = await supabase.from(FLIPS_TABLE).delete().eq('user_id', userId);
  if (error) throw error;
}
