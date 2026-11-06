import React from "react";

interface AtelierLogoProps {
  className?: string;
  showText?: boolean;
}

export default function AtelierLogo({ className = "", showText = true }: AtelierLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* High-End Architectural Atelier Emblem */}
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#F2EDE6] border border-[#D5CCC1] shadow-2xs flex items-center justify-center shrink-0 group-hover:border-[#37312D] transition-colors">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-5.5 sm:h-5.5"
        >
          {/* Architectural Atelier Arch (representing salon & craftsmanship) */}
          <path
            d="M8 23V14C8 9.58172 11.5817 6 16 6C20.4183 6 24 9.58172 24 14V23"
            stroke="#37312D"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Sculptural Chaise / Lounge Seat Contour */}
          <path
            d="M6 20.5H26"
            stroke="#37312D"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Elegant Artisan Terracotta/Gold Accent Mark */}
          <circle cx="16" cy="13.5" r="2" fill="#C9936A" />
          {/* Refined furniture leg accents */}
          <line x1="10.5" y1="23" x2="10.5" y2="25.5" stroke="#81766E" strokeWidth="1.25" strokeLinecap="round" />
          <line x1="21.5" y1="23" x2="21.5" y2="25.5" stroke="#81766E" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span className="font-serif text-base sm:text-lg tracking-[0.18em] sm:tracking-[0.22em] uppercase text-[#37312D] font-medium leading-none truncate">
            Atelier Sorel
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.24em] text-[#81766E] uppercase font-light mt-1 flex items-center gap-1.5">
            <span>Furniture Studio</span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#C9936A]" />
            <span className="hidden sm:inline">Paris &bull; Milan</span>
          </span>
        </div>
      )}
    </div>
  );
}
