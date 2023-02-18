import React from 'react'
import { Routes, Route, useLocation } from "react-router-dom";
import AcapellaMatchPage from './pages/AcapellaMatchPage';
import SavedMashupsPage from './pages/SavedMashupsPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/match" element={<AcapellaMatchPage/>} />
        <Route path="/saved" element={<SavedMashupsPage/>} />
      </Routes>
    </div>
  );
}

export default App;
