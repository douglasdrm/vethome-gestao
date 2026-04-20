// Server Component — sem 'use client'
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
} from 'lucide-react';
import Link from 'next/link';

// ─── Dados Mockados ───────────────────────────────────────────────────────────

const statsData = [
  {
    label: 'Atendimentos hoje',
    value: '8',
    trend: '+2 vs ontem',
    trendUp: true,
    icon: Stethoscope,
    iconBg: 'var(--brand-50)',
    iconColor: 'var(--brand-600)',
  },
  {
    label: 'Clientes ativos',
    value: '142',
    trend: '+5 este mês',
    trendUp: true,
    icon: Users,
    iconBg: 'var(--blue-100)',
    iconColor: 'var(--blue-500)',
  },
  {
    label: 'Receita do mês',
    value: 'R$ 4.820',
    trend: '+12% vs mês ant.',
    trendUp: true,
    icon: DollarSign,
    iconBg: 'var(--amber-100)',
    iconColor: 'var(--amber-500)',
  },
  {
    label: 'Consultas pendentes',
    value: '3',
    trend: 'Para amanhã',
    trendUp: false,
    icon: Calendar,
    iconBg: 'var(--violet-100)',
    iconColor: 'var(--violet-500)',
  },
];

const todaySchedule = [
  { time: '09:00', status: 'done',    pet: 'Thor',   species: 'Cão',  client: 'Marcos Oliveira',  type: 'Consulta Geral',    id: '1' },
  { time: '10:30', status: 'done',    pet: 'Luna',   species: 'Gata', client: 'Ana Paula',        type: 'Vacinação V4',      id: '2' },
  { time: '13:00', status: 'current', pet: 'Bob',    species: 'Cão',  client: 'Roberto Lima',     type: 'Retorno Pós-Op',    id: '3' },
  { time: '15:00', status: 'pending', pet: 'Mia',    species: 'Gata', client: 'Fernanda Costa',   type: 'Consulta Geral',    id: '4' },
  { time: '16:30', status: 'pending', pet: 'Buddy',  species: 'Cão',  client: 'Carlos Santos',    type: 'Vacinação Antirrábica', id: '5' },
];

const recentActivity = [
  { action: 'Novo atendimento',  detail: 'Thor — Marcos Oliveira',   time: 'há 2h',   color: 'var(--brand-500)',  bg: 'var(--brand-50)' },
  { action: 'Pagamento recebido', detail: 'R$ 250,00 — Ana Paula', time: 'há 3h',   color: 'var(--amber-500)', bg: 'var(--amber-100)' },
  { action: 'Vacina registrada', detail: 'V4 — Luna',              time: 'há 3h',   color: 'var(--sky-500)',   bg: 'var(--sky-100)' },
  { action: 'Novo cliente',      detail: 'Fernanda Costa',         time: 'ontem',   color: 'var(--violet-500)',bg: 'var(--violet-100)' },
];

const alerts = [
  { type: 'warning', text: 'Thor (Marcos) — Vacina V8 vence em 5 dias' },
  { type: 'danger',  text: 'Luna (Ana Paula) — Vermífugo atrasado há 7 dias' },
];

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
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

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
        <Link href="/atendimentos" className="btn btn-primary btn-sm" id="btn-novo-atendimento-dash">
          <Stethoscope size={15} />
          Novo Atendimento
        </Link>
      </div>

      {/* ── Alertas ── */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {alerts.map((alert, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: alert.type === 'danger' ? 'var(--rose-100)' : 'var(--amber-100)',
              border: `1px solid ${alert.type === 'danger' ? '#fecdd3' : '#fde68a'}`,
              fontSize: '0.825rem',
              color: alert.type === 'danger' ? 'var(--rose-500)' : 'var(--amber-500)',
              fontWeight: 500,
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {alert.text}
            </div>
          ))}
        </div>
      )}

      {/* ── Cards de Estatísticas ── */}
      <div className="grid-cols-4" style={{ gap: '1rem' }}>
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon" style={{ background: stat.iconBg }}>
                  <Icon size={20} style={{ color: stat.iconColor }} />
                </div>
                <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p className="stat-card-value">{stat.value}</p>
                <p className="stat-card-label">{stat.label}</p>
              </div>
              <p className={`stat-card-trend ${stat.trendUp ? 'trend-up' : 'text-muted'}`}>
                {stat.trendUp ? '▲' : '→'} {stat.trend}
              </p>
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
              <p className="card-subtitle">{todaySchedule.length} atendimentos programados</p>
            </div>
            <Link href="/agenda" className="btn btn-ghost btn-sm" id="btn-ver-agenda">
              Ver tudo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {todaySchedule.map((item) => (
                <Link
                  key={item.id}
                  href={`/clientes/${item.id}`}
                  id={`schedule-item-${item.id}`}
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
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Atividade Recente */}
          <div className="card">
            <div className="card-header">
              <p className="card-title">Atividade Recente</p>
            </div>
            <div className="card-body">
              <div className="timeline">
                {recentActivity.map((item, i) => (
                  <div key={i} className="timeline-item">
                    <div>
                      <div
                        className="timeline-dot"
                        style={{ background: item.bg, color: item.color, width: 32, height: 32 }}
                      >
                        <PawPrint size={14} />
                      </div>
                      {i < recentActivity.length - 1 && <div className="timeline-line" />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <p className="timeline-title" style={{ fontSize: '0.8rem' }}>{item.action}</p>
                        <span className="timeline-time">{item.time}</span>
                      </div>
                      <p className="timeline-body">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', border: 'none' }}>
            <div className="card-body" style={{ color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', opacity: 0.85 }}>
                <DollarSign size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Financeiro — Abril</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
                R$ 4.820
              </p>
              <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '4px' }}>de R$ 6.000 meta</p>

              <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,.2)', borderRadius: 'var(--radius-full)', height: 6 }}>
                <div style={{
                  width: '80%',
                  height: '100%',
                  background: 'rgba(255,255,255,.85)',
                  borderRadius: 'var(--radius-full)',
                }} />
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '6px' }}>80% da meta atingida</p>

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
        </div>
      </div>
    </div>
  );
}
