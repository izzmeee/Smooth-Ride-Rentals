import React from 'react';
import type { Scooter } from '../types/index.ts';
import { ScooterIllustration } from './ScooterIllustration.tsx';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface ScooterCardProps {
  scooter: Scooter;
  onBookNow: (scooter: Scooter) => void;
  onViewDetails: (scooter: Scooter) => void;
}

export const ScooterCard: React.FC<ScooterCardProps> = ({
  scooter,
  onBookNow,
  onViewDetails
}) => {
  const isAvailable = scooter.status === 'available';

  return (
    <article className="group bg-white rounded-3xl border border-neutral-200/80 hover:border-neutral-300 transition-all duration-200 ease-premium hover:-translate-y-1 hover:shadow-[0_20px_44px_-18px_rgba(11,12,16,0.16)] flex flex-col overflow-hidden">

      {/* Showroom Vehicle Stage */}
      <button
        type="button"
        onClick={() => onViewDetails(scooter)}
        className="w-full p-4 pb-2 bg-gradient-to-b from-white to-[#FAFBFD] text-left focus-visible:outline-none"
      >
        <ScooterIllustration
          name={scooter.name}
          model={scooter.model}
          colorName={scooter.color}
          imageUrl={scooter.imageUrl}
          className="w-full h-52 rounded-2xl border-0 bg-transparent"
        />
      </button>

      {/* Architectural Spec & Action Body */}
      <div className="p-5 pt-3 flex-1 flex flex-col">

        {/* Quiet Metadata Line (Zero-Pill Discipline) */}
        <div className="flex items-center justify-between gap-2 text-[11.5px] text-neutral-500 mb-2">
          <div className="flex items-center gap-1.5 font-mono truncate">
            <span className="font-semibold text-neutral-800">{scooter.fleetId}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{scooter.registrationPlate}</span>
          </div>
          <span
            className={`font-semibold shrink-0 ${
              isAvailable
                ? 'text-emerald-700'
                : scooter.status === 'booked'
                ? 'text-amber-700'
                : 'text-neutral-500'
            }`}
          >
            {isAvailable ? 'Available' : scooter.status === 'booked' ? 'On Trip' : 'Maintenance'}
          </span>
        </div>

        {/* Model Name & Tabular Rate */}
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h3 className="font-display text-lg font-bold text-[#0B0C10] tracking-tight leading-snug truncate">
            {scooter.name}
          </h3>
          <div className="text-right shrink-0">
            <span className="font-display text-xl font-extrabold text-[#0B0C10] tabular-nums">
              ₹{scooter.hourlyRate}
            </span>
            <span className="text-xs font-medium text-neutral-500">/hr</span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 truncate mb-3.5">
          {scooter.model} · {scooter.color}
        </p>

        {/* Minimalist Hairline Spec Strip */}
        <div className="flex items-center gap-2 text-xs text-neutral-600 py-3 border-t border-neutral-100">
          <span className="font-medium text-neutral-800">{scooter.engineCc}cc</span>
          <span aria-hidden="true" className="text-neutral-300">·</span>
          <span>{scooter.mileage}</span>
          <span aria-hidden="true" className="text-neutral-300">·</span>
          <span>{scooter.helmetsIncluded} ISI Helmet{scooter.helmetsIncluded > 1 ? 's' : ''}</span>
        </div>

        {/* Pickup Hub */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-5">
          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate">{scooter.pickupLocation}</span>
        </div>

        {/* Tactile Dual Action Bar */}
        <div className="mt-auto grid grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(scooter)}
            className="col-span-2 py-2.5 px-3 text-xs font-semibold text-neutral-700 hover:text-[#0B0C10] bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors whitespace-nowrap"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onBookNow(scooter)}
            disabled={!isAvailable}
            className={`col-span-3 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-150 inline-flex items-center justify-center gap-1 whitespace-nowrap ${
              isAvailable
                ? 'bg-[#FFCA20] hover:bg-[#f2bc12] active:scale-[0.98] text-[#0B0C10] shadow-[0_2px_10px_-3px_rgba(255,202,32,0.55)]'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <span>{isAvailable ? 'Book Now' : 'Unavailable'}</span>
            {isAvailable && <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
          </button>
        </div>
      </div>

    </article>
  );
};
