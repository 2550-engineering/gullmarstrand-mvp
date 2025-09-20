export type Listing = {
  id: string;
  title: string;
  price: number;
  rating: number; // 1-5
  distance: number; // km
  category: "Fashion" | "Home" | "Tech" | "Beauty" | "Outdoors";
  image: string;
  location: string;
};

export const CATEGORIES: Listing["category"][] = [
  "Fashion",
  "Home",
  "Tech",
  "Beauty",
  "Outdoors",
];

export const LISTINGS: Listing[] = [
  {
    id: "l1",
    title: "Handwoven Rattan Tote",
    price: 68,
    rating: 4.7,
    distance: 3.2,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop",
    location: "SoMa, SF",
  },
  {
    id: "l2",
    title: "Minimal Oak Side Table",
    price: 149,
    rating: 4.9,
    distance: 5.6,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1616597094852-61fe8b5527f2?q=80&w=1200&auto=format&fit=crop",
    location: "Mission, SF",
  },
  {
    id: "l3",
    title: "Wireless Ceramic Speaker",
    price: 199,
    rating: 4.5,
    distance: 2.1,
    category: "Tech",
    image:
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1200&auto=format&fit=crop",
    location: "Downtown, SF",
  },
  {
    id: "l4",
    title: "Organic Skincare Set",
    price: 54,
    rating: 4.6,
    distance: 7.9,
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1601933470928-c1c81f9b53ed?q=80&w=1200&auto=format&fit=crop",
    location: "Berkeley, CA",
  },
  {
    id: "l5",
    title: "Hiking Stoneware Bottle",
    price: 39,
    rating: 4.3,
    distance: 12.4,
    category: "Outdoors",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    location: "Oakland, CA",
  },
  {
    id: "l6",
    title: "Linen Overshirt Sand",
    price: 89,
    rating: 4.4,
    distance: 1.4,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop",
    location: "Nob Hill, SF",
  },
  {
    id: "l7",
    title: "Terracotta Planter Set",
    price: 45,
    rating: 4.8,
    distance: 6.3,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
    location: "Sunset, SF",
  },
  {
    id: "l8",
    title: "Compact Espresso Maker",
    price: 129,
    rating: 4.2,
    distance: 3.5,
    category: "Tech",
    image:
      "https://images.unsplash.com/photo-1527168027773-0cc890c4f42e?q=80&w=1200&auto=format&fit=crop",
    location: "Hayes Valley, SF",
  },
  {
    id: "l9",
    title: "Saffron Glow Serum",
    price: 72,
    rating: 4.9,
    distance: 9.8,
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop",
    location: "Palo Alto, CA",
  },
  {
    id: "l10",
    title: "Trail Daypack Clay",
    price: 98,
    rating: 4.5,
    distance: 4.2,
    category: "Outdoors",
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop",
    location: "Berkeley, CA",
  },
  {
    id: "l11",
    title: "Chambray Utility Apron",
    price: 36,
    rating: 4.1,
    distance: 2.9,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
    location: "SoMa, SF",
  },
  {
    id: "l12",
    title: "Minimal Smart Lamp",
    price: 119,
    rating: 4.7,
    distance: 1.1,
    category: "Tech",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
    location: "Marina, SF",
  },
];
