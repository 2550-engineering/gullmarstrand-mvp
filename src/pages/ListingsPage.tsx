import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";

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
};

const sampleListings: Listing[] = [
  {
    id: 1,
    title: "iPhone 13 Pro Max",
    description: "Like new, barely used. Comes with box and charger.",
    price_sek: 9500,
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
  },
  {
    id: 2,
    title: "Sofa, 3-seater",
    description: "Used but in good condition. Pickup only.",
    price_sek: 1200,
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
  },
  {
    id: 3,
    title: "Mountain Bike",
    description: "Needs repair, chain is broken. Cheap!",
    price_sek: 500,
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

const ListingsPage: React.FC = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" gutterBottom>
      Listings
    </Typography>
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
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default ListingsPage;
