"use client";

import React, { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { X, Check, ArrowRight, ShieldCheck } from "lucide-react";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export default function EnquiryModal({
  isOpen,
  onClose,
  productName = siteConfig.product.name,
}: EnquiryModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!contact.trim()) {
      newErrors.contact = "Please provide your phone number or email.";
    } else if (
      contact.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())
    ) {
      newErrors.contact = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedRef = `AS-${Math.floor(100000 + Math.random() * 900000)}`;
      setReferenceCode(generatedRef);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#25201D]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#E6DED6] shadow-2xl p-6 sm:p-8 z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#81766E] hover:text-[#37312D] hover:bg-[#F2EDE6] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#81766E] block mb-1">
                Order & Product Enquiry
              </span>
              <h3
                id="modal-title"
                className="font-serif text-2xl sm:text-3xl text-[#37312D] font-normal tracking-tight"
              >
                Ask About This Sofa
              </h3>
              <p className="text-xs text-[#81766E] mt-1">
                Selected: <strong className="text-[#37312D] font-medium">{productName}</strong>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#81766E] mb-1">
                  Your Full Name <span className="text-[#B36851]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="Eleanor Vance"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white border text-xs text-[#37312D] placeholder-[#81766E]/50 focus:outline-none focus:ring-1 focus:ring-[#37312D] transition-colors ${
                    errors.name ? "border-[#B36851]" : "border-[#E6DED6]"
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-[#B36851] mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#81766E] mb-1">
                  Phone Number or Email <span className="text-[#B36851]">*</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (errors.contact) setErrors({ ...errors, contact: "" });
                  }}
                  placeholder="+92 300 1234567 or yourname@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white border text-xs text-[#37312D] placeholder-[#81766E]/50 focus:outline-none focus:ring-1 focus:ring-[#37312D] transition-colors ${
                    errors.contact ? "border-[#B36851]" : "border-[#E6DED6]"
                  }`}
                />
                {errors.contact && (
                  <p className="text-[11px] text-[#B36851] mt-1">{errors.contact}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#81766E] mb-1">
                  Your City / Area <span className="text-[#81766E] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lahore, Karachi, Islamabad, Dubai..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E6DED6] text-xs text-[#37312D] placeholder-[#81766E]/50 focus:outline-none focus:ring-1 focus:ring-[#37312D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#81766E] mb-1">
                  Any questions or room dimensions <span className="text-[#81766E] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ask about delivery dates, room fit, custom sizes, or fabric samples..."
                  className="w-full p-3 rounded-xl bg-white border border-[#E6DED6] text-xs text-[#37312D] placeholder-[#81766E]/50 focus:outline-none focus:ring-1 focus:ring-[#37312D] transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#81766E] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D8B9A6] shrink-0" />
                <span>Your contact details are strictly private and never shared.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#37312D] text-[#FAF8F5] text-xs font-medium uppercase tracking-[0.16em] hover:bg-[#25201D] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-[#F4EEE7] border border-[#D8B9A6] mx-auto flex items-center justify-center text-[#37312D]">
              <Check className="w-5 h-5 text-[#37312D]" />
            </div>

            <div>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#81766E]">
                Message Received
              </span>
              <h3 className="font-serif text-2xl text-[#37312D] mt-1">
                Thank You, {name.split(" ")[0]}
              </h3>
              <p className="text-xs text-[#81766E] max-w-xs mx-auto mt-1 leading-relaxed">
                We received your question about <strong>{productName}</strong>. A team member will reach out to you shortly.
              </p>
            </div>

            <div className="bg-[#F2EDE6]/70 p-3.5 rounded-xl border border-[#E6DED6] max-w-xs mx-auto text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#81766E] block font-medium">
                Enquiry Reference
              </span>
              <span className="font-mono text-sm text-[#37312D] font-bold">
                {referenceCode}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#37312D] text-[#FAF8F5] text-xs font-medium uppercase tracking-wider hover:bg-[#25201D] transition-colors cursor-pointer"
            >
              Back to Website
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
