// Imports
import React from 'react';
import { Link } from 'react-router-dom';
import MyxDisc from '../images/Disc.png';

// Main Component
function Header() {
  // Render Function
  return (
    <div className="header">
      <Link to="/home">
        <img src={MyxDisc} alt="Myx logo." />
      </Link>
    </div>
  );
}

export default Header;
