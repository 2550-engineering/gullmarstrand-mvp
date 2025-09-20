import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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
  pickupMessage?: string;
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

  const startImmediatePurchase = (listing: Listing) => {
    setSelectedListing(listing);
    setOrderDraft({ listingId: listing.id, amount_sek: listing.price_sek });
    setActiveStep(1);
  };

  const handleBuyNow = () => setActiveStep(1);
  const handleDeliverySelect = (type: string) => setOrderDraft(d => ({ ...d, deliveryType: type }));
  const handlePickupRequest = () => setPickupRequested(true);
  const handlePickupMessageChange = (msg: string) => setOrderDraft(d => ({ ...d, pickupMessage: msg }));
  const handleShippingProviderSelect = (provider: string) => setOrderDraft(d => ({ ...d, shippingProvider: provider }));
  const handleContactSubmit = ({ name, email, address }: { name: string; email: string; address: string }) => {
    setOrderDraft(d => ({ ...d, name, email, address }));
    setActiveStep(3);
  };
  const handlePayment = () => {
    const fakeOrderId = `ORD-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
    // Mark selected listing as sold locally
    if (selectedListing) {
      const updatedListing = { ...selectedListing, status: 'sold' } as Listing;
      setSelectedListing(updatedListing);
      setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
    }
    setOrderDraft(d => ({ ...d, orderId: fakeOrderId }));
    setActiveStep(4);
  };
  const resetFlow = () => {
    setActiveStep(0);
    setSelectedListing(null);
    setOrderDraft({});
    setPickupRequested(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography variant="h4" gutterBottom>
          {selectedListing ? selectedListing.title : 'Listings'}
        </Typography>
        <Box sx={{ display:'flex', gap:1 }}>
          {!selectedListing && (
            <Button variant="contained" color="primary" onClick={() => navigate('/listings/new')}>+ Create Listing</Button>
          )}
          {selectedListing && (
            <Button variant="outlined" onClick={resetFlow}>Back to Listings</Button>
          )}
        </Box>
      </Box>

      {!selectedListing && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={3}>
          {listings.map(listing => {
            const isSold = listing.status === 'sold' || listing.status === 'completed';
            return (
              <Card key={listing.id} sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={listing.images && listing.images.length && listing.images[0].url_card ? listing.images[0].url_card : 'https://via.placeholder.com/300x180?text=No+Image'}
                  alt={listing.title}
                  onClick={() => handleSelectListing(listing)}
                  style={{ cursor:'pointer' }}
                />
                <CardContent onClick={() => handleSelectListing(listing)} style={{ cursor:'pointer' }}>
                  <Typography variant="h6" gutterBottom>{listing.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {listing.description.slice(0, 80)}...
                  </Typography>
                  <Box sx={{ display:'flex', gap:1, mb:1, flexWrap:'wrap' }}>
                    <Chip label={listing.condition?.replace('_',' ')} color={conditionColor(listing.condition)} size="small" />
                    {listing.city && <Chip label={listing.city} size="small" />}
                    {isSold && <Chip label="SOLD" color="error" size="small" />}
                  </Box>
                  <Typography variant="subtitle1" color="primary" fontWeight={600}>{listing.price_sek} SEK</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent:'flex-end', pt:0, pb:2, px:2 }}>
                  {isSold ? (
                    <Button variant="contained" size="small" disabled>SOLD</Button>
                  ) : (
                    <Button variant="contained" size="small" onClick={() => startImmediatePurchase(listing)}>BUY NOW</Button>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {selectedListing && (
        <Paper sx={{ p:3, mt:2 }} elevation={3}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb:3 }}>
            {steps.map(label => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
          {activeStep === 0 && (
            <ListingDetail listing={selectedListing as any} onBuyNow={handleBuyNow} />
          )}
          {activeStep === 1 && (
            <>
              <DeliverySelection
                deliveryType={orderDraft.deliveryType || 'pickup'}
                onSelect={handleDeliverySelect}
                onPickupRequest={handlePickupRequest}
                shippingProvider={orderDraft.shippingProvider || 'postnord'}
                onShippingProviderSelect={handleShippingProviderSelect}
                pickupMessage={orderDraft.pickupMessage}
                onPickupMessageChange={handlePickupMessageChange}
              />
              <Box sx={{ mt:2, display:'flex', gap:1 }}>
                <Button variant="contained" onClick={() => setActiveStep(2)} disabled={!orderDraft.deliveryType}>Continue</Button>
                <Button onClick={() => setActiveStep(0)}>Back</Button>
              </Box>
              {pickupRequested && <Typography sx={{ mt:2 }} color="secondary">Pickup request submitted to seller.</Typography>}
            </>
          )}
          {activeStep === 2 && (
            <>
              <ContactAddressForm onSubmit={handleContactSubmit} />
              <Button sx={{ mt:2 }} onClick={() => setActiveStep(1)}>Back</Button>
            </>
          )}
          {activeStep === 3 && (
            <>
              <PaymentWidget amount={orderDraft.amount_sek} onPay={handlePayment} />
              <Button sx={{ mt:2 }} onClick={() => setActiveStep(2)}>Back</Button>
            </>
          )}
          {activeStep === 4 && (
            <>
              <Confirmation orderId={orderDraft.orderId} email={orderDraft.email} />
              <Box sx={{ mt:2, display:'flex', gap:1 }}>
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
