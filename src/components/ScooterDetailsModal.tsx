import React from 'react';
import type { Scooter } from '../types/index.ts';
import { ScooterIllustration } from './ScooterIllustration.tsx';
import {
  X, Check, MapPin, Sparkles, CalendarPlus, AlertTriangle
} from 'lucide-react';

interface ScooterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scooter: Scooter | null;
  onBookNow: (scooter: Scooter) => void;
}

export const ScooterDetailsModal: React.FC<ScooterDetailsModalProps> = ({
  isOpen,
  onClose,
  scooter,
  onBookNow
}) => {
  if (!isOpen || !scooter) return null;

  const isAvailable = scooter.status === 'available';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0C10]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F5F6F8]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="font-bold text-[#0B0C10]">{scooter.fleetId}</span>
              <span aria-hidden="true">·</span>
              <span>Reg: {scooter.registrationPlate}</span>
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#0B0C10] mt-0.5">
              {scooter.name} — {scooter.model}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-[#0B0C10] hover:bg-neutral-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* Accurate Showroom Photograph */}
          <ScooterIllustration
            name={scooter.name}
            model={scooter.model}
            colorName={scooter.color}
            imageUrl={scooter.imageUrl}
            className="w-full h-64 rounded-2xl border border-neutral-200/80"
          />

          {/* Rate & Status Bar */}
          <div className="bg-[#0B0C10] text-white p-5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400">Fixed Student Hourly Rate</div>
              <div className="font-display text-3xl font-extrabold tabular-nums mt-0.5">
                ₹{scooter.hourlyRate}
                <span className="text-xs font-normal text-neutral-300 font-sans"> / hour</span>
              </div>
            </div>

            <div className="text-right text-xs font-bold">
              {isAvailable ? (
                <span className="text-[#FFCA20]">Ready for Immediate Pickup</span>
              ) : (
                <span className="text-amber-300 capitalize">Currently {scooter.status}</span>
              )}
            </div>
          </div>

          {/* Vehicle Specs Grid */}
          <div>
            <h3 className="text-xs font-bold text-neutral-500 mb-2">
              Vehicle Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">Engine</div>
                <div className="font-bold text-[#111111] mt-0.5">{scooter.engineCc} cc</div>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">Mileage</div>
                <div className="font-bold text-[#111111] mt-0.5">{scooter.mileage}</div>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">Helmets</div>
                <div className="font-bold text-[#111111] mt-0.5">{scooter.helmetsIncluded} ISI Sanitized</div>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">Odometer</div>
                <div className="font-bold text-[#111111] mt-0.5 tabular-nums">{scooter.odoReading} km</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xs font-bold text-neutral-500 mb-2">
              Equipped Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {scooter.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F7F8FA] text-[#111111] border border-neutral-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Condition Checklist */}
          <div className="p-3.5 bg-[#F7F8FA] border border-neutral-200 rounded-xl space-y-1.5 text-xs">
            <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#111111]" />
              <span>Condition & Maintenance Report</span>
            </h4>
            <p className="text-neutral-600">{scooter.conditionNotes}</p>
          </div>

          {/* Pickup Hub */}
          <div className="p-3.5 bg-[#F7F8FA] border border-neutral-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-[#111111] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-700" />
              <span>Pickup Location</span>
            </div>
            <div className="text-neutral-700 font-medium">{scooter.pickupLocation}</div>
          </div>

          {/* Rental Requirements */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Mandatory Rental Eligibility</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900">
              <li>Renter must be at least 18 years old with a valid physical two-wheeler Driving Licence.</li>
              <li>Wearing the provided ISI helmet is mandatory by law.</li>
              <li>Return scooter with the same fuel level as recorded at handover.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-[#F7F8FA] flex items-center justify-between">
          <div className="text-xs text-neutral-600">
            Rate: <strong className="text-[#111111] tabular-nums">₹{scooter.hourlyRate}/hr</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-bold text-neutral-700 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookNow(scooter);
              }}
              disabled={!isAvailable}
              className="py-2.5 px-5 text-xs font-extrabold text-[#111111] bg-[#FFCA20] hover:bg-[#f2bc12] disabled:bg-neutral-200 disabled:text-neutral-400 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book This Scooter</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
