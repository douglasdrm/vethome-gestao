'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProductModal } from '@/components/inventory/ProductModal';
import { BatchList } from '@/components/inventory/BatchList';
import { StockOutModal } from '@/components/inventory/StockOutModal';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar,
  Layers,
  ArrowRight,
  ClipboardList,
  TrendingDown,
  Barcode,
  DollarSign
} from 'lucide-react';
import { KPICard } from '@/components/finance/KPICard';
import { supabase } from '@/lib/supabase';
import { addDays, isBefore, parseISO } from 'date-fns';

export default function EstoquePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0
  });
  const [alertDays, setAlertDays] = useState(30);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar preferência do usuário
      const { data: profile } = await supabase
        .from('perfis')
        .select('aviso_vencimento_dias')
        .eq('id', user.id)
        .single();
      
      const threshold = profile?.aviso_vencimento_dias || 30;
      setAlertDays(threshold);

      const { data, error } = await supabase
        .from('estoque')
        .select('*, estoque_lotes (*)')
        .order('nome');

      if (error) throw error;

      const filtered = data.filter((item: any) => 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.codigo_barras?.includes(searchTerm)
      );

      let lowStockCount = 0;
      let expiringSoonCount = 0;
      const now = new Date();
      const inAlertRange = addDays(now, threshold);

      const formatted = filtered.map((item: any) => {
        const totalQty = item.estoque_lotes?.reduce((acc: number, b: any) => acc + Number(b.qtd_atual), 0) || 0;
        
        if (totalQty <= item.qtd_minima) lowStockCount++;

        const formattedBatches = item.estoque_lotes?.map((b: any) => {
          const expiry = parseISO(b.vencimento);
          if (isBefore(expiry, inAlertRange)) expiringSoonCount++;
          
          return {
            id: b.id,
            number: b.num_lote,
            expiryDate: b.vencimento,
            quantity: b.qtd_atual,
            unit: item.unidade
          };
        }) || [];

        return {
          id: item.id,
          name: item.nome,
          category: item.categoria,
          totalQuantity: totalQty,
          unit: item.unidade,
          minQuantity: item.qtd_minima,
          preco_venda: item.preco_venda,
          codigo_barras: item.codigo_barras,
          batches: formattedBatches
        };
      });

      setInventory(formatted);
      setStats({
        totalItems: filtered.length,
        lowStock: lowStockCount,
        expiringSoon: expiringSoonCount
      });

    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [searchTerm]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100 text-white">
                <Package size={28} />
              </div>
              Estoque
            </h1>
            <p className="text-slate-400 font-medium mt-2 ml-1">Controle de vacinas, medicamentos e insumos clínicos.</p>
          </div>

          <div className="flex gap-4">
             <button 
              onClick={() => setIsStockOutModalOpen(true)}
              className="bg-rose-50 text-rose-600 px-8 py-4 rounded-[2rem] font-bold border border-rose-100 hover:bg-rose-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <TrendingDown size={20} />
              Registrar Saída
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={20} />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard 
             label="Produtos em Estoque" 
             value={stats.totalItems.toString().padStart(2, '0')} 
             icon={<Package size={24} />} 
          />
          <KPICard 
             label="Estoque Baixo" 
             value={stats.lowStock.toString().padStart(2, '0')} 
             icon={<AlertTriangle size={24} />} 
             type="negative" 
          />
          <KPICard 
             label="Vencimento Próximo" 
             value={stats.expiringSoon.toString().padStart(2, '0')} 
             icon={<Calendar size={24} />} 
             type="negative" 
          />
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="relative w-full md:w-96 group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar produto ou bipar EAN..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-semibold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-lg shadow-sm">Todos</button>
                <button className="px-4 py-2 text-slate-400 text-xs font-bold hover:text-slate-600">Vacinas</button>
                <button className="px-4 py-2 text-slate-400 text-xs font-bold hover:text-slate-600">Medicamentos</button>
             </div>
          </div>

          <div className="divide-y divide-slate-50">
            {inventory.map((product) => (
              <div key={product.id} className="p-8 hover:bg-slate-50/30 transition-colors">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  {/* Info do Produto */}
                  <div className="flex-1 max-w-md">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                         {product.category}
                       </span>
                       {product.totalQuantity <= product.minQuantity && (
                         <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 flex items-center gap-1">
                           <AlertTriangle size={10} />
                           Estoque Baixo
                         </span>
                       )}
                       {product.codigo_barras && (
                         <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Barcode size={14} />
                            {product.codigo_barras}
                         </span>
                       )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h3>
                    <div className="flex items-center gap-6 text-sm font-medium">
                       <div className="flex items-center gap-1.5 text-slate-500">
                         <Layers size={16} className="text-slate-300" />
                         <span>Total: <b className="text-slate-800">{product.totalQuantity} {product.unit}</b></span>
                       </div>
                       <div className="flex items-center gap-1.5 text-slate-500">
                         <DollarSign size={16} className="text-emerald-500" />
                         <span>Venda: <b className="text-emerald-600">R$ {product.preco_venda?.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</b></span>
                       </div>
                    </div>
                  </div>

                  {/* Gestão de Lotes */}
                  <div className="flex-[1.5]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lotes no Sistema</h4>
                      <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        <Plus size={14} />
                        Add Lote
                      </button>
                    </div>
                    <BatchList batches={product.batches} />
                  </div>
                </div>
              </div>
            ))}
            {inventory.length === 0 && (
               <div className="p-20 text-center text-slate-400 font-medium italic">
                Nenhum produto encontrado com esse filtro.
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchInventory}
      />

      <StockOutModal
        isOpen={isStockOutModalOpen}
        onClose={() => setIsStockOutModalOpen(false)}
        onSuccess={fetchInventory}
      />
    </AppShell>
  );
}
