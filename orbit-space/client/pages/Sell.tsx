import { createListing } from "../api/listings"; // Import the new createListing function
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function Sell() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState<string>("");
  const [negotiable, setNegotiable] = useState(false);
  const [delivery, setDelivery] = useState<"shipping" | "pickup">("pickup");
  const [manualLocation, setManualLocation] = useState("");
  const [coords, setCoords] = useState<{lat:number; lng:number} | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth(); // Use the useAuth hook

  const canPublish = useMemo(() => {
    return images.length > 0 && title.trim().length > 2 && category && (manualLocation || coords) && (!price || !isNaN(Number(price)));
  }, [images, title, category, manualLocation, coords, price]);

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
    // Try auto-detect silently on mount
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
    if (!user || authLoading) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a listing.", variant: "destructive" });
      return;
    }
    if (!canPublish) {
      toast({ title: "Validation Error", description: "Please fill in all required fields and upload at least one image.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category_id", category); // Assuming category is ID or can be mapped
      formData.append("price_sek", price);
      formData.append("negotiable", String(negotiable));
      formData.append("city", manualLocation);
      formData.append("delivery_option", delivery);
      if (coords) {
        formData.append("latitude", String(coords.lat));
        formData.append("longitude", String(coords.lng));
      }

      images.forEach((image, index) => {
        if (image.file) {
          formData.append(`images`, image.file, image.file.name);
        }
      });

      formData.append("user_id", String(user.id)); // Use actual user ID

      await createListing(formData);
      toast({ title: "Listing published", description: negotiable ? "Offer enabled: buyers can Make an Offer." : "Your listing is live." });
      // Clear form or redirect
      setImages([]);
      setTitle("");
      setDescription("");
      setPrice("");
      setNegotiable(false);
      setDelivery("pickup");
      setManualLocation("");
      setCoords(null);
      navigate('/shop'); // Redirect to shop page after successful listing

    } catch (error) {
      console.error("Failed to publish listing:", error);
      toast({ title: "Publication Failed", description: "There was an error publishing your listing.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-10">
      <h1 className="text-2xl md:text-3xl font-semibold">Make a listing</h1>
      <p className="mt-1 text-muted-foreground">Add photos and details in a few simple steps.</p>

      <form onSubmit={onPublish} className="mt-6 space-y-8">
        {/* Step 1: Photos */}
        <div>
          <h2 className="text-lg font-semibold">1. Upload Photos</h2>
          <p className="text-sm text-muted-foreground">Add multiple images. Rotate or crop if needed.</p>
          <div className="mt-3">
            <PhotoUploader value={images} onChange={setImages} />
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
            <Button type="submit" disabled={!canPublish || loading || authLoading}>
              {loading || authLoading ? "Publishing..." : "Publish Listing"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}