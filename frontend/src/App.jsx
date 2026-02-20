import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CallTrackerPage from './pages/CallTrackerPage';
import MetadataPage from './pages/MetadataPage';
import NetworkPage from './pages/NetworkPage';
import TechDetectPage from './pages/TechDetectPage';
import WhatsAppPage from './pages/WhatsAppPage';
import OsintPage from './pages/OsintPage';
import IntelligencePage from './pages/IntelligencePage';
import './App.css';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="app-container bg-dark min-vh-100 text-light">
        <Navbar />
        <div className="content-wrapper py-4">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/call-tracker" element={<CallTrackerPage />} />
            <Route path="/metadata" element={<MetadataPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/tech-detect" element={<TechDetectPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/osint" element={<OsintPage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
