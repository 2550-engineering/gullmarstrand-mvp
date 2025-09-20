import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import { getListings, Listing } from "../api/listings";

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
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Listings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/listings/new")}
        >
          + Create Listing
        </Button>
      </Box>
      <Grid container={true} spacing={3}>
        {listings.map((listing) => (
          <Grid item={true} xs={12} sm={6} md={4} key={listing.id}>
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
                  <Chip
                    label={listing.condition?.replace("_", " ")}
                    color={conditionColor(listing.condition)}
                    size="small"
                  />
                  <Chip label={listing.city} size="small" />
                </Box>
                <Typography variant="subtitle1" color="primary">
                  {listing.price_sek} SEK
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ListingsPage;
