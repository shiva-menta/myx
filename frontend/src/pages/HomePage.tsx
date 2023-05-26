// Imports
import React from 'react';
import { AiOutlineNodeIndex } from 'react-icons/ai';
import { RxMixerHorizontal } from 'react-icons/rx';
import { RiPlayListLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

// Main Component
function HomePage() {
  // Constants
  const pages = [
    { title: 'mix path', link: '/mixpath', component: AiOutlineNodeIndex },
    { title: 'acapella match', link: '/match', component: RxMixerHorizontal },
    { title: 'saved mashups', link: '/saved', component: RiPlayListLine },
  ];

  // Render Function
  return (
    <div className="home-page">
      <Header clickable={false} />
      <div className="page-title">[myx home]</div>
      <div className="section-text">
        Welcome to
        <b> Myx V2: Mix Path</b>
        ! Navigate through the pages below. The Myx logo is your home button.
      </div>
      <div className="page-navigation">
        {pages.map((page) => (
          <Link to={page.link} key={page.link}>
            <div className="nav-item">
              <page.component className="nav-icon" />
              <div className="nav-text">{page.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
