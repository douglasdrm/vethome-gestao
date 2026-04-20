import React from 'react';
import { 
  Dna, 
  Settings, 
  Calendar, 
  History, 
  Syringe,
  ChevronRight,
  PawPrint
} from 'lucide-react';
import { HealthAlert } from '../health/HealthAlert';

interface PetCardProps {
  id: string;
  name: string;
  species: 'Cão' | 'Gato' | string;
  breed: string;
  age: string;
  gender: 'M' | 'F';
  alerts?: Array<{ type: 'allergy' | 'chronic' | 'warning', label: string, description: string }>;
}

export function PetCard({ id, name, species, breed, age, gender, alerts }: PetCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="p-6">
        {/* Cabeçalho do Pet */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
              <PawPrint size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">{name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${gender === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                  {gender === 'M' ? 'Macho' : 'Fêmea'}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{species} • {breed} • {age}</p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Alertas de Saúde - Inspirado no SimplesVet */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-2 mb-6">
            {alerts.map((alert, index) => (
              <HealthAlert 
                key={index}
                type={alert.type}
                label={alert.label}
                description={alert.description}
              />
            ))}
          </div>
        )}

        {/* Ações Rápidas do Pet */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-all group/btn">
            <Syringe size={20} className="mb-1 group-hover/btn:scale-110 transition-transform" />
            <span className="text-xs font-bold">Vacinas</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all group/btn">
            <History size={20} className="mb-1 group-hover/btn:scale-110 transition-transform" />
            <span className="text-xs font-bold">Histórico</span>
          </button>
        </div>
      </div>

      <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 transition-colors border-t border-slate-100">
        Prontuário Completo
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
