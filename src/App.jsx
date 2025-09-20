import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage";
import CreateListingPage from "../frontend/src/pages/CreateListingPage"; // <-- Add this import
import LoginPage from "./pages/LoginPage";
import UserProfilePage from "./pages/UserProfilePage";
import CreateListingPage from "../frontend/src/pages/CreateListingPage";
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display:'flex', gap:'1rem' }}>
          <Link to="/">Home</Link>
          <Link to="/listings">Listings</Link>
          <Link to="/listings/new">Create Listing</Link>
        </nav>
        <Routes>
          <Route path="/" element={
            <div>
              <header className="App-header">
                <img src="Octocat.png" className="App-logo" alt="logo" />
                <p>
                  Gullmarstrand MVP <span className="heart">♥️</span> React
                </p>
                <p className="small">
                  Edit <code>src/App.jsx</code> and save to reload.
                </p>
              </header>
            </div>
          } />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/new" element={<CreateListingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
