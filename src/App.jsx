
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage";
import './App.css';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
