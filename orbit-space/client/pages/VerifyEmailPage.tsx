import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/auth";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState(false);

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setMessage("Invalid verification link.");
      setError(true);
      return;
    }

    const handleVerification = async () => {
      try {
        await verifyEmail({ email, token });
        setMessage("Email verified successfully! You can now log in.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setMessage("Email verification failed. The link might be expired or invalid.");
        setError(true);
      }
    };

    handleVerification();
  }, [searchParams, navigate]);

  return (
    <div className="container py-16 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold">Email Verification</h1>
      <p className={`mt-4 ${error ? "text-red-500" : "text-green-500"}`}>
        {message}
      </p>
      {!error && !message.includes("successfully") && (
        <p className="mt-2 text-muted-foreground">Please wait while we confirm your email.</p>
      )}
      {error && (
        <p className="mt-2 text-muted-foreground">If you believe this is an error, please try registering again or contact support.</p>
      )}
    </div>
  );
};

export default VerifyEmailPage;
