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
import { formatCurrencyInput, parseCurrencyString } from '@/lib/format';

interface ProductModalProps {
// ...
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
    codigo_barras: '',
    num_lote: '',
    vencimento: '',
    qtd_inicial: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      if (!formData.vencimento) {
        throw new Error('A data de validade é obrigatória.');
      }

      const precoCusto = parseCurrencyString(formData.preco_custo);
      const precoVenda = parseCurrencyString(formData.preco_venda);
      const qtdInicialValue = parseFloat(formData.qtd_inicial || '0');

      // 1. Inserir Produto
      const { data: product, error: prodError } = await supabase
        .from('estoque')
        .insert([{
          user_id: user.id,
          nome: formData.nome,
          categoria: formData.categoria,
          unidade: formData.unidade,
          qtd_minima: parseFloat(formData.qtd_minima || '0'),
          preco_custo: precoCusto,
          preco_venda: precoVenda,
          codigo_barras: formData.codigo_barras
        }])
        .select()
        .single();

      if (prodError) throw prodError;

      // 2. Inserir Primeiro Lote
      if (product) {
        const { error: batchError } = await supabase
          .from('estoque_lotes')
          .insert([{
            produto_id: product.id,
            num_lote: formData.num_lote || 'Lote Inicial',
            vencimento: formData.vencimento,
            qtd_inicial: qtdInicialValue, 
            qtd_atual: qtdInicialValue,   
            user_id: user.id
          }]);
        
        if (batchError) throw batchError;
      }

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
        codigo_barras: '',
        num_lote: '',
        vencimento: '',
        qtd_inicial: ''
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

        <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
          {/* Header Fixo */}
          <div className="p-8 pb-4 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Novo Produto</h2>
                <p className="text-slate-400 text-sm font-medium">Cadastre o item e sua validade inicial.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Área com Scroll */}
          <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Seção 1: Dados Básicos */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Informações Básicas</h3>
                  </div>
                </div>

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
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold uppercase font-mono"
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

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                  <select 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
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

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Unidade</label>
                  <select 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
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

                {/* Seção 2: Validade e Lote */}
                <div className="md:col-span-2 pt-4">
                  <div className="flex items-center gap-2 mb-4 text-amber-600">
                    <div className="w-1 h-4 bg-amber-500 rounded-full" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Controle e Validade</h3>
                  </div>
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                         <AlertCircle size={14} /> Validade / Vencimento
                       </label>
                       <input 
                        required
                        type="date"
                        className="w-full p-4 rounded-2xl border border-amber-200 bg-white text-amber-900 focus:ring-4 focus:ring-amber-500/10 outline-none font-black"
                        value={formData.vencimento}
                        onChange={e => setFormData({...formData, vencimento: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 ml-1">Nº do Lote</label>
                      <input 
                        type="text"
                        placeholder="Opcional"
                        className="w-full p-4 rounded-2xl border border-amber-200 bg-white text-amber-900 outline-none font-bold placeholder:text-amber-200"
                        value={formData.num_lote}
                        onChange={e => setFormData({...formData, num_lote: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 ml-1">Quantidade</label>
                      <input 
                        required
                        type="number"
                        placeholder="Ex: 10"
                        className="w-full p-4 rounded-2xl border border-amber-200 bg-white text-amber-900 outline-none font-bold"
                        value={formData.qtd_inicial}
                        onChange={e => setFormData({...formData, qtd_inicial: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Financeiro */}
                <div className="md:col-span-2 pt-4">
                  <div className="flex items-center gap-2 mb-4 text-emerald-600">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Financeiro</h3>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Custo (R$)</label>
                  <input 
                    type="text" placeholder="0,00"
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
                    value={formData.preco_custo}
                    onChange={(e) => setFormData({ ...formData, preco_custo: formatCurrencyInput(e.target.value) })}
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Venda (R$)</label>
                   <input 
                    type="text" placeholder="0,00"
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-emerald-50/30 text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData({ ...formData, preco_venda: formatCurrencyInput(e.target.value) })}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Fixo */}
          <div className="p-8 border-t border-slate-50 bg-slate-50/30 rounded-b-[3rem]">
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="product-form"
                disabled={loading}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span>Salvar Produto e Lote</span>
              </button>
            </div>
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
