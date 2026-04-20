import React from 'react';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Dog,
  MessageSquare
} from 'lucide-react';

interface ClientCardProps {
  id: string;
  name: string;
  phone: string;
  address?: string;
  petCount: number;
}

export function ClientCard({ id, name, phone, address, petCount }: ClientCardProps) {
  return (
    <Link 
      href={`/clientes/${id}`}
      className="group block bg-white rounded-2xl border border-slate-100 p-5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">
              {name}
            </h3>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={14} className="text-slate-400" />
                <span>{phone}</span>
              </div>
              {address && (
                <div className="flex items-center gap-2 text-sm text-slate-500 max-w-[200px] truncate">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="truncate">{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold">
          <Dog size={14} />
          <span>{petCount} {petCount === 1 ? 'Pet' : 'Pets'}</span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <MessageSquare size={16} />
            <span>WhatsApp</span>
          </button>
        </div>
        <div className="text-slate-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-medium lg:text-slate-300 lg:group-hover:text-emerald-500">
          <span>Ver perfil</span>
          <ChevronRight size={18} />
        </div>
      </div>
    </Link>
  );
}
