'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ArrowLeft, Save, Loader2, PawPrint, Camera, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/lib/storage';

export default function NovoPetPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('canina');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState('macho');
  const [peso, setPeso] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cor, setCor] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const url = await uploadFile(file, user.id, 'pets');
      setFotoUrl(url);
    } catch (err: any) {
      alert(err.message || 'Erro ao subir imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      const { data, error } = await supabase
        .from('animais')
        .insert({
          user_id: user.id,
          cliente_id: clientId,
          nome,
          especie: especie as any,
          raca: raca || null,
          sexo: sexo as any,
          peso_kg: peso ? parseFloat(peso.replace(',', '.')) : null,
          data_nascimento: dataNascimento || null,
          cor: cor || null,
          foto_url: fotoUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/clientes/${clientId}`);
    } catch (err: any) {
      console.error('Erro ao salvar pet:', err);
      setErrorMsg(err.message || 'Erro ao cadastrar animal. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href={`/clientes/${clientId}`} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Cliente</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Cadastrar Novo Pet</h1>
          <p className="text-slate-500">Insira as informações do animal.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            
            {/* Upload de Foto */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 group hover:border-emerald-200 transition-all">
              {fotoUrl ? (
                <div className="relative w-32 h-32">
                  <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover rounded-3xl" />
                  <button 
                    onClick={() => setFotoUrl('')}
                    className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-3 cursor-pointer py-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                    {uploading ? <Loader2 className="animate-spin" /> : <Camera size={32} />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Foto do Animal</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JPG ou PNG, Máx 5MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Animal</label>
              <input 
                required type="text" value={nome} onChange={e => setNome(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Espécie</label>
                <select value={especie} onChange={e => setEspecie(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-4 outline-none">
                  <option value="canina">Canina (Cachorro)</option>
                  <option value="felina">Felina (Gato)</option>
                  <option value="aviaria">Aviária (Pássaro)</option>
                  <option value="outra">Outra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Raça</label>
                <input 
                  type="text" value={raca} onChange={e => setRaca(e.target.value)} placeholder="Ex: Poodle"
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sexo</label>
                <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none">
                  <option value="macho">Macho</option>
                  <option value="femea">Fêmea</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cor/Pelagem</label>
                <input 
                  type="text" value={cor} onChange={e => setCor(e.target.value)} placeholder="Ex: Caramelo"
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Peso (kg)</label>
                <input 
                  type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ex: 10.5"
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data Nascimento</label>
                <input 
                  type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                />
              </div>
            </div>

          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => router.back()} className="flex-1 px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Save />} Salvar Animal
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
