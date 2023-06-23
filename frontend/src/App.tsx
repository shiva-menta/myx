import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AcapellaMatchPage from './pages/AcapellaMatchPage';
import SavedMashupsPage from './pages/SavedMashupsPage';
import MixPathPage from './pages/MixPathPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DeniedAccessPage from './pages/DeniedAccessPage';
import RequireAuth from './RequireAuth';

import 'bootstrap/dist/css/bootstrap.css';
import './components/component.css';

function App() {
  const appHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
  };
  window.addEventListener('resize', appHeight);
  appHeight();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/access" element={<DeniedAccessPage />} />
        <Route
          path="/home"
          element={
            (
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            )
          }
        />
        <Route
          path="/match"
          element={
            (
              <RequireAuth>
                <AcapellaMatchPage />
              </RequireAuth>
            )
          }
        />
        <Route
          path="/mixpath"
          element={
            (
              <RequireAuth>
                <MixPathPage />
              </RequireAuth>
            )
          }
        />
        <Route
          path="/saved"
          element={
            (
              <RequireAuth>
                <SavedMashupsPage />
              </RequireAuth>
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
