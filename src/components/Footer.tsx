"use client";

import React, { useState } from "react";
import { siteConfig } from "@/config/site";
import { ArrowUp, Check } from "lucide-react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail("");
    }, 2000);
  };

  return (
    <footer className="bg-[#F2EDE6] text-[#37312D] border-t border-[#E6DED6] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#E6DED6]">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex flex-col justify-center items-center gap-[3px]">
                <span className="w-full h-[1px] bg-[#37312D]" />
                <span className="w-2.5 h-[1px] bg-[#D8B9A6]" />
                <span className="w-full h-[1px] bg-[#37312D]" />
              </div>
              <span className="font-serif text-lg tracking-[0.2em] uppercase text-[#37312D] font-medium">
                {siteConfig.brand.name}
              </span>
            </div>

            <p className="font-serif text-base italic text-[#81766E]">
              &ldquo;{siteConfig.brand.tagline}&rdquo;
            </p>

            <p className="text-xs text-[#81766E] max-w-sm leading-relaxed">
              Thoughtfully designed sofas and lounge seating made for everyday comfort at home.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#81766E] block">
              Quick Links
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="#hero"
                  className="text-[#81766E] hover:text-[#37312D] transition-colors"
                >
                  3D Sofa View
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className="text-[#81766E] hover:text-[#37312D] transition-colors"
                >
                  Furniture Catalog
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-[#81766E] hover:text-[#37312D] transition-colors"
                >
                  Delivery & Guarantees
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-[#81766E] hover:text-[#37312D] transition-colors"
                >
                  About Our Studio
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#81766E] block">
              Stay in Touch
            </span>
            <p className="text-xs text-[#81766E] leading-relaxed">
              Sign up to receive announcements about new furniture designs and seasonal sales.
            </p>

            {!newsletterSubscribed ? (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 pt-1">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-3.5 py-2 rounded-full bg-white border border-[#E6DED6] text-xs text-[#37312D] placeholder-[#81766E]/60 focus:outline-none focus:ring-1 focus:ring-[#37312D]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#37312D] text-[#FAF8F5] text-xs font-medium uppercase tracking-wider hover:bg-[#25201D] transition-colors shrink-0 cursor-pointer"
                >
                  Join
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-full bg-white border border-[#E6DED6] text-xs text-[#37312D]">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Thank you. You are on our mailing list.</span>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#81766E]">
          <div>
            <span>© 2026 {siteConfig.brand.name}. All rights reserved.</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#81766E] hover:text-[#37312D] transition-colors cursor-pointer group"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </footer>
  );
}
