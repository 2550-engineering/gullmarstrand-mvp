import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, createListing } from "@/lib/listings";
import { useToast } from "@/hooks/use-toast";

export default function Sell() {
  // Remove images state
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState<string>("");
  const [negotiable, setNegotiable] = useState(false);
  const [delivery, setDelivery] = useState<"shipping" | "pickup">("pickup");
  const [manualLocation, setManualLocation] = useState("");
  const [coords, setCoords] = useState<{lat:number; lng:number} | null>(null);
  const { toast } = useToast();

  const canPublish = useMemo(() => {
    return (
      imageUrl.trim().length > 5 &&
      title.trim().length > 2 &&
      category &&
      (manualLocation || coords) &&
      (!price || !isNaN(Number(price)))
    );
  }, [imageUrl, title, category, manualLocation, coords, price]);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { maximumAge: 60000 },
      );
    }
  }, []);

  const onPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;

    try {
      // Compose the listing object
      const listing = {
        user_id: 1, // For MVP, hardcode or get from context if available
        title,
        description,
        price_sek: Number(price),
        condition: "good", // You can add a select for this if you want
        category_id: 1, // You may want to map category string to an ID
        city: manualLocation,
        latitude: coords?.lat,
        longitude: coords?.lng,
        status: "published",
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        canonical_url: "",
        images: [
          {
            url_full: imageUrl,
            url_card: imageUrl,
            url_thumb: imageUrl,
            blurhash: "",
          },
        ],
      };

      await createListing(listing);
      toast({ title: "Listing published", description: "Your listing is live." });
      // Optionally reset form
      setTitle("");
      setDescription("");
      setImageUrl("");
      setPrice("");
      setManualLocation("");
      setCoords(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to publish listing." });
    }
  };

  return (
    <section className="container py-10">
      <h1 className="text-2xl md:text-3xl font-semibold">Make a listing</h1>
      <p className="mt-1 text-muted-foreground">Add photos and details in a few simple steps.</p>

      <form onSubmit={onPublish} className="mt-6 space-y-8">
        {/* Step 1: Image URL */}
        <div>
          <h2 className="text-lg font-semibold">1. Image URL</h2>
          <p className="text-sm text-muted-foreground">Paste a direct image URL (e.g. from Unsplash or your own hosting).</p>
          <div className="mt-3">
            <Input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
              aria-label="Image URL"
            />
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-lg font-semibold">2. Title & Description</h2>
          <div className="mt-3 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. Minimal Oak Side Table" required aria-label="Listing title" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Description</span>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item's condition, size, material, etc." aria-label="Listing description" />
            </label>
          </div>
        </div>

        {/* Category */}
        <div>
          <h2 className="text-lg font-semibold">3. Category</h2>
          <div className="mt-3 grid gap-2 max-w-sm">
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger aria-label="Category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-lg font-semibold">4. Pricing</h2>
          <div className="mt-3 grid gap-4 max-w-md">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Price</span>
              <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 129" aria-label="Price" />
            </label>
            <label className="inline-flex items-center gap-2">
              <Switch checked={negotiable} onCheckedChange={setNegotiable} aria-label="Negotiable price" />
              <span className="text-sm">Negotiable price (shows "Make an Offer")</span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-lg font-semibold">5. Location</h2>
          <div className="mt-3 grid gap-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={detectLocation}>Use current location</Button>
              {coords && (
                <span className="text-sm text-muted-foreground">Detected: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
              )}
            </div>
            <label className="grid gap-1">
              <span className="text-sm font-medium">City/Area</span>
              <Input value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="e.g. SoMa, San Francisco" aria-label="Manual location" />
            </label>
          </div>
        </div>

        {/* Delivery */}
        <div>
          <h2 className="text-lg font-semibold">6. Delivery Option</h2>
          <div className="mt-3 grid gap-3">
            <RadioGroup value={delivery} onValueChange={(v) => setDelivery(v as typeof delivery)} className="grid grid-cols-2 max-w-sm">
              <label className="flex items-center gap-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <span>Pickup</span>
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="shipping" id="shipping" />
                <span>Shipping</span>
              </label>
            </RadioGroup>
          </div>
        </div>

        {/* Publish */}
        <div>
          <h2 className="text-lg font-semibold">7. Publish Listing</h2>
          <p className="text-sm text-muted-foreground">Review your details and publish when ready.</p>
          <div className="mt-4">
            <Button type="submit" disabled={!canPublish}>Publish Listing</Button>
          </div>
        </div>
      </form>
    </section>
  );
}
