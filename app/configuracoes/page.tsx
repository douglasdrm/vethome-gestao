'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { 
  User, 
  ShieldCheck, 
  Phone, 
  Save, 
  Loader2, 
  CheckCircle,
  Settings,
  Bell,
  Lock,
  LogOut,
  Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    crmv: '',
    whatsapp_padrao: '',
    email: '' // Apenas leitura
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setFormData(prev => ({ ...prev, email: user.email || '' }));

      const { data: profile, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          nome: profile.nome || '',
          crmv: profile.crmv || '',
          whatsapp_padrao: profile.whatsapp_padrao || '',
          email: user.email || ''
        });
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('perfis')
        .upsert({
          id: user.id,
          nome: formData.nome,
          crmv: formData.crmv,
          whatsapp_padrao: formData.whatsapp_padrao,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Também tenta atualizar o metadata do auth para refletir no Dashboard sem refresh
      await supabase.auth.updateUser({
        data: { full_name: formData.nome, crmv: formData.crmv }
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Carregando configurações...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200 text-white">
              <Settings size={28} />
            </div>
            Configurações
          </h1>
          <p className="text-slate-400 font-medium mt-2 ml-1">Gerencie seu perfil profissional e preferências.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Menu Lateral de Configs */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-emerald-600 font-bold text-sm text-left">
              <User size={18} />
              Meu Perfil
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-500 hover:bg-white/50 transition-all font-bold text-sm text-left">
              <Bell size={18} />
              Notificações
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-500 hover:bg-white/50 transition-all font-bold text-sm text-left">
              <Lock size={18} />
              Segurança
            </button>
            <div className="pt-4 mt-4 border-t border-slate-200">
               <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm text-left"
              >
                <LogOut size={18} />
                Sair da Conta
              </button>
            </div>
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              
              {/* Foto de Perfil */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-50">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 ring-8 ring-slate-50 flex items-center justify-center text-slate-300 transition-all group-hover:ring-emerald-50">
                    <User size={60} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-3 rounded-2xl shadow-xl transition-transform group-hover:scale-110">
                    <Camera size={20} />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-800">Foto de Perfil</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">Sua foto aparecerá nos orçamentos e receitas.</p>
                </div>
              </div>

              {/* Campos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CRMV</label>
                  <div className="relative group">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      required
                      type="text"
                      placeholder="Ex: 12345-UF"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                      value={formData.crmv}
                      onChange={e => setFormData({...formData, crmv: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Padrao</label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="tel"
                      placeholder="(00) 00000-0000"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                      value={formData.whatsapp_padrao}
                      onChange={e => setFormData({...formData, whatsapp_padrao: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Lido apenas)</label>
                  <div className="relative">
                    <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input 
                      disabled
                      type="email"
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-100 rounded-2xl cursor-not-allowed font-bold"
                      value={formData.email}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-[2rem] font-bold shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 min-w-[200px]"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : (
                    success ? <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest"><CheckCircle size={20} /> Salvo com Sucesso!</div> : <div className="flex items-center gap-2"><Save size={20} /> Salvar Perfil</div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
