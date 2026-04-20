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
  Upload
} from 'lucide-react';
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
              {/* Foto da Vacina - O diferencial para agilidade */}
              {type === 'vaccine' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Foto da Vacina / Lote</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer">
                      <Camera size={32} className="text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Tirar foto ou anexar</span>
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
                  onClick={onClose}
                  className={`flex-[2] px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${type === 'vaccine' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}
                >
                  Salvar Registro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
