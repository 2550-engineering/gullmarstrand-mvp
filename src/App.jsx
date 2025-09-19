<<<<<<< HEAD

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
=======
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
>>>>>>> origin/main
import ListingsPage from "./pages/ListingsPage";
import CreateListingPage from "../frontend/src/pages/CreateListingPage"; // <-- Add this import
import './App.css';

function App() {
  return (
    <Router>
<<<<<<< HEAD
      <div className="App">
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
          <Link to="/listings" style={{ marginRight: '1rem' }}>Listings</Link>
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
        </Routes>
      </div>
=======
      <Routes>
        <Route path="/" element={
          <div className="App">
            <header className="App-header">
              <img src="Octocat.png" className="App-logo" alt="logo" />
              <p>
                GitHub Codespaces <span className="heart">♥️</span> React
              </p>
              <p className="small">
                Edit <code>src/App.jsx</code> and save to reload.
              </p>
              <p>
                <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn React
                </a>
              </p>
            </header>
          </div>
        } />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/new" element={<CreateListingPage />} /> {/* <-- Add this line */}
      </Routes>
>>>>>>> origin/main
    </Router>
  );
}

export default App;
