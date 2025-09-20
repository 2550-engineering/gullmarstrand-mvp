import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getListings, Listing } from "@/lib/listings";
import { ListingCard } from "@/components/marketplace/ListingCard";

export default function Index() {
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListings()
      .then((data) => {
        setFeatured(data.slice(0, 8)); // Show first 8 as featured
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/50 to-transparent" aria-hidden />
        <div className="container py-16 md:py-24 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
              Discover, Buy & Sell — Effortlessly
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-prose">
              From everyday essentials to hidden gems, find nearby items in a simple, seamless way.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/shop">Shop now</Link></Button>
              <Button asChild variant="secondary" size="lg"><Link to="/sell">Sell now</Link></Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <img className="rounded-xl object-cover aspect-[3/4]" src="https://images.unsplash.com/photo-1616486780398-245cb302ba3f?q=80&w=1200&auto=format&fit=crop" alt="Neutral ceramics and decor" />
            <img className="rounded-xl object-cover aspect-square md:row-span-2" src="https://images.unsplash.com/photo-1617184072768-6d8aa6cb25d7?q=80&w=1200&auto=format&fit=crop" alt="Minimal home interior" />
            <img className="rounded-xl object-cover aspect-square" src="https://images.unsplash.com/photo-1612423284934-2850b5a9f59e?q=80&w=1200&auto=format&fit=crop" alt="Soft orange apparel" />
            <img className="rounded-xl object-cover aspect-[4/5]" src="https://images.unsplash.com/photo-1608063702693-c0a242460bb1?q=80&w=1200&auto=format&fit=crop" alt="Beige lifestyle products" />
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section id="featured" className="container py-12 md:py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Featured listings</h2>
            <p className="mt-1 text-muted-foreground">Handpicked items from our community.</p>
          </div>
          <Button asChild variant="link"><Link to="/shop">View all</Link></Button>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? (
            <div>Loading...</div>
          ) : (
            featured.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))
          )}
        </div>
      </section>
    </>
  );
}
