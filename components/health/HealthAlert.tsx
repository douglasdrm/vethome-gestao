import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface HealthAlertProps {
  type: 'allergy' | 'chronic' | 'warning';
  label: string;
  description?: string;
}

export function HealthAlert({ type, label, description }: HealthAlertProps) {
  const styles = {
    allergy: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      text: 'text-rose-700',
      icon: <ShieldAlert size={16} />,
      labelClass: 'bg-rose-100 text-rose-800'
    },
    chronic: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      icon: <AlertCircle size={16} />,
      labelClass: 'bg-amber-100 text-amber-800'
    },
    warning: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      icon: <AlertCircle size={16} />,
      labelClass: 'bg-blue-100 text-blue-800'
    }
  };

  const current = styles[type];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${current.bg} ${current.border} ${current.text} transition-all hover:shadow-sm`}>
      <div className="mt-0.5">
        {current.icon}
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider block mb-0.5">{label}</span>
        {description && <p className="text-sm font-medium leading-tight opacity-90">{description}</p>}
      </div>
    </div>
  );
}
