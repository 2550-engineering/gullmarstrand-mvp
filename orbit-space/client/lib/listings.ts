import axios from "axios";

export interface ListingImage {
  url_full?: string;
  url_card?: string;
  url_thumb?: string;
  blurhash?: string;
}

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price_sek: number;
  condition?: string;
  category_id?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  slug?: string;
  canonical_url?: string;
  images: ListingImage[];
}

// You can use an env variable or fallback to localhost
const API_URL = import.meta.env?.VITE_API_URL || process.env.VITE_API_URL || "http://localhost:8000/listings/";

export async function getListings(): Promise<Listing[]> {
  const res = await axios.get<Listing[]>(API_URL);
  return res.data;
}

export async function getListing(id: number): Promise<Listing> {
  const res = await axios.get<Listing>(`${API_URL}${id}`);
  return res.data;
}

export async function createListing(data: Omit<Listing, "id">): Promise<Listing> {
  const res = await axios.post<Listing>(API_URL, data);
  return res.data;
}

export async function updateListing(id: number, data: Partial<Listing>): Promise<Listing> {
  const res = await axios.put<Listing>(`${API_URL}${id}`, data);
  return res.data;
}

export async function deleteListing(id: number): Promise<void> {
  await axios.delete(`${API_URL}${id}`);
}

export const CATEGORIES = [
  "Fashion",
  "Home",
  "Tech",
  "Beauty",
  "Outdoors",
  // ...add more as needed
];