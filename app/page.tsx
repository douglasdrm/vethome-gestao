'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Stethoscope,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { startOfMonth } from 'date-fns';
import { AppShell } from '@/components/AppShell';

// ─── Componentes Internos ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'done')    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold ring-1 ring-emerald-100"><CheckCircle size={12} /> Concluído</span>;
  if (status === 'current') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold ring-1 ring-blue-100"><Clock size={12} /> Em curso</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-bold ring-1 ring-slate-200">Agendado</span>;
}

function SpeciesIcon({ species }: { species: string }) {
  const isDog = species === 'Cão' || species === 'canina';
  return (
    <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${isDog ? 'bg-emerald-50' : 'bg-violet-50'}`}>
      <span className="text-xl">{isDog ? '🐕' : '🐈'}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [financialTarget] = useState(6000); 
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [userName, setUserName] = useState('Veterinário');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 0. Pegar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Veterinário');
      }

      const today = new Date().toISOString().split('T')[0];
      const monthStart = startOfMonth(new Date()).toISOString();

      // 1. Atendimentos hoje
      const { count: todayAppointments } = await supabase
        .from('atendimentos')
        .select('*', { count: 'exact', head: true })
        .gte('data_hora', `${today}T00:00:00Z`)
        .lte('data_hora', `${today}T23:59:59Z`);

      // 2. Clientes ativos
      const { count: totalClients } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // 3. Receita do mês
      const { data: revenueData } = await supabase
        .from('atendimentos')
        .select('valor')
        .eq('status_pagamento', 'pago')
        .gte('data_hora', monthStart);
      
      const monthlyRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
      setCurrentMonthRevenue(monthlyRevenue);

      // 4. Próximos Atendimentos (Agenda)
      const { data: agendaItems } = await supabase
        .from('agenda')
        .select(`
          id,
          data_hora,
          status,
          descricao,
          animais (nome, especie, clientes (nome))
        `)
        .gte('data_hora', `${today}T00:00:00Z`)
        .order('data_hora');

      setStats([
        { label: 'Atendimentos hoje', value: String(todayAppointments || 0), icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total de Clientes', value: String(totalClients || 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Receita do mês', value: `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Agendas Pendentes', value: String(agendaItems?.filter((i: any) => i.status === 'agendado').length || 0), icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
      ]);

      setSchedule(agendaItems?.map((item: any) => ({
        id: item.id,
        time: new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: item.status === 'concluido' ? 'done' : item.status === 'em_andamento' ? 'current' : 'pending',
        pet: item.animais?.nome,
        species: item.animais?.especie,
        client: item.animais?.clientes?.nome,
        type: item.descricao || 'Atendimento Geral'
      })) || []);

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-slate-100 min-h-screen">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Sincronizando clínica...</p>
      </div>
    );
  }

  const revenuePercentage = Math.min(Math.round((currentMonthRevenue / (financialTarget || 1)) * 100), 100);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        {/* ── Cabeçalho ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {greeting}, {userName} 👋
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium capitalize">
              {dateStr}
            </p>
          </div>
          <Link href="/agenda" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95">
            <Calendar size={18} />
            Minha Agenda
          </Link>
        </div>

        {/* ── Cards de Estatísticas ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <TrendingUp size={16} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Linha Principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Agenda de Hoje */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Agenda de Hoje</h3>
                <p className="text-sm text-slate-500 font-medium">{schedule.length} atendimentos programados</p>
              </div>
              <Link href="/agenda" className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-1 group">
                Ver tudo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="p-4 space-y-2 flex-1">
              {schedule.length > 0 ? (
                schedule.map((item) => (
                  <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group ${item.status === 'done' ? 'opacity-60' : ''}`}>
                    <span className="text-sm font-bold text-slate-400 tabular-nums w-12 shrink-0">{item.time}</span>
                    <SpeciesIcon species={item.species} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {item.pet} <span className="font-medium text-slate-400 ml-1">· {item.client}</span>
                      </p>
                      <p className="text-xs text-slate-500 font-medium truncate">{item.type}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tudo livre por aqui</p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="flex flex-col gap-6">
            {/* Meta Financeira */}
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700">
                <DollarSign size={100} />
              </div>
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-2 opacity-80">
                  <TrendingUp size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Meta de Receita</span>
                </div>
                <div>
                  <p className="text-4xl font-black tracking-tight leading-none">R$ {currentMonthRevenue.toLocaleString('pt-BR')}</p>
                  <p className="text-sm font-medium opacity-80 mt-2">de R$ {financialTarget.toLocaleString('pt-BR')} meta mensal</p>
                </div>
                
                <div className="space-y-2">
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-1000" 
                      style={{ width: `${revenuePercentage}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-right opacity-80">{revenuePercentage}% atingido</p>
                </div>

                <Link href="/financeiro" className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md p-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-sm">
                  Ver Fluxo de Caixa <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Dica do Dia */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dica do Dia</h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    "Lembre-se de registrar as vacinas e exames realizados para manter o histórico dos pacientes sempre atualizado."
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
