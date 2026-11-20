import React from 'react';
import { Logo } from './Logo.tsx';
import type { User } from '../types/index.ts';
import { Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenBooking: () => void;
  onOpenTestingChecklist: () => void;
  onOpenPdfModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenBooking,
  onOpenPdfModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-neutral-200/80 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">

        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          onClick={() => setCurrentTab('home')}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCA20] rounded-lg shrink-0"
        >
          <Logo />
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-neutral-600">
          <button
            onClick={() => setCurrentTab('home')}
            className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors ${
              currentTab === 'home'
                ? 'text-[#0B0C10] font-semibold'
                : 'hover:text-[#0B0C10]'
            }`}
          >
            <span>Home</span>
            {currentTab === 'home' && (
              <span className="absolute inset-x-0 -bottom-[19px] h-[2.5px] bg-[#FFCA20] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('fleet')}
            className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors ${
              currentTab === 'fleet'
                ? 'text-[#0B0C10] font-semibold'
                : 'hover:text-[#0B0C10]'
            }`}
          >
            <span>Scooters</span>
            {currentTab === 'fleet' && (
              <span className="absolute inset-x-0 -bottom-[19px] h-[2.5px] bg-[#FFCA20] rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setCurrentTab('home');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 60);
            }}
            className="whitespace-nowrap shrink-0 py-1.5 hover:text-[#0B0C10] transition-colors"
          >
            How It Works
          </button>

          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => setCurrentTab('admin_dashboard')}
              className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors inline-flex items-center gap-1.5 ${
                currentTab === 'admin_dashboard'
                  ? 'text-[#0B0C10] font-semibold'
                  : 'hover:text-[#0B0C10]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
              {currentTab === 'admin_dashboard' && (
                <span className="absolute inset-x-0 -bottom-[19px] h-[2.5px] bg-[#FFCA20] rounded-full" />
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentUser) setCurrentTab('customer_dashboard');
                else onOpenAuth();
              }}
              className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                currentTab === 'customer_dashboard'
                  ? 'text-[#0B0C10] font-semibold'
                  : 'hover:text-[#0B0C10]'
              }`}
            >
              <span>My Rides</span>
              {currentTab === 'customer_dashboard' && (
                <span className="absolute inset-x-0 -bottom-[19px] h-[2.5px] bg-[#FFCA20] rounded-full" />
              )}
            </button>
          )}

          <button
            onClick={onOpenPdfModal}
            className="whitespace-nowrap shrink-0 py-1.5 hover:text-[#0B0C10] transition-colors"
          >
            Report PDF
          </button>
        </nav>

        {/* Zone 3: User Access + Tactile Signature CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setCurrentTab(currentUser.role === 'admin' ? 'admin_dashboard' : 'customer_dashboard')
                }
                className="text-xs font-semibold text-neutral-700 hover:text-[#0B0C10] px-2.5 py-2 rounded-lg hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0"
              >
                {currentUser.name.split(' ')[0]}
              </button>
              <button
                onClick={onLogout}
                title="Log Out"
                aria-label="Log Out"
                className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-[#0B0C10] px-3 py-2 transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onOpenBooking}
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f2bc12] active:scale-[0.98] rounded-xl transition-all duration-150 shadow-[0_2px_10px_-2px_rgba(255,202,32,0.55)] whitespace-nowrap shrink-0"
          >
            Book Ride
          </button>
        </div>

      </div>
    </header>
  );
};
