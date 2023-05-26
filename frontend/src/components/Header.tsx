// Imports
import React from 'react';
import { Link } from 'react-router-dom';
import { BiHomeAlt } from 'react-icons/bi';
import MyxDisc from '../images/Disc.png';

type HomeProps = {
  clickable: boolean;
}

// Main Component
function Header({ clickable }: HomeProps) {
  // Render Function
  if (clickable) {
    return (
      <div className="header">
        <Link to="/home">
          <div className="header-hover-container">
            <img src={MyxDisc} alt="Myx logo." />
            <BiHomeAlt color="#ffffff" />
          </div>
        </Link>
      </div>
    );
  } else {
    return (
      <div className="header">
        <img src={MyxDisc} alt="Myx logo." />
      </div>
    );
  }
}

export default Header;
