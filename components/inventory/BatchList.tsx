import React from 'react';
import { 
  Calendar, 
  Hash, 
  Layers, 
  AlertTriangle, 
  Trash2, 
  Edit2
} from 'lucide-react';
import { isBefore, addDays, parseISO } from 'date-fns';

interface Batch {
  id: string;
  number: string;
  expiryDate: string;
  quantity: number;
  unit: string;
}

interface BatchListProps {
  batches: Batch[];
}

export function BatchList({ batches }: BatchListProps) {
  return (
    <div className="space-y-3">
      {batches.map((batch) => {
        const expiry = parseISO(batch.expiryDate);
        const isExpired = isBefore(expiry, new Date());
        const isExpiringSoon = isBefore(expiry, addDays(new Date(), 30)) && !isExpired;

        return (
          <div 
            key={batch.id} 
            className={`
              flex items-center justify-between p-4 rounded-2xl border transition-all
              ${isExpired ? 'bg-rose-50 border-rose-100/50' : 
                isExpiringSoon ? 'bg-amber-50 border-amber-100/50' : 
                'bg-white border-slate-100'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isExpired ? 'bg-rose-100 text-rose-600' : isExpiringSoon ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                <Hash size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Lote: {batch.number}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-400'}`}>
                    <Calendar size={12} />
                    Validade: {batch.expiryDate}
                  </span>
                  {isExpired && <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Vencido</span>}
                  {isExpiringSoon && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Vence Logo</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800">{batch.quantity} {batch.unit}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qtd. Disponível</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {batches.length === 0 && (
        <div className="py-8 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <AlertTriangle size={14} />
            Nenhum lote ativo
          </p>
        </div>
      )}
    </div>
  );
}
