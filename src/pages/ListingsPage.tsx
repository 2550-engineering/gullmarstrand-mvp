
import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
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
const sampleListings: Listing[] = [
  {
    id: 1,
    title: "iPhone 13 Pro Max",
    description: "Like new, barely used. Comes with box and charger.",
    price_sek: 9500,
    amount_sek: 9500,
    condition: "like_new",
    city: "Stockholm",
    status: "published",
    images: [
      {
        url_card: "https://placehold.co/400x300?text=iPhone+13+Pro+Max",
        url_thumb: "https://placehold.co/100x75?text=iPhone",
      },
    ],
    category: "Electronics",
    published_at: "2025-09-18T12:00:00Z",
    seller_id: 2,
    seller_name: "Ekaterina",
    sold: false,
    isOwnListing: currentUser.id === 2,
  },
  {
    id: 2,
    title: "Sofa, 3-seater",
    description: "Used but in good condition. Pickup only.",
    price_sek: 1200,
    amount_sek: 1200,
    condition: "good",
    city: "Göteborg",
    status: "published",
    images: [
      {
        url_card: "https://placehold.co/400x300?text=Sofa",
        url_thumb: "https://placehold.co/100x75?text=Sofa",
      },
    ],
    category: "Furniture",
    published_at: "2025-09-17T09:30:00Z",
    seller_id: 4,
    seller_name: "Mirza",
    sold: false,
    isOwnListing: currentUser.id === 4,
  },
  {
    id: 3,
    title: "Mountain Bike",
    description: "Needs repair, chain is broken. Cheap!",
    price_sek: 500,
    amount_sek: 500,
    condition: "needs_repair",
    city: "Malmö",
    status: "published",
    images: [
      {
        url_card: "https://placehold.co/400x300?text=Bike",
        url_thumb: "https://placehold.co/100x75?text=Bike",
      },
    ],
    category: "Sports",
    published_at: "2025-09-16T15:45:00Z",
    seller_id: 3,
    seller_name: "Gabor",
    sold: false,
    isOwnListing: currentUser.id === 3,
  },
];

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

const ListingsPage: React.FC = () => {
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
        <Grid container spacing={3}>
          {sampleListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
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
            </Grid>
          ))}
        </Grid>
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
