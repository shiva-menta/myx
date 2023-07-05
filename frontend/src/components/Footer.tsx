import React from 'react';

function Footer() {
  return (
    <div className="footer-container">
      <div className="footer-text">Powered by</div>
      <a href="https://spotify.com" target="_blank" rel="noopener noreferrer">
        <img className="footer-img" src={require('../images/spotifyLogo.png')} alt="" />
      </a>
    </div>
  );
}

export default Footer;
