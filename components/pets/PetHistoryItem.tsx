import React from 'react';
import { 
  FileText, 
  Syringe, 
  Camera, 
  Calendar,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface PetHistoryItemProps {
  type: 'appointment' | 'vaccine' | 'exam';
  date: string;
  title: string;
  description: string;
  attachments?: string[];
  nextDose?: string;
}

export function PetHistoryItem({ type, date, title, description, attachments, nextDose }: PetHistoryItemProps) {
  const config = {
    appointment: {
      icon: <FileText size={18} />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      label: 'Atendimento'
    },
    vaccine: {
      icon: <Syringe size={18} />,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      label: 'Vacina'
    },
    exam: {
      icon: <Camera size={18} />,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      label: 'Exame/Imagem'
    }
  };

  const current = config[type];

  return (
    <div className="relative pl-10 pb-10 group last:pb-0">
      {/* Linha da Timeline */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 group-last:bottom-10" />
      
      {/* Marcador da Timeline */}
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${current.bgColor} ${current.iconColor} flex items-center justify-center z-10 shadow-sm border-2 border-white`}>
        {current.icon}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 transition-all hover:shadow-lg hover:shadow-slate-200/40 group/card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${current.bgColor} ${current.iconColor}`}>
                {current.label}
              </span>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Calendar size={12} />
                {date}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-800">{title}</h4>
          </div>
          
          <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
            Ver Detalhes
            <ChevronRight size={14} />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {description}
        </p>

        {/* Informação de Próxima Dose (se houver) */}
        {nextDose && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
            <Calendar size={14} />
            Próximo Reforço Escolhido: {nextDose}
          </div>
        )}

        {/* Anexos (Fotos) vinculados ao registro */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-50">
            {attachments.map((url, i) => (
              <div key={i} className="relative group/img w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in">
                <img src={url} alt="Anexo" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <ExternalLink size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
