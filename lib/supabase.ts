import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// MVP: Fake User ID para permitir inserts no banco até implementarmos a autenticação real
export const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';
