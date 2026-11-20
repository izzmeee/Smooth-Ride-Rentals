import React from 'react';
import { Home, Bike, CalendarPlus, Clock, Shield, User as UserIcon } from 'lucide-react';
import type { User } from '../types/index.ts';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenBooking,
  onOpenAuth
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-neutral-200/80 py-1.5 px-2 shadow-xl shadow-black/5 print:hidden">
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">

        {/* Home */}
        <button
          onClick={() => setCurrentTab('home')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[11px] font-semibold transition-colors ${
            currentTab === 'home' ? 'text-[#0B0C10]' : 'text-neutral-500 hover:text-[#0B0C10]'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${currentTab === 'home' ? 'text-[#0B0C10]' : 'text-neutral-400'}`} />
          <span>Home</span>
        </button>

        {/* Scooters */}
        <button
          onClick={() => setCurrentTab('fleet')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[11px] font-semibold transition-colors ${
            currentTab === 'fleet' ? 'text-[#0B0C10]' : 'text-neutral-500 hover:text-[#0B0C10]'
          }`}
        >
          <Bike className={`w-5 h-5 mb-0.5 ${currentTab === 'fleet' ? 'text-[#0B0C10]' : 'text-neutral-400'}`} />
          <span>Scooters</span>
        </button>

        {/* Center Signature Rapido Yellow Book Button */}
        <button
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center py-0.5 px-1 -mt-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FFCA20] text-[#0B0C10] flex items-center justify-center shadow-lg shadow-[#FFCA20]/30 border-2 border-white hover:bg-[#f4be10] transition-transform active:scale-95">
            <CalendarPlus className="w-5 h-5 text-[#0B0C10]" />
          </div>
          <span className="text-[11px] font-extrabold text-[#0B0C10] mt-0.5">Book</span>
        </button>

        {/* Rides */}
        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setCurrentTab('customer_dashboard');
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[11px] font-semibold transition-colors ${
            currentTab === 'customer_dashboard' ? 'text-[#111111]' : 'text-neutral-500 hover:text-[#111111]'
          }`}
        >
          <Clock className={`w-5 h-5 mb-0.5 ${currentTab === 'customer_dashboard' ? 'text-[#111111]' : 'text-neutral-400'}`} />
          <span>Rides</span>
        </button>

        {/* Admin or Profile */}
        {currentUser?.role === 'admin' ? (
          <button
            onClick={() => setCurrentTab('admin_dashboard')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[11px] font-semibold transition-colors ${
              currentTab === 'admin_dashboard' ? 'text-[#111111]' : 'text-neutral-500 hover:text-[#111111]'
            }`}
          >
            <Shield className={`w-5 h-5 mb-0.5 ${currentTab === 'admin_dashboard' ? 'text-[#111111]' : 'text-neutral-400'}`} />
            <span>Admin</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (currentUser) setCurrentTab('customer_dashboard');
              else onOpenAuth();
            }}
            className="min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[11px] font-semibold text-neutral-500 hover:text-[#111111] transition-colors"
          >
            <UserIcon className="w-5 h-5 mb-0.5 text-neutral-400" />
            <span>{currentUser ? 'Profile' : 'Log In'}</span>
          </button>
        )}

      </div>
    </nav>
  );
};
