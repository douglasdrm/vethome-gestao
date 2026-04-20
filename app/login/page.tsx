'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Stethoscope,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[grid-slate-200/[0.15]]">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center">
          <div className="inline-flex p-4 bg-emerald-600 rounded-[2rem] shadow-xl shadow-emerald-200 text-white mb-6">
            <Stethoscope size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">VetHome</h1>
          <p className="text-slate-500 font-medium mt-2">Gestão Clínica Inteligente</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-in shake duration-300">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-[2rem] font-bold shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 group"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  Acessar Sistema
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-8 font-medium">
            Exclusivo para médicos veterinários parceiros VetHome.
          </p>
        </div>
      </div>
    </div>
  );
}
