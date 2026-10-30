"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowUpRight } from "lucide-react";

interface LifestyleCraftsmanshipProps {
  onOpenEnquiry: (productName?: string) => void;
}

export default function LifestyleCraftsmanship({
  onOpenEnquiry,
}: LifestyleCraftsmanshipProps) {
  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-[#E6DED6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Real Living Room Photograph */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border border-[#E6DED6] shadow-sm">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={siteConfig.craftsmanship.imagePath}
                  alt={siteConfig.craftsmanship.imageAlt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </div>
            </div>
          </div>

          {/* Simple, Everyday Narrative */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#81766E] block">
              About Atelier Sorel
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl text-[#37312D] font-normal tracking-tight">
              Made for Everyday Life at Home.
            </h2>

            <p className="text-xs sm:text-sm text-[#81766E] font-light leading-relaxed">
              A good sofa is where life happens — slow Sunday mornings with coffee, reading, and relaxing with family in the evening. We design furniture that feels welcoming from the first moment you sit down and stays comfortable for years.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenEnquiry("General Questions & Consultation")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#37312D] text-[#37312D] hover:bg-[#37312D] hover:text-[#FAF8F5] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>Talk to Our Team</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
