import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { Button, Container, Typography, Box, CircularProgress } from "@mui/material";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!email || !token) {
      setError("Missing email or token.");
    }
  }, [email, token]);

  const handleVerification = async () => {
    if (!email || !token) return;
    setLoading(true);
    try {
      const response = await verifyEmail({ email, token });
      setSuccess(response.msg);
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError("Email verification failed. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Verify Your Email
        </Typography>
        {email && token ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1">
              Click the button below to verify your email address.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleVerification}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Verify Email"}
            </Button>
          </Box>
        ) : null}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" variant="body2">
            {success}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
