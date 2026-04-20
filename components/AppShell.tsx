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
    <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
      <h1 className="text-xl lg:text-2xl font-bold text-slate-800">{title}</h1>

      <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex-1 max-w-md mx-6">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Buscar cliente ou pet..." 
          className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
        <button 
          className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm" 
          onClick={onQuickLog}
        >
          <Zap size={16} className="fill-emerald-300 text-emerald-300" />
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
    // [MVP BYPASS] Temporariamente ignorando a verificação de sessão real
    // enquanto testamos a criação de clientes/pets localmente.
    setSession({ fake: true });
    setLoading(false);
  }, [router, pathname]);

  // Se estiver carregando, mostra o spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Se estiver na página de login, renderiza apenas os filhos
  if (pathname === '/login') return <>{children}</>;

  const currentTitle = pageTitles[pathname] || 'VetHome';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar onQuickLog={() => setIsQuickLogOpen(true)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={currentTitle} onQuickLog={() => setIsQuickLogOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* FAB Mobile */}
      <button 
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-600 text-white shadow-xl shadow-emerald-200 z-30 transition-transform active:scale-95" 
        id="btn-fab-novo" 
        onClick={() => setIsQuickLogOpen(true)}
      >
        <Zap size={24} fill="currentColor" />
      </button>

      {/* Modal Global */}
      <QuickLogModal 
        isOpen={isQuickLogOpen} 
        onClose={() => setIsQuickLogOpen(false)} 
      />
    </div>
  );
}
