import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Alert, Card, CardContent, CardMedia, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import axios from "axios";
import { getListings, deleteListing, Listing } from "../../frontend/src/api/listings";

const UserProfilePage: React.FC = () => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [deleteId, setDeleteId] = useState<number|null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Fetch user's listings (replace user_id logic as needed)
  useEffect(() => {
    getListings().then(data => {
      // TODO: Replace 1 with actual logged-in user id
      setListings(data.filter(l => l.user_id === 1));
    });
  }, []);
  const handleDelete = async (id: number) => {
    setDeleteLoading(true);
    try {
      await deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
      setDeleteId(null);
    } catch (err: any) {
      alert("Failed to delete listing");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      // Replace with your actual API endpoint and payload
      await axios.put("/auth/profile", { name, city, password });
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={800} mx="auto" mt={8} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" mb={2} align="center">
        User Profile
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
      <Box mt={6}>
        <Typography variant="h6" mb={2}>My Listings</Typography>
        <Grid container spacing={2}>
          {listings.map(listing => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={listing.images && listing.images.length > 0 && listing.images[0].url_card ? listing.images[0].url_card : "https://via.placeholder.com/300x140?text=No+Image"}
                  alt={listing.title}
                />
                <CardContent>
                  <Typography variant="h6">{listing.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {listing.description.slice(0, 80)}...
                  </Typography>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => setDeleteId(listing.id)}
                    disabled={deleteLoading}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={() => deleteId && handleDelete(deleteId)} color="error" disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfilePage;
