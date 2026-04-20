'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { KPICard } from '@/components/finance/KPICard';
import { TransactionList } from '@/components/finance/TransactionList';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Filter,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Mock data para transações
const MOCK_TRANSACTIONS: any[] = [
  {
    id: '1',
    type: 'Entrada',
    category: 'Atendimento',
    description: 'Consulta Domiciliar - Thor',
    value: '250,00',
    date: '19/04/2026',
    status: 'Pago'
  },
  {
    id: '2',
    type: 'Saída',
    category: 'Logística',
    description: 'Abastecimento Posto shell',
    value: '180,00',
    date: '19/04/2026',
    status: 'Pago'
  },
  {
    id: '3',
    type: 'Entrada',
    category: 'Atendimento',
    description: 'Vacinação V10 - Luna',
    value: '160,00',
    date: '18/04/2026',
    status: 'Pendente'
  },
  {
    id: '4',
    type: 'Saída',
    category: 'Insumos',
    description: 'Compra de Seringas e Agulhas',
    value: '85,50',
    date: '17/04/2026',
    status: 'Pago'
  }
];

export default function FinanceiroPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100 text-white">
                <BarChart3 size={28} />
              </div>
              Financeiro
            </h1>
            <p className="text-slate-400 font-medium mt-2 ml-1">Dashboard de saúde financeira e lucros do negócio.</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} />
            Novo Lançamento
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            label="Saldo em Caixa" 
            value="R$ 4.250,50" 
            icon={<DollarSign size={24} />} 
            type="positive" 
            trend="+12%" 
          />
          <KPICard 
            label="Entradas (Mês)" 
            value="R$ 8.120,00" 
            icon={<TrendingUp size={24} />} 
            type="positive" 
          />
          <KPICard 
            label="Saídas (Mês)" 
            value="R$ 3.869,50" 
            icon={<TrendingDown size={24} />} 
            type="negative" 
          />
          <KPICard 
            label="A Receber" 
            value="R$ 1.150,00" 
            icon={<Clock size={24} />} 
            type="neutral" 
          />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main List: Ultimas Transacoes */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Movimentações Recentes
                </h3>
                <Link 
                  href="/financeiro/fluxo-de-caixa"
                  className="group text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all"
                >
                  Ver Fluxo Completo
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>

             <TransactionList transactions={MOCK_TRANSACTIONS} />
          </div>

          {/* Right Column: Widgets */}
          <div className="lg:col-span-4 space-y-8">
            {/* Widget: Alerta de Pendência */}
            <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem]">
               <h4 className="text-amber-800 font-bold flex items-center gap-2 mb-4">
                 <Clock size={18} />
                 Atenção: Inadimplência
               </h4>
               <p className="text-sm text-amber-700 font-medium mb-6">
                 Você tem **3 atendimentos** concluídos que ainda não foram marcados como pagos.
               </p>
               <button className="w-full bg-white text-amber-800 py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-white/80 transition-all">
                 Ver Pendentes
               </button>
            </div>

            {/* Widget: Divisão de Gastos (Placeholder/Simple) */}
            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
               <h4 className="text-slate-800 font-bold mb-6">Divisão de Gastos</h4>
               <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                      <span>Logística (Combustível)</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                      <span>Insumos Médicos</span>
                      <span>30%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }} />
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Lançamento */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </AppShell>
  );
}
