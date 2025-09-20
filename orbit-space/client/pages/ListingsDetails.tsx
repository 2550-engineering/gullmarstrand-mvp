import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getListing, Listing } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getListing(Number(id))
        .then((data) => setListing(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="container py-10">Loading...</div>;
  if (!listing) return <div className="container py-10">Listing not found.</div>;

  return (
    <section className="container py-10">
      <Button asChild variant="link" className="mb-4">
        <Link to="/shop">&larr; Back to shop</Link>
      </Button>
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={
              listing.images && listing.images[0]?.url_full
                ? listing.images[0].url_full
                : "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={listing.title}
            className="rounded-lg object-cover w-full md:w-80 h-60"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-2">{listing.title}</h1>
            <div className="text-muted-foreground mb-2">{listing.city}</div>
            <div className="mb-4">{listing.description}</div>
            <div className="text-lg font-bold mb-2">{listing.price_sek} SEK</div>
            <div className="mb-2">
              <span className="inline-block bg-accent px-2 py-1 rounded text-xs font-medium">
                {listing.condition}
              </span>
            </div>
            {/* Add more listing details as needed */}
          </div>
        </div>
      </Card>
    </section>
  );
}