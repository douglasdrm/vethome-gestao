'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  DollarSign,
  Settings,
  Bell,
  Search,
  Zap,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { QuickLogModal } from './services/QuickLogModal';

const pageTitles: Record<string, string> = {
  '/':             'Dashboard',
  '/clientes':     'Clientes',
  '/agenda':       'Agenda',
  '/atendimentos': 'Atendimentos',
  '/financeiro':   'Financeiro',
  '/configuracoes':'Configurações',
};

interface TopbarProps {
  title: string;
  onQuickLog: () => void;
}

function Topbar({ title, onQuickLog }: TopbarProps) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-search">
        <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input type="text" placeholder="Buscar cliente ou pet..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Notificações" id="btn-notificacoes">
          <Bell size={18} />
          <span className="badge" />
        </button>
        <button 
          className="btn btn-primary btn-sm flex items-center gap-1.5" 
          id="btn-novo-atendimento"
          onClick={onQuickLog}
        >
          <Zap size={15} fill="currentColor" />
          Lançar
        </button>
      </div>
    </header>
  );
}

const bottomNav = [
  { icon: LayoutDashboard, label: 'Início',       href: '/' },
  { icon: Users,           label: 'Clientes',     href: '/clientes' },
  { icon: Calendar,        label: 'Agenda',       href: '/agenda' },
  { icon: DollarSign,      label: 'Financeiro',   href: '/financeiro' },
];

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {bottomNav.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${active ? ' active' : ''}`}
          >
            <Icon />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Vethome';
  const [isQuickLogOpen, setIsQuickLogOpen] = React.useState(false);

  return (
    <div className="app-shell">
      <Sidebar onQuickLog={() => setIsQuickLogOpen(true)} />

      <div className="app-content">
        <Topbar title={title} onQuickLog={() => setIsQuickLogOpen(true)} />

        <main className="app-main" id="main-content">
          {children}
        </main>

        <BottomNav />
      </div>

      {/* FAB Mobile - Prioridade para o Lançamento Rápido */}
      <button 
        className="fab flex items-center justify-center bg-emerald-600 text-white shadow-xl" 
        id="btn-fab-novo" 
        title="Novo Registro Rápido"
        onClick={() => setIsQuickLogOpen(true)}
      >
        <Zap size={22} fill="currentColor" />
      </button>

      {/* Modal Global de Lançamento Rápido */}
      <QuickLogModal 
        isOpen={isQuickLogOpen} 
        onClose={() => setIsQuickLogOpen(false)} 
      />
    </div>
  );
}
