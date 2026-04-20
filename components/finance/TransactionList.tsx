import React from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ChevronRight, 
  Calendar,
  Tag,
  Clock
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'Entrada' | 'Saída';
  category: string;
  description: string;
  value: string;
  date: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
}

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  const displayList = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="space-y-4">
      {displayList.map((tx) => (
        <div 
          key={tx.id} 
          className="group bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-6 hover:shadow-lg hover:shadow-slate-200/30 transition-all cursor-pointer"
        >
          {/* Ícone de Tipo */}
          <div className={`
              p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110
              ${tx.type === 'Entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
          `}>
            {tx.type === 'Entrada' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
          </div>

          {/* Dados da Transação */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{tx.category}</span>
              <span className={`
                  text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded
                  ${tx.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 
                    tx.status === 'Atrasado' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}
              `}>
                {tx.status}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 truncate">{tx.description}</h4>
            <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-400 font-medium">
               <span className="flex items-center gap-1"><Calendar size={12} /> {tx.date}</span>
               <span className="flex items-center gap-1"><Clock size={12} /> 14:30</span>
            </div>
          </div>

          {/* Valor */}
          <div className="text-right flex-shrink-0">
            <p className={`text-lg font-black tracking-tight ${tx.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {tx.type === 'Entrada' ? '+' : '-'} {tx.value}
            </p>
            <button className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-500 flex items-center gap-0.5 ml-auto transition-colors">
              Detalhes <ChevronRight size={12} />
            </button>
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
          <p className="text-slate-400 font-medium">Nenhuma movimentação registrada.</p>
        </div>
      )}
    </div>
  );
}
