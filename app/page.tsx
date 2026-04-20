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
  AlertCircle,
  ArrowRight,
  PawPrint,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { startOfMonth } from 'date-fns';

// ─── Componentes Internos ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'done')    return <span className="badge badge-green"><CheckCircle size={10} /> Concluído</span>;
  if (status === 'current') return <span className="badge badge-blue"><Clock size={10} /> Em curso</span>;
  return <span className="badge badge-gray">Agendado</span>;
}

function SpeciesIcon({ species }: { species: string }) {
  const isPet = species === 'Cão';
  return (
    <span style={{
      fontSize: '1.1rem',
      width: 34,
      height: 34,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isPet ? 'var(--brand-50)' : 'var(--violet-100)',
      borderRadius: 'var(--radius-md)',
      flexShrink: 0,
    }}>
      {isPet ? '🐕' : '🐈'}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [financialTarget] = useState(6000); 
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const monthStart = startOfMonth(new Date()).toISOString();

      // 1. Atendimentos hoje
      const { count: todayAppointments } = await supabase
        .from('agenda')
        .select('*', { count: 'exact', head: true })
        .eq('data', today);

      // 2. Clientes ativos
      const { count: totalClients } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // 3. Receita do mês
      const { data: revenueData } = await supabase
        .from('financeiro')
        .select('valor')
        .eq('tipo', 'Receita')
        .eq('status', 'Pago')
        .gte('data_pagamento', monthStart);
      
      const monthlyRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
      setCurrentMonthRevenue(monthlyRevenue);

      // 4. Agendas Pendentes
      const { count: pendingAppointments } = await supabase
        .from('agenda')
        .select('*', { count: 'exact', head: true })
        .gte('data', today)
        .eq('status', 'Pendente');

      // 5. Agenda de Hoje Detalhada
      const { data: agendaItems } = await supabase
        .from('agenda')
        .select(`
          id,
          horario,
          status,
          tipo_servico,
          animais (nome, especie, clientes (nome))
        `)
        .eq('data', today)
        .order('horario');

      setStats([
        { label: 'Atendimentos hoje', value: String(todayAppointments || 0), icon: Stethoscope, bg: 'var(--brand-50)', color: 'var(--brand-600)' },
        { label: 'Total de Clientes', value: String(totalClients || 0), icon: Users, bg: 'var(--blue-100)', color: 'var(--blue-500)' },
        { label: 'Receita do mês', value: `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, bg: 'var(--amber-100)', color: 'var(--amber-500)' },
        { label: 'Agendas Pendentes', value: String(pendingAppointments || 0), icon: Calendar, bg: 'var(--violet-100)', color: 'var(--violet-500)' },
      ]);

      setSchedule(agendaItems?.map((item: any) => ({
        id: item.id,
        time: item.horario.substring(0, 5),
        status: item.status === 'Confirmado' ? 'done' : item.status === 'Em Andamento' ? 'current' : 'pending',
        pet: item.animais?.nome,
        species: item.animais?.especie,
        client: item.animais?.clientes?.nome,
        type: item.tipo_servico
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
      <div className="flex flex-col items-center justify-center py-40 bg-slate-50 min-h-screen">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Sincronizando clínica...</p>
      </div>
    );
  }

  const revenuePercentage = Math.min(Math.round((currentMonthRevenue / (financialTarget || 1)) * 100), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Cabeçalho ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {greeting}, Dra. Renata 👋
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>
            {dateStr}
          </p>
        </div>
        <Link href="/agenda" className="btn btn-primary btn-sm" id="btn-novo-atendimento-dash">
          <Stethoscope size={15} />
          Minha Agenda
        </Link>
      </div>

      {/* ── Cards de Estatísticas ── */}
      <div className="grid-cols-4" style={{ gap: '1rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon" style={{ background: stat.bg }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p className="stat-card-value">{stat.value}</p>
                <p className="stat-card-label">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Linha Principal ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>

        {/* Agenda de Hoje */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Agenda de Hoje</p>
              <p className="card-subtitle">{schedule.length} atendimentos programados</p>
            </div>
            <Link href="/agenda" className="btn btn-ghost btn-sm" id="btn-ver-agenda">
              Ver tudo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {schedule.length > 0 ? schedule.map((item) => (
                <div
                  key={item.id}
                  className={`schedule-row${item.status === 'done' ? ' schedule-row--done' : ''}`}
                >
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    width: 44,
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {item.time}
                  </span>

                  <SpeciesIcon species={item.species} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.pet}
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {' '}· {item.client}
                      </span>
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.type}</p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>
              )) : (
                <div className="py-10 text-center text-slate-400">
                   <Calendar size={24} className="mx-auto mb-2 opacity-20" />
                   <p className="text-sm font-medium">Sem compromissos para hoje</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Resumo Financeiro */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', border: 'none' }}>
            <div className="card-body" style={{ color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', opacity: 0.85 }}>
                <DollarSign size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Financeiro — Meta Mensal</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
                R$ {currentMonthRevenue.toLocaleString('pt-BR')}
              </p>
              <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '4px' }}>de R$ {financialTarget.toLocaleString('pt-BR')} meta</p>

              <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,.2)', borderRadius: 'var(--radius-full)', height: 6 }}>
                <div style={{
                  width: `${revenuePercentage}%`,
                  height: '100%',
                  background: 'rgba(255,255,255,.85)',
                  borderRadius: 'var(--radius-full)',
                }} />
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '6px' }}>{revenuePercentage}% da meta atingida</p>

              <Link href="/financeiro" className="btn btn-sm" id="btn-ver-financeiro-dash" style={{
                marginTop: '1rem',
                background: 'rgba(255,255,255,.2)',
                color: 'white',
                display: 'inline-flex',
                gap: '0.375rem',
                alignItems: 'center',
                backdropFilter: 'blur(4px)',
              }}>
                Ver detalhes <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Dica do Especialista</h4>
             <p className="text-sm text-slate-600 leading-relaxed font-medium">
               "Lembre-se de registrar as vacinas aplicadas hoje para atualizar o estoque automaticamente."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
