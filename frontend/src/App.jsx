import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ListingsPage from "./pages/ListingsPage";
import CategoriesPage from "./pages/CategoriesPage";
import Header from "./components/Header";
import './App.css';

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<ListingsPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/*" element={<CategoriesPage />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
