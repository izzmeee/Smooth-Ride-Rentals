import React from 'react';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', inverted = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      {/* Rapido-inspired bold yellow emblem with crisp jet-black scooter icon */}
      <div className="w-9 h-9 shrink-0 bg-[#FFCA20] rounded-xl flex items-center justify-center shadow-2xs">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
          <path d="M5 29H31" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="10.5" cy="24.5" r="3.5" stroke="#111111" strokeWidth="2.4" fill="#FFCA20" />
          <circle cx="26.5" cy="24.5" r="3.5" stroke="#111111" strokeWidth="2.4" fill="#FFCA20" />
          <path
            d="M10.5 24.5H19.5L23.5 14.5H27"
            stroke="#111111"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M23.5 14.5L25.5 9.5M22.5 9.5H28" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M11 19.5C13 17.5 17 17.5 19.5 19.5L19.5 24.5H10.5"
            fill="#111111"
          />
        </svg>
      </div>

      <span
        className={`font-display font-extrabold text-[19px] tracking-[-0.025em] leading-none whitespace-nowrap ${
          inverted ? 'text-white' : 'text-[#0B0C10]'
        }`}
      >
        Smooth Ride
      </span>
    </div>
  );
};
