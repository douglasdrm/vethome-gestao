'use client';

import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText, 
  Save, 
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'Entrada' | 'Saída'>('Saída');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Novo Lançamento</h2>
              <p className="text-slate-400 text-sm font-medium">Registre uma receita ou despesa manual.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle Tipo */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button 
                type="button"
                onClick={() => setType('Entrada')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'Entrada' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ArrowUpCircle size={18} />
                Receita
              </button>
              <button 
                type="button"
                onClick={() => setType('Saída')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'Saída' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ArrowDownCircle size={18} />
                Despesa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Valor */}
               <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Valor do Lançamento</label>
                <div className="relative group">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>R$</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black text-xl"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Descrição / Título</label>
                <div className="relative group">
                  <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    required
                    type="text"
                    placeholder="Ex: Combustível, Materiais Cirúrgicos..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                <div className="relative group">
                  <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <select className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold appearance-none">
                    <option value="Atendimento">Atendimento</option>
                    <option value="Insumos">Insumos/Produtos</option>
                    <option value="Logistica">Logística/⛽</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              {/* Data Vencimento */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Data</label>
                <div className="relative group">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span>Salvar Lançamento</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
