import React from 'react'
import { Routes, Route, useLocation } from "react-router-dom";
import AcapellaMatchPage from './pages/AcapellaMatchPage';
import SavedMashupsPage from './pages/SavedMashupsPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RequireAuth from './RequireAuth';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/home" element={
            <RequireAuth>
              <HomePage/>
            </RequireAuth>
          } 
        />
        <Route path="/match" element={
            <RequireAuth>
              <AcapellaMatchPage/>
            </RequireAuth>
          } 
        />
        <Route path="/saved" element={
            <RequireAuth>
              <SavedMashupsPage/>
            </RequireAuth>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
