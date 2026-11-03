"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import SofaViewer from "@/components/SofaViewer";
import { ArrowDown } from "lucide-react";

interface HeroProps {
  onOpenEnquiry: (productName?: string) => void;
}

export default function Hero({ onOpenEnquiry }: HeroProps) {
  const handleScrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector("#catalog");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[80vh] pt-24 pb-10 lg:pt-28 lg:pb-12 flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Simple, Non-Technical Header Before 3D Section */}
        <div className="mb-6 lg:mb-7">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#81766E] block">
              Living Room Collection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#37312D] font-normal tracking-tight">
              Comfortable Sofas, Made for Real Life.
            </h1>
          </div>

          <p className="max-w-none text-xs sm:text-sm text-[#81766E] font-light leading-relaxed xl:whitespace-nowrap">
            Designed for relaxing, watching movies, and spending time with family. Deep soft seating, clean lines, and fabrics built for everyday comfort.
          </p>
        </div>

        {/* Main Grid: 3D Model Dominant (~70% desktop prominence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Interactive 3D sofa viewer */}
          <div className="lg:col-span-8 order-1 flex flex-col items-center w-full">
            <SofaViewer
              objPath="/modals/obj/sofa.obj"
              mtlPath="/modals/obj/sofa.mtl"
            />
          </div>

          {/* Useful Product Information (Replacing Useless Swatches) */}
          <div className="lg:col-span-4 order-2 flex flex-col justify-center space-y-5 lg:pl-4">
            
            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#81766E] font-medium px-2 py-0.5 rounded bg-[#F2EDE6]">
                Signature Piece
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl text-[#37312D] font-normal tracking-tight">
                {siteConfig.product.name}
              </h2>

              <p className="text-xs sm:text-sm text-[#81766E] leading-relaxed">
                Spacious L-shaped sofa with a corner chaise lounge for stretching out. Deep, plush cushions that stay comfortable for hours.
              </p>

              <div className="pt-1 flex items-baseline gap-3">
                <span className="font-serif text-2xl sm:text-3xl text-[#37312D] font-medium">
                  {siteConfig.product.price}
                </span>
                <span className="text-[11px] text-[#81766E]">
                  Includes all 5 cushions
                </span>
              </div>
            </div>

            {/* Clean Key Facts (Minimal, Non-Technical) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DED6]">
                <span className="text-[10px] uppercase tracking-wider text-[#81766E] block mb-0.5 font-medium">
                  Dimensions
                </span>
                <span className="text-xs font-serif text-[#37312D] block">
                  230 × 190 × 76 cm
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DED6]">
                <span className="text-[10px] uppercase tracking-wider text-[#81766E] block mb-0.5 font-medium">
                  Capacity
                </span>
                <span className="text-xs font-serif text-[#37312D] block">
                  Seats 3 to 4 People
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DED6]">
                <span className="text-[10px] uppercase tracking-wider text-[#81766E] block mb-0.5 font-medium">
                  Cushions
                </span>
                <span className="text-xs font-serif text-[#37312D] block">
                  5 Pillows Included
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DED6]">
                <span className="text-[10px] uppercase tracking-wider text-[#81766E] block mb-0.5 font-medium">
                  Guarantee
                </span>
                <span className="text-xs font-serif text-[#37312D] block">
                  10-Year Frame Warranty
                </span>
              </div>
            </div>

            {/* Clean CTAs */}
            <div className="flex sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onOpenEnquiry(siteConfig.product.name)}
                className="w-full py-3.5 px-6 rounded-full bg-[#37312D] text-[#FAF8F5] text-xs font-medium uppercase tracking-[0.16em] hover:bg-[#25201D] transition-colors cursor-pointer text-center shadow-xs"
              >
                Order Now
              </button>

              <button
                type="button"
                onClick={handleScrollToCatalog}
                className="w-full py-2.5 px-6 rounded-full bg-[#F2EDE6] hover:bg-[#EAE4DC] text-[#37312D] text-xs font-medium uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Browse All</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#81766E]" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
