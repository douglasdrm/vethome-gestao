'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { MonthlyCalendar } from '@/components/agenda/MonthlyCalendar';
import { DailyTimeline } from '@/components/agenda/DailyTimeline';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import { 
  Plus, 
  Calendar, 
  LayoutList, 
  Clock,
  Search,
  Filter
} from 'lucide-react';

// Mock data para agendamentos
const MOCK_APPOINTMENTS = [
  {
    id: '1',
    data_hora: new Date(new Date().setHours(10, 0)).toISOString(),
    animal: {
      nome: 'Thor',
      especie: 'Cão',
      cliente: { nome: 'Douglas Medeiros', telefone: '5511988887777' }
    },
    tipo_evento: 'Vacina',
    status: 'Confirmado'
  },
  {
    id: '2',
    data_hora: new Date(new Date().setHours(14, 30)).toISOString(),
    animal: {
      nome: 'Luna',
      especie: 'Gato',
      cliente: { nome: 'Douglas Medeiros', telefone: '5511988887777' }
    },
    tipo_evento: 'Consulta',
    status: 'Agendado'
  },
  {
    id: '3',
    data_hora: new Date(new Date().setHours(16, 0)).toISOString(),
    animal: {
      nome: 'Bolinha',
      especie: 'Cão',
      cliente: { nome: 'Maria Oliveira', telefone: '5511977776666' }
    },
    tipo_evento: 'Retorno',
    status: 'Agendado'
  }
];

export default function AgendaPage() {
  const [view, setView] = useState<'month' | 'day'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-emerald-600">
                <Calendar size={28} />
              </div>
              Agenda
            </h1>
            <p className="text-slate-400 font-medium mt-2 ml-1">Gerencie seus atendimentos e logística de visitas.</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setView('day')}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                ${view === 'day' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'}
              `}
            >
              <LayoutList size={18} />
              Dia
            </button>
            <button 
              onClick={() => setView('month')}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                ${view === 'month' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'}
              `}
            >
              <Calendar size={18} />
              Mês
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lado Esquerdo: Calendário/Timeline */}
          <div className={view === 'day' ? 'lg:col-span-8' : 'lg:col-span-12'}>
            {view === 'month' ? (
              <MonthlyCalendar 
                currentDate={selectedDate} 
                onDateChange={setSelectedDate}
                appointments={MOCK_APPOINTMENTS}
              />
            ) : (
              <DailyTimeline 
                selectedDate={selectedDate}
                appointments={MOCK_APPOINTMENTS}
              />
            )}
          </div>

          {/* Lado Direito: Ações e Mini Widgets (Apenas na visão diária) */}
          {view === 'day' && (
            <div className="lg:col-span-4 space-y-6">
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-[2.5rem] font-extrabold shadow-xl shadow-emerald-100 flex items-center justify-between group transition-all active:scale-95"
               >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                    </div>
                    <span>Agendar Visita</span>
                 </div>
                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                   <Clock size={20} />
                 </div>
               </button>

               {/* Mini Calendário para trocas rápidas */}
               <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-emerald-500" />
                    Próximos Dias
                  </h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map(offset => {
                      const date = new Date();
                      date.setDate(date.getDate() + offset);
                      return (
                        <button 
                          key={offset}
                          onClick={() => setSelectedDate(date)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-colors group"
                        >
                           <div className="text-left">
                             <p className="text-sm font-bold text-slate-800">{new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date)}</p>
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(date)}</p>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-all">
                              <Plus size={16} />
                           </div>
                        </button>
                      );
                    })}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Agendamento */}
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedDate}
      />
    </AppShell>
  );
}
