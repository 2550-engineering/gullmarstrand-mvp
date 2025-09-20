const API_URL = "http://localhost:8000/listings/";

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

export async function createListing(data: FormData): Promise<Listing> {
  const response = await fetch(API_URL, {
    method: "POST",
    body: data,
  });

  if (!response.ok) {
    throw new Error("Failed to create listing");
  }

  return response.json();
}
