"use client";

import React, { useState } from "react";
import { siteConfig } from "@/config/site";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CatalogSection from "@/components/CatalogSection";
import AtelierServices from "@/components/AtelierServices";
import LifestyleCraftsmanship from "@/components/LifestyleCraftsmanship";
import Footer from "@/components/Footer";
import EnquiryModal from "@/components/EnquiryModal";

export default function HomePage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryProductName, setEnquiryProductName] = useState(
    siteConfig.product.name
  );

  const handleOpenEnquiry = (productName?: string) => {
    if (productName) {
      setEnquiryProductName(productName);
    }
    setIsEnquiryOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#37312D] selection:bg-[#E8C6B7] selection:text-[#37312D]">
      {/* Navigation */}
      <Navbar onOpenEnquiry={handleOpenEnquiry} />

      <main>
        {/* Hero Section with Interactive 3D Sofa & Useful Sizing Info */}
        <Hero onOpenEnquiry={handleOpenEnquiry} />

        {/* Furniture Catalog Section */}
        <CatalogSection onOpenEnquiry={handleOpenEnquiry} />

        {/* Premium Home Services & Quality Guarantees */}
        <AtelierServices onOpenEnquiry={handleOpenEnquiry} />

        {/* Everyday Home Story */}
        <LifestyleCraftsmanship onOpenEnquiry={handleOpenEnquiry} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Simple, Non-Technical Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        productName={enquiryProductName}
      />
    </div>
  );
}
