import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  MobileStepper,
  IconButton,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { createListing, Listing } from "../api/listings";
import Compressor from "compressorjs";

// Utility function to create a URL-friendly slug
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Home Goods" },
  // ...add more categories as needed
];

const steps = [
  "Photos",
  "Details",
  "Category",
  "Price",
  "Location & Delivery",
  "Stock",
  "Publish",
];

type Draft = Partial<Omit<Listing, "id" | "published_at" | "images" | "category">> & {
  images: File[];
  negotiable?: boolean;
  stock?: number;
  delivery_option?: "shipping" | "pickup";
  shipping_regions?: string;
  user_id?: number;
  slug?: string;
  canonical_url?: string;
};

const initialDraft: Draft = {
  images: [],
  title: "",
  description: "",
  price_sek: 0,
  condition: "",
  category_id: undefined,
  city: "",
  latitude: undefined,
  longitude: undefined,
  status: "draft",
  negotiable: false,
  stock: 1,
  delivery_option: "pickup",
  shipping_regions: "",
};

function saveDraftToLocalStorage(draft: Draft) {
  localStorage.setItem("listingDraft", JSON.stringify(draft));
}

function loadDraftFromLocalStorage(): Draft {
  const data = localStorage.getItem("listingDraft");
  return data ? { ...initialDraft, ...JSON.parse(data) } : initialDraft;
}

const CreateListingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(loadDraftFromLocalStorage());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDraft((d) => ({ ...d, user_id: user.id }));
    }
  }, [user]);

  // Auto-save draft on change
  React.useEffect(() => {
    saveDraftToLocalStorage(draft);
  }, [draft]);

  // Validation logic
  function validateStep(step: number): boolean {
    let stepErrors: { [key: string]: string } = {};
    if (step === 0 && draft.images.length === 0) {
      stepErrors.images = "Please upload at least one image.";
    }
    if (step === 1) {
      if (!draft.title || draft.title.length < 5)
        stepErrors.title = "Title is too short (min 5 chars).";
      if (!draft.description || draft.description.length < 20)
        stepErrors.description = "Description is too short (min 20 chars).";
    }
    if (step === 2 && !draft.category_id) {
      stepErrors.category_id = "Please select a category.";
    }
    if (step === 3) {
      if (draft.price_sek === undefined || draft.price_sek < 0)
        stepErrors.price_sek = "Price cannot be negative.";
    }
    if (step === 4 && !draft.city) {
      stepErrors.city = "Please enter a city.";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  // Image upload & compression
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1200,
        success: (compressed: File) => {
          setDraft((d) => ({
            ...d,
            images: [...d.images, compressed],
          }));
        },
      });
    });
  }

  function handleImageRemove(idx: number) {
    setDraft((d) => ({
      ...d,
      images: d.images.filter((_, i) => i !== idx),
    }));
  }

  // Step navigation
  function handleNext() {
    if (validateStep(activeStep)) setActiveStep((s) => s + 1);
  }
  function handleBack() {
    setActiveStep((s) => s - 1);
  }

  // Publish
  async function handlePublish() {
    if (!validateStep(steps.length - 1)) return;
    if (!draft.user_id) {
      setErrors({ publish: "You must be logged in to publish a listing." });
      return;
    }
    setLoading(true);
    try {
      const generatedSlug = createSlug(draft.title || "");
      const generatedCanonicalUrl = `/listings/${generatedSlug}`;

      const payload = {
        user_id: draft.user_id,
        title: draft.title,
        description: draft.description,
        price_sek: draft.price_sek,
        condition: draft.condition,
        category_id: draft.category_id,
        city: draft.city,
        latitude: draft.latitude,
        longitude: draft.longitude,
        status: "published",
        slug: generatedSlug,
        canonical_url: generatedCanonicalUrl,
      };
      await createListing(payload as any);
      setPublished(true);
      localStorage.removeItem("listingDraft");
    } catch (e) {
      setErrors({ publish: "Failed to publish listing." });
    } finally {
      setLoading(false);
    }
  }

  // Step content
  function renderStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6">Upload Photos</Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageUpload}
              aria-label="Upload images"
            />
            <Button
              variant="contained"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mt: 2 }}
            >
              Add Photos
            </Button>
            <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
              {draft.images.map((img, idx) => (
                <Box key={idx} sx={{ position: "relative" }}>
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8 }}
                  />
                  <IconButton
                    aria-label="Remove image"
                    onClick={() => handleImageRemove(idx)}
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "#fff",
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
            {errors.images && (
              <Typography color="error" variant="body2">
                {errors.images}
              </Typography>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6">Title & Description</Typography>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={draft.title}
              inputProps={{ maxLength: 120 }}
              helperText={`${draft.title?.length || 0}/120`}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              error={!!errors.title}
              required
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              value={draft.description}
              inputProps={{ maxLength: 4000 }}
              helperText={`${draft.description?.length || 0}/4000`}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              error={!!errors.description}
              required
            />
            {errors.title && (
              <Typography color="error" variant="body2">
                {errors.title}
              </Typography>
            )}
            {errors.description && (
              <Typography color="error" variant="body2">
                {errors.description}
              </Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6">Category</Typography>
            <TextField
              select
              label="Category"
              fullWidth
              margin="normal"
              value={draft.category_id || ""}
              onChange={(e) => setDraft((d) => ({ ...d, category_id: Number(e.target.value) }))}
              error={!!errors.category_id}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
            {errors.category_id && (
              <Typography color="error" variant="body2">
                {errors.category_id}
              </Typography>
            )}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6">Price</Typography>
            <TextField
              label="Price (SEK)"
              type="number"
              fullWidth
              margin="normal"
              value={draft.price_sek}
              onChange={(e) => setDraft((d) => ({ ...d, price_sek: Number(e.target.value) }))}
              error={!!errors.price_sek}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!draft.negotiable}
                  onChange={(e) => setDraft((d) => ({ ...d, negotiable: e.target.checked }))}
                />
              }
              label="Negotiable"
            />
            {draft.negotiable && (
              <Typography variant="body2" color="text.secondary">
                Buyers will see "Make an Offer" on your listing.
              </Typography>
            )}
            {errors.price_sek && (
              <Typography color="error" variant="body2">
                {errors.price_sek}
              </Typography>
            )}
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6">Location & Delivery</Typography>
            <TextField
              label="City"
              fullWidth
              margin="normal"
              value={draft.city}
              onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
              error={!!errors.city}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.delivery_option === "shipping"}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      delivery_option: e.target.checked ? "shipping" : "pickup",
                    }))
                  }
                />
              }
              label="Shipping Available"
            />
            {draft.delivery_option === "shipping" && (
              <TextField
                label="Shipping Regions"
                fullWidth
                margin="normal"
                value={draft.shipping_regions}
                onChange={(e) => setDraft((d) => ({ ...d, shipping_regions: e.target.value }))}
                helperText="E.g. Sweden, EU, Worldwide"
              />
            )}
            {draft.delivery_option === "pickup" && (
              <Typography variant="body2" color="text.secondary">
                Buyers will see your city for pickup.
              </Typography>
            )}
          </Box>
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6">Stock</Typography>
            <TextField
              label="Quantity Available"
              type="number"
              fullWidth
              margin="normal"
              value={draft.stock}
              onChange={(e) => setDraft((d) => ({ ...d, stock: Number(e.target.value) }))}
              inputProps={{ min: 1 }}
              helperText="For businesses or bulk sellers"
            />
          </Box>
        );
      case 6:
        return (
          <Box>
            <Typography variant="h6">Review & Publish</Typography>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1">Title: {draft.title}</Typography>
              <Typography variant="subtitle1">Description: {draft.description}</Typography>
              <Typography variant="subtitle1">
                Category: {categories.find((c) => c.id === draft.category_id)?.name}
              </Typography>
              <Typography variant="subtitle1">Price: {draft.price_sek} SEK {draft.negotiable && "(Negotiable)"}</Typography>
              <Typography variant="subtitle1">City: {draft.city}</Typography>
              <Typography variant="subtitle1">Delivery: {draft.delivery_option}</Typography>
              <Typography variant="subtitle1">Stock: {draft.stock}</Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                {draft.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8 }}
                  />
                ))}
              </Box>
            </Box>
            {errors.publish && (
              <Typography color="error" variant="body2">
                {errors.publish}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handlePublish}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Publish Listing"}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  }

  if (published) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="success.main" gutterBottom>
          🎉 Listing Published!
        </Typography>
        <Button variant="contained" href="/listings">
          Go to Listings
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Create Listing
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3, display: { xs: "none", sm: "flex" } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <MobileStepper
        variant="progress"
        steps={steps.length}
        position="static"
        activeStep={activeStep}
        sx={{ display: { xs: "flex", sm: "none" }, mb: 2 }}
        nextButton={
          activeStep < steps.length - 1 ? (
            <Button size="small" onClick={handleNext} aria-label="Next step">
              Next
            </Button>
          ) : null
        }
        backButton={
          activeStep > 0 ? (
            <Button size="small" onClick={handleBack} aria-label="Previous step">
              Back
            </Button>
          ) : null
        }
      />
      <Box component="form" autoComplete="off" aria-live="polite">
        {renderStepContent(activeStep)}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        {activeStep > 0 && (
          <Button onClick={handleBack} variant="outlined" aria-label="Back">
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext} variant="contained" aria-label="Next">
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CreateListingPage;