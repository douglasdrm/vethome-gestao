'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  FileText,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados do form
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          user_id: user.id,
          nome,
          telefone: telefone || null,
          email: email || null,
          endereco: endereco || null,
          observacoes: observacoes || null
        })
        .select()
        .single();
// ...

      if (error) throw error;

      // Redireciona para o perfil do cliente recém-criado
      router.push(`/clientes/${data.id}`);
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      setErrorMsg(err.message || 'Erro ao salvar cliente. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/clientes" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Clientes</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Novo Cliente</h1>
          <p className="text-slate-500">Cadastre os dados básicos do tutor para começar.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <User size={16} className="text-emerald-500" />
                  Nome Completo
                </label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: João Silva"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* WhatsApp / Telefone */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-emerald-500" />
                  WhatsApp / Celular
                </label>
                <input 
                  required
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-emerald-500" />
                  E-mail (opcional)
                </label>
                <input 
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-500" />
                  Endereço Completo
                </label>
                <input 
                  type="text"
                  placeholder="Rua, número, bairro..."
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500" />
                  Observações do Cliente
                </label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Cliente prefere atendimento à tarde, mora em condomínio..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              <span>Salvar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
