'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProductModal } from '@/components/inventory/ProductModal';
import { BatchList } from '@/components/inventory/BatchList';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar,
  Layers,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { KPICard } from '@/components/finance/KPICard';

// Mock data para estoque
const MOCK_INVENTORY = [
  {
    id: '1',
    name: 'Vacina V10 (Raiva)',
    category: 'Vacina',
    totalQuantity: 15,
    unit: 'un',
    minQuantity: 10,
    batches: [
      { id: 'b1', number: 'LT-0992', expiryDate: '2026-05-15', quantity: 5, unit: 'un' },
      { id: 'b2', number: 'LT-1025', expiryDate: '2026-12-20', quantity: 10, unit: 'un' }
    ]
  },
  {
    id: '2',
    name: 'Apoquel 16mg',
    category: 'Medicamento',
    totalQuantity: 45,
    unit: 'comp',
    minQuantity: 60,
    batches: [
      { id: 'b3', number: 'AP-552', expiryDate: '2026-04-20', quantity: 15, unit: 'comp' },
      { id: 'b4', number: 'AP-601', expiryDate: '2027-02-15', quantity: 30, unit: 'comp' }
    ]
  },
  {
    id: '3',
    name: 'Seringa 3ml c/ Agulha',
    category: 'Insumo',
    totalQuantity: 100,
    unit: 'un',
    minQuantity: 50,
    batches: [
      { id: 'b5', number: 'SR-Z88', expiryDate: '2028-10-01', quantity: 100, unit: 'un' }
    ]
  }
];

export default function EstoquePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard 
             label="Itens em Estoque" 
             value="24" 
             icon={<Package size={24} />} 
          />
          <KPICard 
             label="Estoque Baixo" 
             value="03" 
             icon={<AlertTriangle size={24} />} 
             type="negative" 
          />
          <KPICard 
             label="Vencimento Próximo" 
             value="01" 
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
                  placeholder="Buscar produto ou lote..." 
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
            {MOCK_INVENTORY.map((product) => (
              <div key={product.id} className="p-8 hover:bg-slate-50/30 transition-colors">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  {/* Info do Produto */}
                  <div className="flex-1 max-w-md">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                         {product.category}
                       </span>
                       {product.totalQuantity < product.minQuantity && (
                         <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 flex items-center gap-1">
                           <AlertTriangle size={10} />
                           Estoque Baixo
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
                         <ClipboardList size={16} className="text-slate-300" />
                         <span>Mínimo: <b className="text-slate-800">{product.minQuantity} {product.unit}</b></span>
                       </div>
                    </div>
                  </div>

                  {/* Gestão de Lotes */}
                  <div className="flex-[1.5]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lotes em Ativo</h4>
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
          </div>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </AppShell>
  );
}
