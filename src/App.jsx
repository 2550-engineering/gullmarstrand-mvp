import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage";
import CreateListingPage from "../frontend/src/pages/CreateListingPage";
import LoginPage from "../frontend/src/pages/LoginPage";
import { AuthProvider } from "../frontend/src/contexts/AuthContext";
import RegisterPage from "../frontend/src/pages/RegisterPage";
import Navigation from "../frontend/src/components/Navigation";
import VerifyEmailPage from "../frontend/src/pages/VerifyEmailPage";
import ProtectedRoute from "../frontend/src/components/ProtectedRoute";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
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
            <Route path="/listings/new" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
