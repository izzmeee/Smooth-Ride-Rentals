import React, { useState } from 'react';
import type { Scooter } from '../types/index.ts';
import { ScooterCard } from './ScooterCard.tsx';
import { Search, RefreshCw, Bike } from 'lucide-react';

interface FleetViewProps {
  scooters: Scooter[];
  onBookNow: (scooter: Scooter) => void;
  onViewDetails: (scooter: Scooter) => void;
  onRefresh: () => void;
}

export const FleetView: React.FC<FleetViewProps> = ({
  scooters,
  onBookNow,
  onViewDetails,
  onRefresh
}) => {
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const brands = ['all', ...Array.from(new Set(scooters.map(s => s.brand)))];

  const filteredScooters = scooters.filter(scooter => {
    if (scooter.status === 'inactive') return false;
    if (availabilityFilter === 'available' && scooter.status !== 'available') return false;
    if (brandFilter !== 'all' && scooter.brand !== brandFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = scooter.name.toLowerCase().includes(q);
      const matchModel = scooter.model.toLowerCase().includes(q);
      const matchLocation = scooter.pickupLocation.toLowerCase().includes(q);
      const matchFleet = scooter.fleetId.toLowerCase().includes(q);
      if (!matchName && !matchModel && !matchLocation && !matchFleet) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0C10] tracking-[-0.025em]">
            Scooters Near You
          </h1>
          <div className="w-14 h-1 bg-[#FFCA20] rounded-full" />
          <p className="text-xs sm:text-sm text-neutral-600 pt-1">
            Flat ₹60/hour pricing · Accurate showroom models · Live Selaqui & Dehradun hub availability
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2.5 text-xs font-semibold text-[#0B0C10] bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200/80 transition-colors self-start md:self-auto inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Fleet</span>
        </button>
      </div>

      {/* Filter & Search Console */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Honda Activa, TVS Jupiter, Suzuki Access, Hero Destini, or hub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-neutral-200/80 rounded-xl bg-[#F5F6F8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B0C10] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-[#F5F6F8] p-1 rounded-xl border border-neutral-200/70">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3.5 py-2 text-xs rounded-lg transition-colors font-semibold whitespace-nowrap ${
                availabilityFilter === 'all'
                  ? 'bg-[#0B0C10] text-white'
                  : 'text-neutral-600 hover:text-[#0B0C10]'
              }`}
            >
              All Scooters
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3.5 py-2 text-xs rounded-lg transition-colors font-semibold whitespace-nowrap ${
                availabilityFilter === 'available'
                  ? 'bg-[#0B0C10] text-white'
                  : 'text-neutral-600 hover:text-[#0B0C10]'
              }`}
            >
              Available Now
            </button>
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="py-2.5 px-3.5 text-xs border border-neutral-200/80 rounded-xl bg-white font-semibold text-[#0B0C10] focus:outline-none focus:ring-2 focus:ring-[#0B0C10]"
          >
            {brands.map(b => (
              <option key={b} value={b}>
                {b === 'all' ? 'All Brands' : b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Showroom Grid */}
      {filteredScooters.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-14 text-center space-y-3">
          <Bike className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-display text-base font-bold text-[#0B0C10]">No scooters match your filters</h3>
          <p className="text-xs text-neutral-500">
            Clear your search or select "All Scooters" to view the full fleet.
          </p>
          <button
            onClick={() => {
              setAvailabilityFilter('all');
              setBrandFilter('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 text-xs font-bold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f2bc12] rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredScooters.map(scooter => (
            <ScooterCard
              key={scooter.id}
              scooter={scooter}
              onBookNow={onBookNow}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

    </div>
  );
};
