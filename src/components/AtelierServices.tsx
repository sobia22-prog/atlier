"use client";

import React from "react";
import { Truck, Home, Shield, Ruler, ArrowUpRight } from "lucide-react";

interface AtelierServicesProps {
  onOpenEnquiry: (serviceName?: string) => void;
}

export default function AtelierServices({ onOpenEnquiry }: AtelierServicesProps) {
  const services = [
    {
      icon: Home,
      number: "01",
      title: "Free Fabric Samples at Home",
      description:
        "Feel our fabrics in your home before deciding. We mail free swatches straight to your door.",
    },
    {
      icon: Ruler,
      number: "02",
      title: "Help With Room Sizing",
      description:
        "Send us your room dimensions or photos, and we will verify the perfect fit for your space.",
    },
    {
      icon: Truck,
      number: "03",
      title: "In-Room Delivery & Setup",
      description:
        "White-glove delivery directly inside your room of choice, fully placed with packaging removed.",
    },
    {
      icon: Shield,
      number: "04",
      title: "10-Year Frame Guarantee",
      description:
        "Built with kiln-dried solid wood that never squeaks or wobbles, backed for a full decade.",
    },
  ];

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-[#E6DED6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with simple, warm, premium wording */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#81766E] block mb-1">
            Our Service & Promise
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#37312D] font-normal tracking-tight">
            Furniture Shopping, Done Right.
          </h2>
          <p className="text-xs sm:text-sm text-[#81766E] font-light leading-relaxed mt-2">
            Buying a sofa should be relaxing and straightforward. Here is how we make sure your new furniture fits your home and feels right for years to come.
          </p>
        </div>

        {/* 4 Premium Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-[#F2EDE6]/40 border border-[#E6DED6] transition-all hover:border-[#D8B9A6] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-[#E6DED6] text-[#37312D]">
                      <Icon className="w-4 h-4 text-[#81766E]" />
                    </div>
                    <span className="font-serif text-xs text-[#81766E] italic">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-[#37312D] font-normal mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#81766E] font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bespoke Ribbon */}
        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#F2EDE6] border border-[#E6DED6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-serif text-xl text-[#37312D]">
              Need a Custom Size or Special Color?
            </h4>
            <p className="text-xs text-[#81766E]">
              We can build this sofa slightly longer, shorter, or with alternative fabrics to fit your exact apartment or villa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenEnquiry("Custom Sizing or Special Fabric Request")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#37312D] text-[#FAF8F5] text-xs font-medium uppercase tracking-wider hover:bg-[#25201D] transition-colors shrink-0 cursor-pointer"
          >
            <span>Ask for Custom Size</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
