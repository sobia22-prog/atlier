import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-ui",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATELIER SOREL | Contemporary Luxury Sofas",
  description:
    "Discover refined contemporary sofas designed to bring warmth, comfort, and understated elegance to your home. Designed to Be Lived In.",
  keywords: [
    "luxury sofa",
    "contemporary furniture",
    "atelier sorel",
    "solene sofa",
    "architectural living room",
    "designer sofa",
    "minimalist luxury",
  ],
  authors: [{ name: "Atelier Sorel Studio" }],
  openGraph: {
    title: "ATELIER SOREL | Contemporary Luxury Sofas",
    description:
      "A softer expression of modern living. Sculptural design, inviting textures, and timeless comfort.",
    type: "website",
    locale: "en_US",
    siteName: "ATELIER SOREL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-[#FAF8F5] text-[#37312D] font-sans antialiased selection:bg-[#E8C6B7] selection:text-[#37312D]">
        {children}
      </body>
    </html>
  );
}
