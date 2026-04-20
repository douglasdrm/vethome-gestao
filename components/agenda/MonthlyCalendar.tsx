'use client';

import React from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isToday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: any[]; // Substituir pelo tipo real
}

export function MonthlyCalendar({ currentDate, onDateChange, appointments }: MonthlyCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  let day = startDate;

  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const prevMonth = () => onDateChange(subMonths(currentDate, 1));
  const nextMonth = () => onDateChange(addMonths(currentDate, 1));

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <p className="text-slate-400 text-sm font-medium">Visão Geral do Mês</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => onDateChange(new Date())}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors"
          >
            Hoje
          </button>
          <button 
            onClick={nextMonth}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-7 border-t border-l border-slate-50 rounded-2xl overflow-hidden">
        {calendarDays.map((day, idx) => {
          const isSelected = isSameDay(day, currentDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayToday = isToday(day);
          
          // Contagem de agendamentos para o dia
          const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.data_hora), day));

          return (
            <button
              key={idx}
              onClick={() => onDateChange(day)}
              className={`
                relative h-32 p-3 border-r border-b border-slate-50 transition-all text-left group
                ${!isCurrentMonth ? 'bg-slate-50/30 text-slate-300' : 'text-slate-700 hover:bg-emerald-50/30'}
                ${isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-500 z-10' : ''}
              `}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`
                  text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                  ${dayToday ? 'bg-emerald-500 text-white' : ''}
                  ${isSelected && !dayToday ? 'text-emerald-700' : ''}
                `}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Indicadores de Agendamento */}
              <div className="space-y-1 overflow-hidden">
                {dayAppointments.slice(0, 3).map((apt, i) => (
                  <div 
                    key={i} 
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 truncate flex items-center gap-1"
                  >
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    {format(new Date(apt.data_hora), 'HH:mm')} {apt.animal?.nome || 'Pet'}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-[9px] font-bold text-slate-400 pl-1">
                    + {dayAppointments.length - 3} outros
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
