'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PetCard } from '@/components/pets/PetCard';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Mail, 
  Edit3, 
  Plus, 
  MessageSquare,
  User,
  PawPrint,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DetalheClientePage() {
  const params = useParams();
  const router = useRouter();
  
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientData() {
      try {
        const id = params.id as string;
        if (!id) return;

        const { data, error } = await supabase
          .from('clientes')
          .select(`
            *,
            animais (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Formata para o UI
        const formattedClient = {
          id: data.id,
          name: data.nome,
          phone: data.telefone || 'Não informado',
          email: data.email || 'Não informado',
          address: data.endereco || 'Não informado',
          petCount: data.animais?.length || 0,
          pets: data.animais?.map((a: any) => ({
            id: a.id,
            name: a.nome,
            species: a.especie,
            breed: a.raca || '-',
            age: a.data_nascimento ? 'Data cadastrada' : 'Idade incerta',
            gender: a.sexo === 'macho' ? 'M' : a.sexo === 'femea' ? 'F' : '-',
            alerts: []
          })) || []
        };

        setClient(formattedClient);
      } catch (err) {
        console.error('Erro ao buscar perfil do cliente:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchClientData();
  }, [params.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Carregando perfil do tutor...</p>
        </div>
      </AppShell>
    );
  }

  if (!client) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Cliente não encontrado</h2>
          <button onClick={() => router.push('/clientes')} className="mt-4 text-emerald-600 underline">Voltar para lista</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Topo / Voltar */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/clientes" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Clientes</span>
          </Link>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Edit3 size={18} />
            </button>
            <button className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors">
              <MessageSquare size={18} />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 mb-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-emerald-900 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <User size={160} />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-3xl border-2 border-emerald-100/50">
              {client.name.charAt(0)}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{client.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <Phone size={16} />
                  </div>
                  <span className="font-medium">{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <span className="font-medium">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 md:col-span-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <span className="font-medium">{client.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pets */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <PawPrint className="text-emerald-500" />
                Animais ({client.petCount})
              </h2>
              <p className="text-slate-500 text-sm">Histórico e cuidados para cada pet.</p>
            </div>
            <Link 
              href={`/clientes/${client.id}/pets/novo`}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <Plus size={18} />
              Adicionar Pet
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            {client.pets.map((pet: any) => (
              <PetCard 
                key={pet.id}
                id={pet.id}
                name={pet.name}
                species={pet.species}
                breed={pet.breed}
                age={pet.age}
                gender={pet.gender as any}
                alerts={pet.alerts as any}
              />
            ))}
          </div>
        </div>

        {/* Seção de Últimas Atividades (Timeline) */}
        <div className="bg-slate-50/50 rounded-3xl p-8 border border-dashed border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Clock size={20} className="text-slate-400" />
             Últimas Atividades do Tutor
           </h3>
           <div className="space-y-4">
             <div className="flex gap-4 items-start">
               <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
               <div className="flex-1">
                 <p className="text-sm font-bold text-slate-800">Vacinação de Thor (V10)</p>
                 <p className="text-xs text-slate-500">Há 2 dias</p>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
             </div>
             <div className="flex gap-4 items-start">
               <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
               <div className="flex-1">
                 <p className="text-sm font-bold text-slate-800">Consulta de Luna (Controle)</p>
                 <p className="text-xs text-slate-500">Há 1 semana</p>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
             </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
