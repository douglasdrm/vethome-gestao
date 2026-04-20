import React from 'react';
import { 
  Weight, 
  Thermometer, 
  Heart, 
  Wind, 
  Activity,
  AlertTriangle
} from 'lucide-react';

interface VitalsFormProps {
  vitals: {
    weight: string;
    temp: string;
    heartRate: string;
    respRate: string;
    tpc: string;
    mucosas: string;
  };
  onChange: (field: string, value: string) => void;
}

export function VitalsForm({ vitals, onChange }: VitalsFormProps) {
  // Verificação simples de temperatura (febre)
  const isFebrile = parseFloat(vitals.temp) > 39.5;
  const isHypothermic = parseFloat(vitals.temp) < 37.5 && vitals.temp !== '';

  return (
    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-emerald-500" size={20} />
        <h3 className="font-bold text-slate-800">Parâmetros Vitais (Opcional)</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Peso */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Weight size={14} />
            Peso (kg)
          </label>
          <input 
            type="number"
            step="0.1"
            placeholder="0.0"
            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
            value={vitals.weight}
            onChange={(e) => onChange('weight', e.target.value)}
          />
        </div>

        {/* Temperatura */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Thermometer size={14} />
            Temp (°C)
          </label>
          <div className="relative">
            <input 
              type="number"
              step="0.1"
              placeholder="38.5"
              className={`w-full p-3 rounded-xl border focus:ring-4 outline-none transition-all font-semibold
                ${isFebrile ? 'border-rose-300 bg-rose-50 focus:ring-rose-500/10 focus:border-rose-500' : 
                  isHypothermic ? 'border-blue-300 bg-blue-50 focus:ring-blue-500/10 focus:border-blue-500' :
                  'border-slate-200 bg-white focus:ring-emerald-500/10 focus:border-emerald-500'}
              `}
              value={vitals.temp}
              onChange={(e) => onChange('temp', e.target.value)}
            />
            {(isFebrile || isHypothermic) && (
              <AlertTriangle size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isFebrile ? 'text-rose-500' : 'text-blue-500'}`} />
            )}
          </div>
        </div>

        {/* FC */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Heart size={14} />
            FC (bpm)
          </label>
          <input 
            type="number"
            placeholder="120"
            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
            value={vitals.heartRate}
            onChange={(e) => onChange('heartRate', e.target.value)}
          />
        </div>

        {/* FR */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wind size={14} />
            FR (mpm)
          </label>
          <input 
            type="number"
            placeholder="30"
            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
            value={vitals.respRate}
            onChange={(e) => onChange('respRate', e.target.value)}
          />
        </div>

        {/* TPC */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            TPC (seg)
          </label>
          <input 
            type="text"
            placeholder="< 2s"
            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
            value={vitals.tpc}
            onChange={(e) => onChange('tpc', e.target.value)}
          />
        </div>

        {/* Mucosas */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            Mucosas
          </label>
          <select 
            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold"
            value={vitals.mucosas}
            onChange={(e) => onChange('mucosas', e.target.value)}
          >
            <option value="">Selecione...</option>
            <option value="Normocoradas">Normocoradas</option>
            <option value="Pálidas">Pálidas</option>
            <option value="Congestas">Congestas</option>
            <option value="Ictéricas">Ictéricas</option>
            <option value="Cianóticas">Cianóticas</option>
          </select>
        </div>
      </div>
    </div>
  );
}
