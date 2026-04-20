import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  type?: 'positive' | 'negative' | 'neutral';
  trend?: string;
  icon: React.ReactNode;
}

export function KPICard({ label, value, type = 'neutral', trend, icon }: KPICardProps) {
  const typeStyles = {
    positive: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    negative: 'text-rose-600 bg-rose-50 border-rose-100',
    neutral: 'text-slate-600 bg-slate-50 border-slate-100'
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl ${typeStyles[type]} border`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h3>
        <p className={`text-3xl font-black tracking-tight ${type === 'negative' ? 'text-rose-600' : 'text-slate-800'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
