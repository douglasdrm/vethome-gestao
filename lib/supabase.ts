import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// MVP: Removido o Mock User ID para usar a autenticação real do Supabase
// Agora o RLS e o Storage funcionarão corretamente baseados no usuário logado.

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

export const signInDemo = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: 'demo@vethome.com',
    password: 'demo123456',
  });
  if (error) throw error;
};
