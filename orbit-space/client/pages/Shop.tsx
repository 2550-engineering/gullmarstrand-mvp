import { useMemo, useState, useEffect } from "react";
import { getListings, Listing } from "@/lib/listings"; // <-- Use your API client
import { useSearchParams } from "react-router-dom";
import { FilterBar, Filters } from "@/components/marketplace/FilterBar";
import { ListingCard } from "@/components/marketplace/ListingCard";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    q: "",
    category: "All",
    maxPrice: 250,
    minRating: 3.5,
    maxDistance: 25,
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListings()
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && ["Fashion","Home","Tech","Beauty","Outdoors"].includes(cat)) {
      setFilters((f) => ({ ...f, category: cat as Filters["category"] }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (filters.category && filters.category !== "All") {
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("category", String(filters.category));
        return sp;
      }, { replace: true });
    } else {
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev);
        sp.delete("category");
        return sp;
      }, { replace: true });
    }
  }, [filters.category, setSearchParams]);

  const results = useMemo(() => {
    // You can still filter client-side if you want
    return listings.filter((l) => {
      if (filters.category !== "All" && l.category_id !== undefined && String(l.category_id) !== filters.category) return false;
      if (l.price_sek > filters.maxPrice) return false;
      // Add more filters as needed
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const text = `${l.title} ${l.city}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [filters, listings]);

  if (loading) return <div>Loading...</div>;

  return (
    <section className="container py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Shop</h1>
          <p className="mt-1 text-muted-foreground">Browse community listings and discover local gems.</p>
        </div>
        <div className="text-sm text-muted-foreground">{results.length} results</div>
      </div>

      <div className="rounded-lg border bg-card/80 backdrop-blur p-4 md:p-5">
        <FilterBar value={filters} onChange={setFilters} />
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {results.map((item: Listing) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
