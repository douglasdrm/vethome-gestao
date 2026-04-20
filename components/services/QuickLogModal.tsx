'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Calendar, 
  Stethoscope, 
  Zap,
  CheckCircle2,
  ChevronRight,
  Upload,
  Search,
  PawPrint,
  Loader2
} from 'lucide-react';
import { supabase, MOCK_USER_ID } from '@/lib/supabase';
import { calculateNextDoseDate, formatToInputDate, VaccineType, VACCINE_PROTOCOLS } from '@/lib/vaccine-logic';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const [step, setStep] = useState(1); // 1: Tipo, 2: Detalhes
  const [type, setType] = useState<'service' | 'vaccine' | null>(null);
  const [date, setDate] = useState(formatToInputDate(new Date()));
  const [selectedVaccine, setSelectedVaccine] = useState<string>('');
  const [nextDoseDate, setNextDoseDate] = useState('');
  
  // Novos estados para integração
  const [searchPet, setSearchPet] = useState('');
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [isSearchingPet, setIsSearchingPet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceDescription, setServiceDescription] = useState('');

  // Busca pets quando o modal abre ou o termo de busca muda
  useEffect(() => {
    if (!isOpen) return;

    const delayDebounceFn = setTimeout(async () => {
      if (searchPet.length >= 2) {
        setIsSearchingPet(true);
        try {
          const { data, error } = await supabase
            .from('animais')
            .select(`
              id, 
              nome, 
              especie,
              clientes (nome)
            `)
            .ilike('nome', `%${searchPet}%`)
            .limit(5);
          
          if (!error && data) setPets(data);
        } catch (err) {
          console.error('Erro ao buscar pets:', err);
        } finally {
          setIsSearchingPet(false);
        }
      } else if (searchPet.length === 0) {
        setPets([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchPet, isOpen]);
  
  const handleVaccineChange = (v: string) => {
    setSelectedVaccine(v);
    if (v) {
      const nextDate = calculateNextDoseDate(v, new Date(date));
      setNextDoseDate(formatToInputDate(nextDate));
    }
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    if (type === 'vaccine' && selectedVaccine) {
      const nextDate = calculateNextDoseDate(selectedVaccine, new Date(d));
      setNextDoseDate(formatToInputDate(nextDate));
    }
  };

  const handleSave = async () => {
    if (!selectedPetId) {
      alert('Por favor, selecione um animal.');
      return;
    }
    if (type === 'vaccine' && !selectedVaccine) {
      alert('Por favor, selecione a vacina.');
      return;
    }

    setLoading(true);
    try {
      if (type === 'vaccine') {
        const { error: vacError } = await supabase
          .from('vacinas')
          .insert([{
            user_id: MOCK_USER_ID,
            animal_id: selectedPetId,
            nome: selectedVaccine,
            data_aplicacao: date,
            data_reforco: nextDoseDate || null
          }]);
        
        if (vacError) throw vacError;

        const { data: stockItems } = await supabase
          .from('estoque')
          .select('id, nome, estoque_lotes(id, qtd_atual)')
          .ilike('nome', `%${selectedVaccine}%`)
          .limit(1);

        if (stockItems && stockItems.length > 0) {
          const item = stockItems[0];
          const availableBatch = item.estoque_lotes?.find((b: any) => b.qtd_atual > 0);
          
          if (availableBatch) {
            await supabase
              .from('estoque_lotes')
              .update({ qtd_atual: availableBatch.qtd_atual - 1 })
              .eq('id', availableBatch.id);
          }
        }

        await supabase
          .from('eventos')
          .insert([{
            user_id: MOCK_USER_ID,
            animal_id: selectedPetId,
            tipo: 'vacina',
            titulo: `Vacinação: ${selectedVaccine}`,
            descricao: `Aplicação rápida realizada. Próximo reforço: ${nextDoseDate || 'Não agendado'}.`,
            data: date
          }]);

      } else {
        // Encontrar o pet na lista para pegar o cliente_id
        const petInfo = pets.find(p => p.id === selectedPetId);

        const { data: appData, error: appError } = await supabase
          .from('atendimentos')
          .insert([{
            user_id: MOCK_USER_ID,
            animal_id: selectedPetId,
            cliente_id: petInfo?.clientes?.id || null,
            data_hora: new Date(date).toISOString(),
            tipo: 'atendimento' as any,
            anamnese: serviceDescription || 'Atendimento rápido registrado pelo modal.',
            status_pagamento: 'pendente' as any
          }])
          .select()
          .single();

        if (appError) throw appError;

        await supabase
          .from('eventos')
          .insert([{
            user_id: MOCK_USER_ID,
            animal_id: selectedPetId,
            tipo: 'atendimento',
            titulo: 'Atendimento Rápido',
            descricao: serviceDescription || 'Registro via Zap!',
            data: date,
            atendimento_id: appData.id
          }]);
      }

      onClose();
    } catch (err) {
      console.error('Erro no QuickLog:', err);
      alert('Erro ao salvar registro.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Zap size={20} className="text-emerald-500 fill-emerald-500" />
            Lançamento Rápido
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-slate-500 mb-6">O que você deseja registrar agora?</p>
              
              <button 
                onClick={() => { setType('vaccine'); setStep(2); }}
                className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800">Vacinação</h4>
                    <p className="text-sm text-slate-500 text-left">Registrar dose e agendar reforço.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500" />
              </button>

              <button 
                onClick={() => { setType('service'); setStep(2); }}
                className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Stethoscope size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800">Atendimento Geral</h4>
                    <p className="text-sm text-slate-500">Consultas, exames ou procedimentos.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Seletor de Pet */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Para qual animal?</label>
                <div className="relative flex items-center">
                  <Search size={18} className="absolute left-3 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Busque pelo nome do pet..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={searchPet}
                    onChange={(e) => { 
                      setSearchPet(e.target.value); 
                      if (selectedPetId) setSelectedPetId(''); 
                    }}
                  />
                  {isSearchingPet && <Loader2 size={16} className="absolute right-3 animate-spin text-emerald-500" />}
                </div>

                {/* Dropdown de Pets */}
                {pets.length > 0 && !selectedPetId && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {pets.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => {
                          setSelectedPetId(pet.id);
                          setSearchPet(`${pet.nome} (${pet.clientes?.nome})`);
                          setPets([]);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                          {pet.especie === 'canina' ? '🐕' : '🐈'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{pet.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{pet.clientes?.nome}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Foto da Vacina - O diferencial para agilidade */}
              {type === 'vaccine' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Foto da Vacina / Lote</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer">
                      <Camera size={32} className="text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Tirar foto ou anexar (Em breve)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Vacina</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={selectedVaccine}
                      onChange={(e) => handleVaccineChange(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {Object.keys(VACCINE_PROTOCOLS).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Próxima Dose</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="date"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        value={nextDoseDate}
                        onChange={(e) => setNextDoseDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {type === 'service' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição do Atendimento</label>
                  <textarea 
                    rows={3}
                    placeholder="O que foi feito?"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                  ></textarea>
                </div>
              )}

              {/* Data Retroativa - Vital para o backlog de 1 ano */}
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Data do Registro (Pode ser retroativa)</label>
                <input 
                  type="date"
                  className="w-full bg-transparent border-none p-0 text-slate-800 font-semibold focus:ring-0"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex-[2] px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${type === 'vaccine' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'} disabled:opacity-50`}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
