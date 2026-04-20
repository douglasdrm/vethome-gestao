'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  DollarSign, 
  Settings,
  Menu,
  X,
  Zap,
  PawPrint,
  Package,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: Calendar, label: 'Agenda', href: '/agenda' },
  { icon: Stethoscope, label: 'Serviços & Preços', href: '/servicos' },
  { icon: Package, label: 'Estoque', href: '/estoque' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onQuickLog?: () => void;
}

export function Sidebar({ isOpen, setIsOpen, onQuickLog }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Fecha o menu automaticamente ao trocar de rota no mobile
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Garante que o menu comece fechado no mobile e aberto no desktop
  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsOpen(true);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>

      {/* Backdrop Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
        lg:translate-x-0 lg:static lg:w-64
      `}>
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <PawPrint size={20} fill="currentColor" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800 block leading-none">Vethome</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Gestão Pet</span>
            </div>
          </div>

          {/* Botão de Ação Rápida */}
          <div className="mb-8">
            <button 
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 group"
              onClick={onQuickLog}
            >
              <Zap size={18} className="fill-emerald-300 text-emerald-300 group-hover:scale-110 transition-transform" />
              <span>Registrar Agora</span>
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-4">Menu Principal</p>
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${active 
                      ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                  `}
                >
                  <item.icon size={20} opacity={active ? 1 : 0.7} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Rodapé / Perfil / Logout */}
          <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                DR
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">Dra. Renata</p>
                <p className="text-[10px] text-slate-400 truncate">Médica Veterinária</p>
              </div>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all"
            >
              <LogOut size={20} />
              <span>Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
