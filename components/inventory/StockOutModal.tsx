'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  ArrowDownCircle, 
  TrendingDown, 
  Loader2, 
  Save, 
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockOutModal({ isOpen, onClose, onSuccess }: StockOutModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    produto_id: '',
    lote_id: '',
    tipo: 'saída_venda',
    quantidade: '',
    valor_total: '',
    motivo: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('estoque')
      .select('*, estoque_lotes(*)')
      .order('nome');
    setProducts(data || []);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const prod = products.find(p => p.id === id);
    setSelectedProduct(prod);
    setFormData({
      ...formData, 
      produto_id: id, 
      lote_id: prod?.estoque_lotes?.[0]?.id || '',
      valor_total: prod?.preco_venda?.toString() || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada');

      const qty = parseFloat(formData.quantidade);
      const lote = selectedProduct.estoque_lotes.find((l: any) => l.id === formData.lote_id);
      
      if (qty > lote.qtd_atual) throw new Error('Estoque insuficiente no lote selecionado.');

      // 1. Atualizar Quantidade no Lote
      const { error: updError } = await supabase
        .from('estoque_lotes')
        .update({ qtd_atual: lote.qtd_atual - qty })
        .eq('id', formData.lote_id);
      
      if (updError) throw updError;

      // 2. Registrar Movimentação
      const { error: movError } = await supabase
        .from('movimentacao_estoque')
        .insert([{
          user_id: user.id,
          produto_id: formData.produto_id,
          tipo: formData.tipo,
          quantidade: qty,
          valor_unitario: formData.tipo === 'saída_venda' ? parseFloat(formData.valor_total) / qty : null,
          motivo: formData.motivo
        }]);
      
      if (movError) throw movError;

      // 3. Se for Venda, registrar no Financeiro
      if (formData.tipo === 'saída_venda' && parseFloat(formData.valor_total) > 0) {
        await supabase
          .from('financeiro')
          .insert([{
            user_id: user.id,
            tipo: 'receita',
            valor: parseFloat(formData.valor_total),
            descricao: `Venda Insumo: ${selectedProduct.nome}`,
            data: new Date().toISOString(),
            status: 'pago'
          }]);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <ArrowDownCircle className="text-rose-500" />
                Registrar Saída / Venda
              </h2>
              <p className="text-slate-400 text-sm font-medium">Dê baixa em itens do estoque manualmente.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Selecionar Produto</label>
                <select 
                  required
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold"
                  value={formData.produto_id}
                  onChange={handleProductChange}
                >
                  <option value="">Selecione um item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Lote</label>
                    <select 
                      required
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold"
                      value={formData.lote_id}
                      onChange={e => setFormData({...formData, lote_id: e.target.value})}
                    >
                      {selectedProduct.estoque_lotes?.map((l: any) => (
                        <option key={l.id} value={l.id}>{l.num_lote} (Disp: {l.qtd_atual})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tipo de Saída</label>
                    <select 
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold"
                      value={formData.tipo}
                      onChange={e => setFormData({...formData, tipo: e.target.value})}
                    >
                      <option value="saída_venda">Venda Direta</option>
                      <option value="saída_perda">Quebra / Perda</option>
                      <option value="saída_vencimento">Vencimento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Quantidade</label>
                    <input 
                      required type="number" step="0.01"
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-rose-600"
                      value={formData.quantidade}
                      onChange={e => {
                        const qty = parseFloat(e.target.value);
                        setFormData({
                          ...formData, 
                          quantidade: e.target.value,
                          valor_total: formData.tipo === 'saída_venda' ? (qty * (selectedProduct.preco_venda || 0)).toString() : ''
                        });
                      }}
                    />
                  </div>

                  {formData.tipo === 'saída_venda' && (
                    <div className="animate-in slide-in-from-left duration-300">
                      <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 ml-1">Valor Venda Total (R$)</label>
                      <div className="relative group">
                        <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                        <input 
                          required type="number" step="0.01"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-black"
                          value={formData.valor_total}
                          onChange={e => setFormData({...formData, valor_total: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Observação / Motivo</label>
                    <input 
                      type="text" placeholder="Ex: Vendido para Colega, Vacina quebrada..."
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold"
                      value={formData.motivo}
                      onChange={e => setFormData({...formData, motivo: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500">Cancelar</button>
              <button 
                type="submit" disabled={loading || !selectedProduct}
                className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <TrendingDown size={20} />}
                <span>Registrar Saída</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
