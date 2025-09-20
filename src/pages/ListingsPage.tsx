import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper,
} from "@mui/material";
import { getListings, Listing } from "../../frontend/src/api/listings";
import ListingDetail from "../ListingDetail";
import DeliverySelection from "../DeliverySelection";
import ContactAddressForm from "../ContactAddressForm";
import PaymentWidget from "../PaymentWidget";
import Confirmation from "../Confirmation";

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

const steps = ["Listing", "Delivery", "Contact", "Payment", "Confirmation"];

interface LocalOrderDraft {
  name?: string;
  email?: string;
  address?: string;
  deliveryType?: string;
  shippingProvider?: string;
  listingId?: number;
  amount_sek?: number;
  orderId?: string;
}

const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [orderDraft, setOrderDraft] = useState<LocalOrderDraft>({});
  const [pickupRequested, setPickupRequested] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getListings()
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load listings");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setOrderDraft({ listingId: listing.id, amount_sek: listing.price_sek });
    setActiveStep(0);
  };

  const handleBuyNow = () => {
    if (!selectedListing) return;
    setActiveStep(1); // move to delivery
  };

  const handleDeliverySelect = (type: string) => {
    setOrderDraft((d) => ({ ...d, deliveryType: type }));
  };

  const handlePickupRequest = () => {
    setPickupRequested(true);
  };

  const handleShippingProviderSelect = (provider: string) => {
    setOrderDraft((d) => ({ ...d, shippingProvider: provider }));
  };

  const handleContactSubmit = ({ name, email, address }: { name: string; email: string; address: string }) => {
    setOrderDraft((d) => ({ ...d, name, email, address }));
    setActiveStep(3); // payment
  };

  const handlePayment = () => {
    // Simulate payment success
    const fakeOrderId = `ORD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    setOrderDraft((d) => ({ ...d, orderId: fakeOrderId }));
    setActiveStep(4); // confirmation
  };

  const resetFlow = () => {
    setActiveStep(0);
    setSelectedListing(null);
    setOrderDraft({});
    setPickupRequested(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          {selectedListing ? selectedListing.title : "Listings"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {!selectedListing && (
            <Button variant="contained" color="primary" onClick={() => navigate("/listings/new")}>+ Create Listing</Button>
          )}
          {selectedListing && (
            <Button variant="outlined" onClick={resetFlow}>Back to Listings</Button>
          )}
        </Box>
      </Box>

      {!selectedListing && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={3}>
          {listings.map((listing) => (
            <Box key={listing.id} onClick={() => handleSelectListing(listing)} sx={{ cursor: "pointer" }}>
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={
                    listing.images && listing.images.length > 0 && listing.images[0].url_card
                      ? listing.images[0].url_card
                      : "https://via.placeholder.com/300x180?text=No+Image"
                  }
                  alt={listing.title}
                />
                <CardContent>
                  <Typography variant="h6">{listing.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {listing.description.slice(0, 80)}...
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Chip label={listing.condition?.replace("_", " ")} color={conditionColor(listing.condition)} size="small" />
                    <Chip label={listing.city} size="small" />
                  </Box>
                  <Typography variant="subtitle1" color="primary">{listing.price_sek} SEK</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {selectedListing && (
        <Paper sx={{ p: 3 }} elevation={3}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <>
              <ListingDetail listing={selectedListing as any} onBuyNow={handleBuyNow} />
            </>
          )}
          {activeStep === 1 && (
            <>
              <DeliverySelection
                deliveryType={orderDraft.deliveryType || "pickup"}
                onSelect={handleDeliverySelect}
                onPickupRequest={handlePickupRequest}
                shippingProvider={orderDraft.shippingProvider || "postnord"}
                onShippingProviderSelect={handleShippingProviderSelect}
              />
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={() => setActiveStep(2)} disabled={orderDraft.deliveryType === undefined}>
                  Continue
                </Button>
                <Button onClick={() => setActiveStep(0)}>Back</Button>
              </Box>
              {pickupRequested && <Typography sx={{ mt: 2 }} color="secondary">Pickup request submitted to seller.</Typography>}
            </>
          )}
          {activeStep === 2 && (
            <>
              <ContactAddressForm onSubmit={handleContactSubmit} />
              <Button sx={{ mt: 2 }} onClick={() => setActiveStep(1)}>Back</Button>
            </>
          )}
          {activeStep === 3 && (
            <>
              <PaymentWidget amount={orderDraft.amount_sek} onPay={handlePayment} />
              <Button sx={{ mt: 2 }} onClick={() => setActiveStep(2)}>Back</Button>
            </>
          )}
          {activeStep === 4 && (
            <>
              <Confirmation orderId={orderDraft.orderId} email={orderDraft.email} />
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={resetFlow}>Close</Button>
              </Box>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ListingsPage;
