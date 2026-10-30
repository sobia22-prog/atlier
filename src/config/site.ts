export interface CollectionProduct {
  id: string;
  name: string;
  category: "Sofas" | "Chairs" | "Sectionals" | "Ottomans";
  subtitle: string;
  price: string;
  dimensions: string;
  availability: string;
  image: string;
  description: string;
}

export const siteConfig = {
  brand: {
    name: "ATELIER SOREL",
    shortName: "SOREL",
    tagline: "Designed to Be Lived In.",
    subheading: "Comfortable contemporary furniture for real homes.",
    statement: "Made for relaxing, hosting, and everyday life.",
    locations: ["Paris", "Milan", "London"],
  },
  product: {
    id: "solene-sofa",
    name: "The Solene Corner Sofa",
    eyebrow: "LIVING ROOM COLLECTION",
    heroHeadline: "Comfortable Sofas, Made for Real Life.",
    heroDescription:
      "Designed for relaxing, watching movies, and spending time with family. Deep soft seating, clean lines, and fabrics built for everyday comfort.",
    price: "PKR 285,000",
    dimensions: "230 × 190 × 76 cm",
    objPath: "/modals/obj/sofa.obj",
    mtlPath: "/modals/obj/sofa.mtl",
  },
  collection: [
    {
      id: "solene-sofa",
      name: "The Solene Corner Sofa",
      category: "Sofas",
      subtitle: "3-Seater L-Shape with Chaise",
      price: "PKR 285,000",
      dimensions: "230 × 190 × 76 cm",
      availability: "Made to Order",
      image: "/images/sofa-product.jpg",
      description: "Our signature corner sofa with deep seating and 5 decorative pillows included.",
    },
    {
      id: "solene-chair",
      name: "The Solene Armchair",
      category: "Chairs",
      subtitle: "Cozy Single-Seater Reading Chair",
      price: "PKR 145,000",
      dimensions: "94 × 88 × 74 cm",
      availability: "Made to Order",
      image: "/images/chair-product.jpg",
      description: "An inviting reading armchair with soft curves and lumbar comfort.",
    },
    {
      id: "solene-chaise",
      name: "The Solene Daybed Chaise",
      category: "Sectionals",
      subtitle: "Relaxed Lounger for Living Rooms",
      price: "PKR 390,000",
      dimensions: "295 × 195 × 76 cm",
      availability: "Made to Order",
      image: "/images/chaise-product.jpg",
      description: "Spacious extended lounger designed for reading and afternoon naps.",
    },
    {
      id: "solene-ottoman",
      name: "The Solene Soft Ottoman",
      category: "Ottomans",
      subtitle: "Padded Footrest & Extra Seat",
      price: "PKR 85,000",
      dimensions: "98 × 64 × 42 cm",
      availability: "In Stock & Made to Order",
      image: "/images/ottoman-product.jpg",
      description: "Versatile soft bench doubling as a footstool or extra living room seat.",
    },
  ] as CollectionProduct[],
  craftsmanship: {
    heading: "Made for Everyday Life at Home.",
    description:
      "A good sofa is where life happens — slow Sunday mornings with coffee, reading, and relaxing with family in the evening. We design furniture that feels welcoming from the first moment you sit down and stays comfortable for years.",
    imagePath: "/images/lifestyle-interior.jpg",
    imageAlt: "Bright and comfortable living room with natural daylight and corner sofa",
  },
  navigation: [
    { label: "3D View", href: "#hero" },
    { label: "Catalog", href: "#catalog" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
  ],
};
