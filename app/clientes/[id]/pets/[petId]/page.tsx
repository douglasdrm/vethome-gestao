'use client';

import React, { useState, useEffect } from 'react';
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
  Camera,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DetalhePetPage() {
  const params = useParams();
  const router = useRouter();
  
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPetProfile() {
      try {
        const petId = params.petId as string;
        if (!petId) return;

        // Traz as informações do animal com o dono (cliente)
        const { data: petData, error: petError } = await supabase
          .from('animais')
          .select(`
            *,
            cliente:clientes(nome)
          `)
          .eq('id', petId)
          .single();

        if (petError) throw petError;

        // Traz eventos médicos
        const { data: eventos, error: eventosError } = await supabase
          .from('eventos')
          .select('*')
          .eq('animal_id', petId)
          .order('data', { ascending: false });

        // Traz vacinas
        const { data: vacinas, error: vacinasError } = await supabase
          .from('vacinas')
          .select('*')
          .eq('animal_id', petId)
          .order('data_aplicacao', { ascending: false });

        // Consolidar Histórico
        const history: any[] = [];
        
        if (vacinas) {
          vacinas.forEach(v => {
            history.push({
              id: v.id,
              type: 'vaccine',
              date: new Date(v.data_aplicacao).toLocaleDateString('pt-BR'),
              title: `Vacina: ${v.nome}`,
              description: v.observacoes || `Fabricante: ${v.fabricante || '- '} | Lote: ${v.lote || '-'}`,
              nextDose: v.data_reforco ? new Date(v.data_reforco).toLocaleDateString('pt-BR') : undefined,
              attachments: [],
              timestamp: new Date(v.data_aplicacao).getTime()
            });
          });
        }

        if (eventos) {
          eventos.forEach(e => {
            history.push({
              id: e.id,
              type: 'appointment',
              date: new Date(e.data).toLocaleDateString('pt-BR'),
              title: e.titulo,
              description: e.descricao || 'Nenhuma descrição fornecida',
              attachments: [],
              timestamp: new Date(e.data).getTime()
            });
          });
        }

        // Ordena histórico geral pelo mais recente
        history.sort((a: any, b: any) => b.timestamp - a.timestamp);

        const ageCalculation = petData.data_nascimento 
          ? new Date().getFullYear() - new Date(petData.data_nascimento).getFullYear() + " anos" 
          : "Idade não info.";

        const formattedPet = {
          id: petData.id,
          name: petData.nome,
          species: petData.especie,
          breed: petData.raca || 'Sem raça definida',
          age: ageCalculation,
          gender: petData.sexo === 'macho' ? 'M' : petData.sexo === 'femea' ? 'F' : '?',
          weight: petData.peso_kg ? petData.peso_kg.toString() : '-',
          clientName: petData.cliente?.nome || 'Desconhecido',
          clientId: petData.cliente_id,
          alerts: [], // Exigiria tabela própria ou JSON no metadata
          history: history
        };

        setPet(formattedPet);
      } catch (err) {
        console.error('Erro ao buscar pet:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPetProfile();
  }, [params.petId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Carregando ficha do animal...</p>
        </div>
      </AppShell>
    );
  }

  if (!pet) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Pet não encontrado</h2>
          <button onClick={() => router.back()} className="mt-4 text-emerald-600 underline">Voltar</button>
        </div>
      </AppShell>
    );
  }

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
              pet.alerts.map((alert: any, i: number) => (
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
               {pet.history.map((item: any) => (
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
