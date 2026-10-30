"use client";

import React, { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowUpRight } from "lucide-react";

interface CatalogSectionProps {
  onOpenEnquiry: (productName?: string) => void;
}

const CATEGORIES = ["All", "Sofas", "Chairs", "Sectionals", "Ottomans"] as const;

export default function CatalogSection({ onOpenEnquiry }: CatalogSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredProducts =
    activeCategory === "All"
      ? siteConfig.collection
      : siteConfig.collection.filter((p) => p.category === activeCategory);

  return (
    <section id="catalog" className="py-16 sm:py-24 bg-[#F2EDE6]/40 border-t border-[#E6DED6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#81766E] block mb-1">
              Living Room Seating
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#37312D] font-normal tracking-tight">
              Furniture Catalog
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/80 border border-[#E6DED6] overflow-x-auto max-w-full">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-[#37312D] text-[#FAF8F5] shadow-xs"
                    : "text-[#81766E] hover:text-[#37312D] hover:bg-[#FAF8F5]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-[#FAF8F5] rounded-2xl border border-[#E6DED6] overflow-hidden transition-all duration-300 hover:border-[#D8B9A6] hover:shadow-sm"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] w-full bg-[#E5E1DC] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] uppercase text-[#81766E] border border-[#E6DED6]">
                  {product.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg text-[#37312D] font-normal">
                    {product.name}
                  </h3>

                  <p className="text-xs text-[#81766E] mt-0.5">
                    {product.subtitle}
                  </p>

                  <div className="pt-2 flex items-baseline justify-between">
                    <span className="font-serif text-base text-[#37312D] font-medium">
                      {product.price}
                    </span>
                    <span className="text-[11px] text-[#81766E]">
                      {product.dimensions}
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-[#E6DED6]/60">
                  <button
                    type="button"
                    onClick={() => onOpenEnquiry(product.name)}
                    className="w-full py-2.5 rounded-full border border-[#37312D] text-[#37312D] hover:bg-[#37312D] hover:text-[#FAF8F5] text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Enquire</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
