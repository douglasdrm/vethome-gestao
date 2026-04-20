'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { VitalsForm } from '@/components/medical/VitalsForm';
import { 
  ArrowLeft, 
  Save, 
  Stethoscope, 
  Calendar, 
  DollarSign, 
  Camera, 
  Loader2,
  Syringe,
  FileText,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/lib/storage';
import { X, Upload, Search, Package, Trash2, Camera as ScanIcon } from 'lucide-react';
import { BarcodeScanner } from '@/components/inventory/BarcodeScanner';

export default function NovoAtendimentoPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backlogMode, setBacklogMode] = useState(false);
  
  // Estados do formulário
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [anamnese, setAnamnese] = useState('');
  const [conduta, setConduta] = useState('');
  const [vitals, setVitals] = useState({
    weight: '',
    temp: '',
    heartRate: '',
    respRate: '',
    tpc: '',
    mucosas: ''
  });
  const [value, setValue] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Insumos e Estoque
  const [usedItems, setUsedItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const url = await uploadFile(file, user.id, 'exames');
      setFotoUrl(url);
    } catch (err: any) {
      alert(err.message || 'Erro ao subir imagem');
    } finally {
      setUploading(false);
    }
  };
  
  const handleVitalsChange = (field: string, val: string) => {
    setVitals(prev => ({ ...prev, [field]: val }));
  };

  const handleSearchProduct = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const { data } = await supabase
      .from('estoque')
      .select('*, estoque_lotes(*)')
      .or(`nome.ilike.%${term}%,codigo_barras.eq.${term}`)
      .limit(5);
    
    setSearchResults(data || []);
  };

  const addItem = (product: any, lote: any) => {
    const existing = usedItems.find(item => item.lote_id === lote.id);
    if (existing) return;

    setUsedItems([...usedItems, {
      id: product.id,
      nome: product.nome,
      lote_id: lote.id,
      num_lote: lote.num_lote,
      quantidade: 1,
      unidade: product.unidade,
      disponivel: lote.qtd_atual
    }]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeUsedItem = (loteId: string) => {
    setUsedItems(usedItems.filter(i => i.lote_id !== loteId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anamnese && !conduta) {
      alert('Por favor, preencha a anamnese ou a conduta.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      const animalId = params.petId as string;
      const clienteId = params.id as string;
      const atendimentoData = {
        user_id: user.id,
        animal_id: animalId,
        cliente_id: clienteId,
        data_hora: new Date(date).toISOString(),
        tipo: 'atendimento' as any,
        anamnese,
        diagnostico: conduta,
        peso_kg: vitals.weight ? parseFloat(vitals.weight) : null,
        temperatura: vitals.temp ? parseFloat(vitals.temp) : null,
        valor: value ? parseFloat(value) : 0,
        status_pagamento: 'pago' as any,
        foto_url: fotoUrl || null,
        observacoes: `FC: ${vitals.heartRate || '-'} | FR: ${vitals.respRate || '-'} | TPC: ${vitals.tpc || '-'} | Mucosas: ${vitals.mucosas || '-'}`
      };

      // 1. Salvar Atendimento
      const { data: appointment, error: appError } = await supabase
        .from('atendimentos')
        .insert([atendimentoData])
        .select()
        .single();

      if (appError) throw appError;

      // 2. Atualizar Peso do Animal se fornecido
      if (vitals.weight) {
        await supabase
          .from('animais')
          .update({ peso_kg: parseFloat(vitals.weight) })
          .eq('id', animalId);
      }

      // 3. Gerar Lançamento Financeiro se houver valor
      if (value && parseFloat(value) > 0) {
        await supabase
          .from('financeiro')
          .insert([{
            user_id: user.id,
            tipo: 'receita',
            descricao: `Atendimento - ${anamnese.substring(0, 30)}...`,
            valor: parseFloat(value),
            data: date,
            status: 'pago',
            atendimento_id: appointment.id,
            cliente_id: clienteId
          }]);
      }

      // 4. Lógica de Baixa no Estoque (Insumos)
      for (const item of usedItems) {
        // a. Subtrair do lote
        const { data: currentLote } = await supabase
          .from('estoque_lotes')
          .select('qtd_atual')
          .eq('id', item.lote_id)
          .single();
        
        const novaQtd = (currentLote?.qtd_atual || 0) - item.quantidade;

        await supabase
          .from('estoque_lotes')
          .update({ qtd_atual: novaQtd })
          .eq('id', item.lote_id);

        // b. Registrar movimentação (Histórico)
        await supabase
          .from('movimentacao_estoque')
          .insert([{
            user_id: user.id,
            produto_id: item.id,
            tipo: 'saída_uso_clinico',
            quantidade: item.quantidade,
            motivo: `Uso no atendimento de ${params.petId}`,
            atendimento_id: appointment.id
          }]);
      }

      // 5. Criar Evento na Timeline
      await supabase
        .from('eventos')
        .insert([{
          user_id: user.id,
          animal_id: animalId,
          tipo: 'atendimento',
          titulo: 'Consulta Clínica',
          descricao: anamnese.substring(0, 100),
          data: date,
          atendimento_id: appointment.id
        }]);

      router.push(`/clientes/${clienteId}/pets/${animalId}`);
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err);
      alert('Erro ao salvar prontuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-4 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para o Pet</span>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Stethoscope size={24} />
              </div>
              Novo Prontuário Clínico
            </h1>
          </div>

          {/* Seletor de Data (Crucial para o backlog de 1 ano) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Data do Atendimento</label>
            <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${backlogMode ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
              <Calendar size={20} className={backlogMode ? 'text-amber-500' : 'text-slate-400'} />
              <input 
                type="date"
                className="bg-transparent border-none p-0 text-slate-800 font-bold focus:ring-0 outline-none"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  const isPast = new Date(e.target.value) < new Date(new Date().setHours(0,0,0,0));
                  setBacklogMode(isPast);
                }}
              />
            </div>
            {backlogMode && (
              <span className="text-[10px] font-bold text-amber-600 ml-1">Lançamento de Registro Passado</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção 1: Anamnese e Conduta */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-emerald-500" />
                  Queixa Principal e Anamnese
                </label>
                <textarea 
                  rows={4}
                  placeholder="Relato do tutor, início dos sinais, comportamento..."
                  className="w-full p-5 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={anamnese}
                  onChange={(e) => setAnamnese(e.target.value)}
                ></textarea>
             </div>

             <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Plus size={18} className="text-emerald-500" />
                  Diagnóstico e Conduta
                </label>
                <textarea 
                  rows={4}
                  placeholder="Suspeitas diagnósticas, exames solicitados, prescrição básica..."
                  className="w-full p-5 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={conduta}
                  onChange={(e) => setConduta(e.target.value)}
                ></textarea>
             </div>
          </section>

          {/* Seção 2: Parâmetros Vitais (Opcionais) */}
          <VitalsForm vitals={vitals} onChange={handleVitalsChange} />

          {/* Seção 3: Procedimentos, Vacinas e Financeiro */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Camera size={20} className="text-emerald-500" />
                    Anexar Foto / Exame
                  </h3>
                </div>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 hover:border-emerald-200 transition-all">
                  {fotoUrl ? (
                    <div className="relative w-full aspect-video">
                      <img src={fotoUrl} alt="Anexo" className="w-full h-full object-contain rounded-xl" />
                      <button 
                         onClick={() => setFotoUrl('')}
                         className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full shadow-lg"
                      >
                         <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-3 cursor-pointer">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                        {uploading ? <Loader2 className="animate-spin text-emerald-500" /> : <ScanIcon size={24} />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Anexar Foto</p>
                        <p className="text-[10px] text-slate-400 font-bold">Rótulo, Exame ou Receita</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <Package size={20} className="text-emerald-500" />
                  Insumos e Vacinas
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                       type="text" 
                       placeholder="Buscar no estoque..." 
                       className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                       value={searchTerm}
                       onChange={(e) => handleSearchProduct(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl mt-2 z-20 overflow-hidden">
                        {searchResults.map((prod) => (
                           <div key={prod.id} className="p-2 border-b border-slate-50 last:border-none">
                              <p className="text-xs font-bold text-slate-700 px-2 pt-1">{prod.nome}</p>
                              <div className="space-y-1 mt-1">
                                {prod.estoque_lotes?.map((lote: any) => (
                                  <button 
                                    key={lote.id}
                                    type="button"
                                    onClick={() => addItem(prod, lote)}
                                    className="w-full text-left px-3 py-2 text-[10px] bg-slate-50 hover:bg-emerald-50 rounded-lg flex justify-between items-center transition-colors"
                                  >
                                    <span>Lote: <b>{lote.num_lote}</b></span>
                                    <span>Sal: <b>{lote.qtd_atual} {prod.unidade}</b></span>
                                  </button>
                                ))}
                              </div>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                     type="button" 
                     onClick={() => setShowScanner(true)}
                     className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    <ScanIcon size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {usedItems.map((item) => (
                    <div key={item.lote_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{item.nome}</p>
                        <p className="text-[10px] text-slate-400">Lote: {item.num_lote}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          className="w-16 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                          value={item.quantidade}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setUsedItems(usedItems.map(i => i.lote_id === item.lote_id ? {...i, quantidade: val} : i));
                          }}
                        />
                        <span className="text-[10px] font-bold text-slate-500">{item.unidade}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeUsedItem(item.lote_id)}
                        className="text-rose-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {usedItems.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400">Nenhum insumo adicionado</p>
                    </div>
                  )}
                </div>

                {showScanner && (
                  <BarcodeScanner 
                    onScan={(code) => handleSearchProduct(code)}
                    onClose={() => setShowScanner(false)}
                  />
                )}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <DollarSign size={20} className="text-emerald-500" />
                  Resumo Financeiro
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor Total (R$)</label>
                    <input 
                      type="number"
                      placeholder="0,00"
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-xl text-emerald-600"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status de Pagamento</label>
                    <select className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold">
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                      <option value="parcial">Parcial</option>
                    </select>
                  </div>
                </div>
            </div>
          </section>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 px-8 py-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-3xl font-bold shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 text-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Save size={24} />
              )}
              <span>Finalizar Prontuário</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
