'use client';

import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  MapPin, 
  MessageCircle, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Navigation
} from 'lucide-react';
import { generateWhatsAppReminder } from '@/lib/whatsapp-logic';

interface DailyTimelineProps {
  selectedDate: Date;
  appointments: any[];
}

export function DailyTimeline({ selectedDate, appointments }: DailyTimelineProps) {
  // Horários de exibição (08:00 às 18:00)
  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);
  
  const dayAppointments = appointments
    .filter(apt => isSameDay(new Date(apt.data_hora), selectedDate))
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Concluído</span>;
      case 'Cancelado':
        return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">Cancelado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">Agendado</span>;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800">
          Atendimentos do Dia
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="space-y-6 relative">
        {/* Linha vertical decorativa */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-100 z-0" />

        {dayAppointments.length > 0 ? (
          dayAppointments.map((apt, idx) => {
            const time = format(new Date(apt.data_hora), 'HH:mm');
            const reminderUrl = generateWhatsAppReminder({
              tutorName: apt.animal?.cliente?.nome || 'Tutor',
              petName: apt.animal?.nome || 'Pet',
              dateTime: new Date(apt.data_hora),
              phoneNumber: apt.animal?.cliente?.telefone || ''
            });

            return (
              <div key={idx} className="relative z-10 flex gap-6 group">
                {/* Horário */}
                <div className="w-14 pt-1 text-right">
                  <span className="text-sm font-bold text-slate-800">{time}</span>
                </div>

                {/* Marcador */}
                <div className={`
                    mt-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm flex-shrink-0 z-20
                    ${apt.status === 'Concluído' ? 'bg-emerald-500' : 'bg-blue-500'}
                `} />

                {/* Card do Compromisso */}
                <div className="flex-1 bg-slate-50/50 rounded-3xl p-6 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 group/card">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-slate-800">{apt.animal?.nome || 'Animal'}</h4>
                        {getStatusBadge(apt.status)}
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          <span>{apt.animal?.cliente?.nome || 'Tutor'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" />
                          <span>{apt.tipo_evento}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <a 
                        href={reminderUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 md:flex-none p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        <MessageCircle size={16} />
                        Lembrar
                      </a>
                      <button className="flex-1 md:flex-none p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-emerald-100">
                        <Navigation size={16} />
                        Rota
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {apt.animal?.especie === 'Cão' ? '🐶' : '🐱'}
                      </div>
                    </div>
                    <button className="text-xs font-extrabold text-slate-400 hover:text-emerald-600 flex items-center gap-1 group-hover/card:translate-x-1 transition-all">
                      Abrir Prontuário
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 px-8 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Calendar size={32} />
            </div>
            <h4 className="text-slate-800 font-bold mb-2">Sem agendamentos para este dia</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Aproveite o tempo livre para atualizar suas fichas ou planejar os próximos dias.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Calendar({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}
