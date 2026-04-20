import React from 'react';
import { Dog, Cat, PawPrint } from 'lucide-react';

interface PetAvatarProps {
  species?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  imageUrl?: string;
}

export function PetAvatar({ species, size = 'md', imageUrl }: PetAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-20 h-20 rounded-2xl',
    xl: 'w-32 h-32 rounded-[2rem]'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64
  };

  const isCat = species?.toLowerCase().includes('gato') || species?.toLowerCase().includes('felino');
  const isDog = species?.toLowerCase().includes('cão') || species?.toLowerCase().includes('cachorro') || species?.toLowerCase().includes('canino');

  if (imageUrl) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden border-2 border-white shadow-sm`}>
        <img src={imageUrl} alt="Pet" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-white shadow-sm group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors`}>
      {isCat ? (
        <Cat size={iconSizes[size]} />
      ) : isDog ? (
        <Dog size={iconSizes[size]} />
      ) : (
        <PawPrint size={iconSizes[size]} />
      )}
    </div>
  );
}
