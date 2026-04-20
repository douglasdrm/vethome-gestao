'use client';

import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Tag, 
  Scale, 
  AlertCircle, 
  Save, 
  Loader2,
  Layers,
  Camera,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarcodeScanner } from './BarcodeScanner';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ isOpen, onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Vacina',
    unidade: 'un',
    qtd_minima: '',
    preco_custo: '',
    preco_venda: '',
    codigo_barras: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      const { error } = await supabase
        .from('estoque')
        .insert([{
          user_id: user.id,
          nome: formData.nome,
          categoria: formData.categoria,
          unidade: formData.unidade,
          qtd_minima: parseFloat(formData.qtd_minima || '0'),
          preco_custo: parseFloat(formData.preco_custo || '0'),
          preco_venda: parseFloat(formData.preco_venda || '0'),
          codigo_barras: formData.codigo_barras
        }]);

      if (error) throw error;

      onSuccess();
      onClose();
      // Limpar formulário
      setFormData({
        nome: '',
        categoria: 'Vacina',
        unidade: 'un',
        qtd_minima: '',
        preco_custo: '',
        preco_venda: '',
        codigo_barras: ''
      });
    } catch (err: any) {
      alert('Erro ao salvar produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Novo Produto</h2>
                <p className="text-slate-400 text-sm font-medium">Cadastre um item no catálogo de estoque.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Produto */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Nome do Item</label>
                  <div className="relative group">
                    <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      required
                      type="text"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Vacina V10, Seringa 3ml..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Código de Barras */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Código de Barras (EAN)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                       <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                       <input 
                        type="text"
                        value={formData.codigo_barras}
                        onChange={e => setFormData({...formData, codigo_barras: e.target.value})}
                        placeholder="Clique na câmera para bipar"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center justify-center shadow-sm active:scale-95"
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                  <select 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold appearance-none"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="Vacina">Vacina</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Insumo">Insumo Clínico</option>
                    <option value="Higiene">Higiene</option>
                    <option value="Petshop">Petshop / Outros</option>
                  </select>
                </div>

                {/* Unidade */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Unidade de Medida</label>
                  <select 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold appearance-none"
                    value={formData.unidade}
                    onChange={e => setFormData({...formData, unidade: e.target.value})}
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="comp">Comprimido (comp)</option>
                    <option value="frasco">Frasco</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>

                {/* Preços */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Custo (R$)</label>
                  <input 
                    type="number" step="0.01" placeholder="0,00"
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                    value={formData.preco_custo}
                    onChange={e => setFormData({...formData, preco_custo: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Venda (R$)</label>
                   <input 
                    type="number" step="0.01" placeholder="0,00"
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-emerald-50/30 text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black"
                    value={formData.preco_venda}
                    onChange={e => setFormData({...formData, preco_venda: e.target.value})}
                  />
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
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span>Salvar Produto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Camera Scanner */}
      {showScanner && (
        <BarcodeScanner 
          onScan={(code) => setFormData({...formData, codigo_barras: code})}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
