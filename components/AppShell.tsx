'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
  Loader2,
  Package
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { QuickLogModal } from './services/QuickLogModal';

const pageTitles: Record<string, string> = {
  '/':             'Dashboard',
  '/clientes':     'Clientes',
  '/agenda':       'Agenda',
  '/atendimentos': 'Atendimentos',
  '/financeiro':   'Financeiro',
  '/estoque':      'Estoque',
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
          onClick={onQuickLog}
          id="btn-atendimento-topbar"
        >
          <Zap size={14} fill="currentColor" />
          <span>Atendimento Rápido</span>
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  useEffect(() => {
    // 1. Verificar sessão inicial
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session && pathname !== '/login') {
        router.push('/login');
      }
      setLoading(false);
    };

    checkSession();

    // 2. Escutar mudanças na auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== '/login') {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  // Se estiver carregando, mostra o spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Se não tiver sessão e não estiver na página de login, redireciona (o useEffect cuida disso, mas aqui evitamos flash)
  if (!session && pathname !== '/login') return null;

  // Se estiver na página de login, renderiza apenas os filhos
  if (pathname === '/login') return <>{children}</>;

  const currentTitle = pageTitles[pathname] || 'VetHome';

  return (
    <div className="app-container">
      <Sidebar onQuickLog={() => setIsQuickLogOpen(true)} />
      
      <div className="main-content">
        <Topbar title={currentTitle} onQuickLog={() => setIsQuickLogOpen(true)} />
        
        <main className="content-area">
          {children}
        </main>
      </div>

      {/* FAB Mobile */}
      <button 
        className="fab flex items-center justify-center bg-emerald-600 text-white shadow-xl" 
        id="btn-fab-novo" 
        onClick={() => setIsQuickLogOpen(true)}
      >
        <Zap size={22} fill="currentColor" />
      </button>

      {/* Modal Global */}
      <QuickLogModal 
        isOpen={isQuickLogOpen} 
        onClose={() => setIsQuickLogOpen(false)} 
      />
    </div>
  );
}
