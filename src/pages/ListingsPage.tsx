
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from "@mui/material";
import ListingDetail from "../ListingDetail";
import DeliverySelection from "../DeliverySelection";
import TextField from "@mui/material/TextField";
import ContactAddressForm from "../ContactAddressForm";
import PaymentWidget from "../PaymentWidget";
import Confirmation from "../Confirmation";

type Listing = {
  id: number;
  title: string;
  description: string;
  price_sek: number;
  condition: "new" | "like_new" | "good" | "used" | "needs_repair";
  city: string;
  status: "draft" | "published" | "paused" | "sold" | "removed";
  images: { url_card: string; url_thumb: string }[];
  category: string;
  published_at: string;
  seller_id?: number;
  seller_name?: string;
  sold?: boolean;
  amount_sek?: number;
  isOwnListing?: boolean;
};

const currentUser = { id: 3, name: "Gabor" };

// Dynamic listings state (replaces hardcoded sampleListings)
// Each listing will be enriched with amount_sek + isOwnListing after fetch
// until backend is ready, we keep an empty array and show loading / empty states
const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Placeholder: replace with real API endpoint when backend is ready
        // const res = await fetch('/api/listings');
        // if (!res.ok) throw new Error('Failed to load listings');
        // const data = await res.json();
        // Map backend shape to Listing (assumed fields - adjust as needed)
        const data: any[] = []; // empty until backend delivered
        if (!cancelled) {
          const mapped: Listing[] = data.map(l => ({
            id: l.id,
            title: l.title,
            description: l.description,
            price_sek: l.price_sek,
            amount_sek: l.price_sek,
            condition: l.condition || 'used',
            city: l.city || '',
            status: l.status || 'published',
            images: (l.images || []).map((img: any) => ({ url_card: img.url_card || img.url_full || '', url_thumb: img.url_thumb || '' })),
            category: l.category?.name || 'General',
            published_at: l.published_at || new Date().toISOString(),
            seller_id: l.user_id,
            seller_name: l.user?.name,
            sold: l.status === 'sold',
            isOwnListing: l.user_id === currentUser.id,
          }));
          setListings(mapped);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

const conditionColor = (condition: Listing["condition"]) => {
  switch (condition) {
    case "new":
      return "success";
    case "like_new":
      return "info";
    case "good":
      return "primary";
    case "used":
      return "warning";
    case "needs_repair":
      return "error";
    default:
      return "default";
  }
};

  // --- existing component state & logic ---
  const [step, setStep] = useState<number>(1);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'flat'>('pickup');
  const [shippingProvider, setShippingProvider] = useState<'postnord' | 'instabox'>('postnord');
  const [contact, setContact] = useState<any>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [orderArgs, setOrderArgs] = useState<any>(null);
  const [pickupRequested, setPickupRequested] = useState(false);
  const [pickupMessage, setPickupMessage] = useState("");

  function handleSelectListing(listing: Listing) {
    setSelectedListing(listing);
    setStep(2);
  }

  function handleDeliverySelect(type: 'pickup' | 'flat') {
    setDeliveryType(type);
    if (type === 'pickup') {
      setStep(3);
    }
  }

  function handleShippingProviderSelect(provider: 'postnord' | 'instabox') {
    setShippingProvider(provider);
  }

  function handleContinueFromShipping() {
    setStep(3);
  }

  function handlePickupRequest() {
    setPickupRequested(true);
    setTimeout(() => setPickupRequested(false), 2000);
    alert(`Pickup request sent to seller!${pickupMessage ? '\nMessage: ' + pickupMessage : ''}`);
    setPickupMessage("");
  }

  function handleContactSubmit(data: any) {
    setContact(data);
    setEmail(data.email);
    setStep(4);
  }

  function handlePay() {
    if (!selectedListing) return;
    const order = {
      buyer_id: currentUser.id,
      listing_id: selectedListing.id,
      seller_id: selectedListing.seller_id,
      amount_sek: selectedListing.amount_sek,
      delivery_type: deliveryType,
      shipping_provider: deliveryType === 'flat' ? shippingProvider : undefined,
      delivery_address: deliveryType === 'flat' ? contact.address : undefined,
      status: 'created',
      created_at: new Date().toISOString(),
    };
    setOrderArgs(order);
    setOrderId('ORDER12345');
    setStep(5);
  }

  function handleReset() {
    setStep(1);
    setSelectedListing(null);
    setDeliveryType('pickup');
    setShippingProvider('postnord');
    setContact({});
    setOrderId(null);
    setEmail('');
    setOrderArgs(null);
    setPickupRequested(false);
    setPickupMessage("");
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Listings
      </Typography>
      {step === 1 && (
        <>
          {loading && (
            <Typography variant="body1" sx={{ mb: 2 }}>Loading listings...</Typography>
          )}
          {error && !loading && (
            <Typography color="error" sx={{ mb: 2 }}>Failed to load listings: {error}</Typography>
          )}
          {!loading && !error && listings.length === 0 && (
            <Typography variant="body2" sx={{ mb: 2 }}>No listings available.</Typography>
          )}
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={3}>
          {listings.map((listing) => (
            <Box key={listing.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={listing.images[0]?.url_card}
                  alt={listing.title}
                />
                <CardContent>
                  <Typography variant="h6">{listing.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {listing.description.slice(0, 80)}...
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Chip
                      label={listing.condition.replace("_", " ")}
                      color={conditionColor(listing.condition)}
                      size="small"
                    />
                    <Chip label={listing.category} size="small" />
                    <Chip label={listing.city} size="small" />
                  </Box>
                  <Typography variant="subtitle1" color="primary">
                    {listing.price_sek} SEK
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Published: {new Date(listing.published_at).toLocaleDateString()}
                  </Typography>
                  {listing.sold ? (
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      size="large"
                      sx={{ mt: 2, py: 1.5, fontWeight: 600, fontSize: '1.1rem', letterSpacing: 1 }}
                      disabled
                    >
                      SOLD
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        sx={{ mt: 2, py: 1.5, fontWeight: 600, fontSize: '1.1rem', letterSpacing: 1 }}
                        onClick={() => handleSelectListing(listing)}
                        disabled={listing.isOwnListing}
                      >
                        BUY NOW
                      </Button>
                      {listing.isOwnListing && <div>You cannot buy your own listing.</div>}
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
          </Box>
        </>
      )}
      {step === 2 && selectedListing && (
        <Box>
          <ListingDetail listing={selectedListing} onBuyNow={() => {}} />
          <DeliverySelection
            deliveryType={deliveryType}
            onSelect={handleDeliverySelect}
            onPickupRequest={handlePickupRequest}
            shippingProvider={shippingProvider}
            onShippingProviderSelect={handleShippingProviderSelect}
          />
          {deliveryType === 'pickup' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Message to seller (optional)"
                placeholder="E.g. I plan to come by on Saturday afternoon."
                value={pickupMessage}
                onChange={e => setPickupMessage(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
              />
            </Box>
          )}
          {deliveryType === 'flat' && (
            <Button
              sx={{ mt: 2 }}
              type="button"
              disabled={!shippingProvider}
              onClick={handleContinueFromShipping}
            >
              Continue
            </Button>
          )}
          <Button sx={{ mt: 2, ml: 2 }} onClick={handleReset}>
            Back to Listings
          </Button>
        </Box>
      )}
      {step === 3 && (
        <Box>
          <ContactAddressForm onSubmit={handleContactSubmit} />
          <Button sx={{ mt: 2 }} onClick={handleReset}>
            Back to Listings
          </Button>
        </Box>
      )}
      {step === 4 && selectedListing && (
        <Box>
          <PaymentWidget amount={selectedListing.amount_sek} onPay={handlePay} />
          <Button sx={{ mt: 2 }} onClick={handleReset}>
            Back to Listings
          </Button>
        </Box>
      )}
      {step === 5 && (
        <Box>
          <Confirmation orderId={orderId} email={email} />
          <Button sx={{ mt: 2 }} onClick={handleReset}>
            Start New Order
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ListingsPage;
