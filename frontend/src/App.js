import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import FeedbackForm from './pages/FeedbackForm';
import Dashboard from './pages/Dashboard';
import FeedbackList from './pages/FeedbackList';
import './App.css';

function Navbar() {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">◈</div>
        <span>FeedLoop</span>
      </div>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Submit</Link>
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
        <Link to="/responses" className={location.pathname === '/responses' ? 'active' : ''}>Responses</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<FeedbackForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/responses" element={<FeedbackList />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e0e0ff',
              border: '1px solid #7c3aed',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif"
            },
            success: { iconTheme: { primary: '#7c3aed', secondary: '#e0e0ff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#e0e0ff' } }
          }}
        />
      </div>
    </Router>
  );
}

export default App;