'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ClientCard } from '@/components/clients/ClientCard';
import { 
  Search, 
  UserPlus, 
  Filter,
  Loader2,
  Users
} from 'lucide-react';
import Link from 'next/link';
// import { supabase } from '@/lib/supabase'; // Adicionar quando estiver configurado

// Mock data para demonstração inicial enquanto o banco é populado
const MOCK_CLIENTS = [
  { id: '1', name: 'Douglas Medeiros', phone: '(11) 98888-7777', address: 'Rua das Flores, 123', petCount: 2 },
  { id: '2', name: 'Ana Silva', phone: '(11) 97777-6666', address: 'Av. Paulista, 1000', petCount: 1 },
  { id: '3', name: 'Ricardo Santos', phone: '(11) 96666-5555', address: 'Rua Amazonas, 45', petCount: 3 },
];

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState(MOCK_CLIENTS);

  // Simulação de busca
  useEffect(() => {
    const filtered = MOCK_CLIENTS.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
    setClients(filtered);
  }, [searchTerm]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Meus Clientes</h1>
            <p className="text-slate-500 text-sm">Gerencie os tutores e seus animais de estimação.</p>
          </div>
          
          <Link 
            href="/clientes/novo"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95"
          >
            <UserPlus size={18} />
            <span>Novo Cliente</span>
          </Link>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nome ou celular..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
            <Filter size={20} />
          </button>
        </div>

        {/* Grid de Clientes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <p className="mt-4 text-slate-500">Carregando clientes...</p>
          </div>
        ) : clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard 
                key={client.id}
                id={client.id}
                name={client.name}
                phone={client.phone}
                address={client.address}
                petCount={client.petCount}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Nenhum cliente encontrado</h3>
            <p className="text-slate-500 max-w-xs mt-2">
              Não encontramos clientes com os termos informados. Ajuste a busca ou cadastre um novo cliente.
            </p>
            <Link 
              href="/clientes/novo"
              className="mt-6 text-emerald-600 font-semibold hover:underline"
            >
              Cadastrar primeiro cliente
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
