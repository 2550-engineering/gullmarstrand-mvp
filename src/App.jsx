
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage";
import './App.css';


function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;
