'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PetAvatar } from '@/components/pets/PetAvatar';
import { PetHistoryItem } from '@/components/pets/PetHistoryItem';
import { HealthAlert } from '@/components/health/HealthAlert';
import { 
  ArrowLeft, 
  Plus, 
  Weight, 
  Calendar, 
  Clock, 
  Edit3,
  Syringe,
  Stethoscope,
  ChevronRight,
  Filter,
  Camera
} from 'lucide-react';
import Link from 'next/link';

// Mock data para o perfil do pet
const PET_DATA = {
  id: 'p1',
  name: 'Thor',
  species: 'Cão',
  breed: 'Golden Retriever',
  age: '3 anos',
  gender: 'M',
  weight: '32.5',
  clientName: 'Douglas Medeiros',
  clientId: '1',
  alerts: [
    { type: 'allergy', label: 'Alergia', description: 'Reação severa a Dipirona' },
    { type: 'chronic', label: 'Condição', description: 'Displasia coxofemoral leve' }
  ],
  history: [
    {
      id: 'h1',
      type: 'vaccine' as const,
      date: '15/04/2026',
      title: 'Vacina V10 (Raiva)',
      description: 'Aplicação anual de reforço. Animal apresentou-se calmo durante o procedimento.',
      nextDose: '15/04/2027',
      attachments: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200&auto=format&fit=crop']
    },
    {
      id: 'h2',
      type: 'appointment' as const,
      date: '10/04/2026',
      title: 'Consulta Geral e Check-up',
      description: 'Avaliação de rotina devido à displasia. Recomendado fisioterapia leve.',
      attachments: ['https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=200&auto=format&fit=crop']
    },
    {
      id: 'h3',
      type: 'appointment' as const,
      date: '20/03/2026',
      title: 'Atendimento Domiciliar - Coceira',
      description: 'Dermatite atópica sazonal. Prescrito Apoquel e banhos terapêuticos.',
      attachments: []
    }
  ]
};

export default function DetalhePetPage() {
  const params = useParams();
  const router = useRouter();
  
  // No mundo real, buscaríamos pelo id `params.petId`
  const pet = PET_DATA;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Topo / Voltar */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href={`/clientes/${pet.clientId}`} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Perfil do Tutor ({pet.clientName})</span>
          </Link>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Edit3 size={18} />
            </button>
          </div>
        </div>

        {/* Card Principal de Perfil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="relative group/avatar">
                <PetAvatar species={pet.species} size="xl" />
                <button className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-all scale-75 group-hover/avatar:scale-100">
                  <Camera size={18} />
                </button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{pet.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${pet.gender === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                    {pet.gender === 'M' ? 'Macho' : 'Fêmea'}
                  </span>
                </div>

                <p className="text-lg text-slate-500 font-medium">{pet.species} • {pet.breed} • {pet.age}</p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="bg-slate-50 px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <Weight size={18} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Peso Atual</p>
                      <p className="text-lg font-bold text-slate-700 leading-none">{pet.weight} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-4">Alertas Clínicos</h3>
            {pet.alerts.length > 0 ? (
              pet.alerts.map((alert, i) => (
                <HealthAlert key={i} type={alert.type as any} label={alert.label} description={alert.description} />
              ))
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] text-center text-slate-400 text-sm">
                Sem alertas cadastrados
              </div>
            )}
          </div>
        </div>

        {/* Seção de Histórico e Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Timeline de Saúde */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Clock size={24} className="text-emerald-500" />
                Histórico de Saúde
              </h2>
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                <Filter size={20} />
              </button>
            </div>

            <div className="timeline-container">
               {pet.history.map((item) => (
                 <PetHistoryItem 
                    key={item.id}
                    type={item.type}
                    date={item.date}
                    title={item.title}
                    description={item.description}
                    attachments={item.attachments}
                    nextDose={item.nextDose}
                 />
               ))}
            </div>
          </div>

          {/* Widgets Laterais / Ações */}
          <div className="space-y-6">
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200">
              <h3 className="text-xl font-bold mb-6">Ações Rápidas</h3>
              <div className="space-y-3">
                <Link 
                  href={`/clientes/${pet.clientId}/pets/${pet.id}/atendimento/novo`}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 transition-all font-bold group"
                >
                  <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Stethoscope size={18} />
                  </div>
                  Iniciar Consulta
                  <ChevronRight size={16} className="ml-auto opacity-50" />
                </Link>
                <button className="w-full bg-white text-emerald-700 p-4 rounded-2xl flex items-center gap-3 transition-all font-bold group">
                  <div className="p-2 bg-emerald-50 rounded-xl group-hover:scale-110 transition-transform">
                    <Syringe size={18} />
                  </div>
                  Registrar Vacina
                  <ChevronRight size={16} className="ml-auto opacity-50" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-emerald-500" />
                Próximos Reforços
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                   <div>
                     <p className="text-sm font-bold text-slate-800">Vacina V10</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reforço Anual</p>
                   </div>
                   <span className="text-xs font-bold text-emerald-600">Abr 2027</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
