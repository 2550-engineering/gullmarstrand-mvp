import React from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button, Typography } from "@mui/material";

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display:'flex', alignItems: 'center', gap:'1rem' }}>
      <Link to="/">Home</Link>
      <Link to="/listings">Listings</Link>
      <Link to="/listings/new">Create Listing</Link>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <Typography variant="body1">Welcome, {user.name}</Typography>
            <Button onClick={logout} color="inherit">Logout</Button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
