import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Plus, Heart } from "lucide-react";
import { Listing } from "@/lib/listings";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

export function ListingCard({ item }: { item: Listing }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleAdd = () => {
    addItem({ id: item.id, title: item.title, price: item.price, image: item.image }, 1);
  };

  const fav = isFavorite(item.id);

  return (
    <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/60">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 will-change-transform hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          onClick={() => toggleFavorite(item.id)}
          aria-label={fav ? `Unsave ${item.title}` : `Save ${item.title}`}
          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm ring-1 ring-border backdrop-blur transition hover:bg-background"
        >
          <Heart className={fav ? "h-4 w-4 text-primary fill-current" : "h-4 w-4"} />
        </button>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-primary" aria-hidden />{item.rating.toFixed(1)}</span>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden />{item.distance} km</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{item.location} • {item.category}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">${item.price.toFixed(0)}</div>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleAdd} className="w-full" aria-label={`Add ${item.title} to cart`}>
            <Plus className="h-4 w-4" /> Add to cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
