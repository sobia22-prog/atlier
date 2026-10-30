"use client";

import React, { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  onOpenEnquiry: (productName?: string) => void;
  enquiryCount?: number;
}

export default function Navbar({ onOpenEnquiry }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 w-full ${
          isScrolled
            ? "bg-[#FAF8F5]/96 backdrop-blur-md border-b border-[#E6DED6]/80 py-2.5 sm:py-3 shadow-2xs"
            : "bg-[#FAF8F5]/90 backdrop-blur-md sm:bg-transparent py-3 sm:py-5 border-b border-[#E6DED6]/60 sm:border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between w-full">
            {/* Brand Logo */}
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, "#hero")}
              className="group flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-85 min-w-0"
            >
              {/* Minimalist Studio Emblem (Diamond) - Distinct from hamburger menu */}
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-45 border border-[#37312D] bg-[#D8B9A6]/70 shrink-0" />

              <div className="flex flex-col min-w-0">
                <span className="font-serif text-base sm:text-lg tracking-[0.16em] sm:tracking-[0.2em] uppercase text-[#37312D] font-medium leading-none truncate">
                  {siteConfig.brand.name}
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-[0.16em] sm:tracking-[0.18em] text-[#81766E] uppercase font-light mt-0.5">
                  Furniture Studio
                </span>
              </div>
            </a>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {siteConfig.navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-xs uppercase tracking-[0.14em] text-[#81766E] hover:text-[#37312D] transition-colors font-medium relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#37312D] hover:after:w-full after:transition-all after:duration-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right Action */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onOpenEnquiry(siteConfig.product.name)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#37312D] text-[#37312D] hover:bg-[#37312D] hover:text-[#FAF8F5] text-xs font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer"
              >
                <span>Ask Questions</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/95 border border-[#E6DED6] text-[#37312D] hover:bg-[#F2EDE6] shadow-2xs transition-all shrink-0 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden flex flex-col bg-[#FAF8F5]/98 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="pt-24 px-6 pb-8 flex flex-col justify-between h-full">
            <nav className="flex flex-col gap-6">
              <span className="text-[10px] tracking-[0.25em] text-[#81766E] uppercase font-semibold">
                Menu
              </span>
              {siteConfig.navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="font-serif text-2xl text-[#37312D] hover:text-[#B36851] transition-colors py-1 border-b border-[#E6DED6]/50"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-6 border-t border-[#E6DED6]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEnquiry(siteConfig.product.name);
                }}
                className="w-full py-3 rounded-full bg-[#37312D] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium transition-colors hover:bg-[#25201D] text-center"
              >
                Ask About This Sofa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
