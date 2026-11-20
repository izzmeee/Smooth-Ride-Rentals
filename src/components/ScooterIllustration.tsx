import React, { useState } from 'react';
import { getScooterImage } from '../utils/scooterImages.ts';
import { Bike } from 'lucide-react';

interface ScooterIllustrationProps {
  model: string;
  name?: string;
  colorName?: string;
  imageUrl?: string;
  className?: string;
}

export const ScooterIllustration: React.FC<ScooterIllustrationProps> = ({
  model,
  name,
  colorName,
  imageUrl,
  className = 'w-full h-48'
}) => {
  const [imgError, setImgError] = useState(false);
  const displayName = name || model;
  const resolvedSrc = getScooterImage(`${name || ''} ${model}`, imageUrl);

  return (
    <div
      className={`relative flex items-center justify-center bg-white rounded-2xl overflow-hidden select-none border border-neutral-100 ${className}`}
    >
      {!imgError ? (
        <img
          src={resolvedSrc}
          alt={`${displayName}${colorName ? ` in ${colorName}` : ''}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain object-center p-2 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-neutral-400 p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFCA20]/20 text-[#111111] flex items-center justify-center">
            <Bike className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-neutral-700">{displayName}</span>
          {colorName && <span className="text-[11px] text-neutral-500">{colorName}</span>}
        </div>
      )}
    </div>
  );
};
