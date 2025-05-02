import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SearchPage from './pages/SearchPage';
import RecommendPage from './pages/RecommendPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        {/* Simple navigation */}
        <nav className="nav">
          <Link to="/" className="nav-link">Search Libraries</Link>
          <Link to="/get-recommendations" className="nav-link recommend-link">Get Recommendations</Link> 
        </nav>

        {/* App routes with AnimatePresence for page transitions */}
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<SearchPage />} />
              <Route path="/get-recommendations" element={<RecommendPage />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;