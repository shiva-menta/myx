import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js'
import { RxMixerHorizontal } from 'react-icons/rx'
import { Link } from 'react-router-dom'
import { RiPlayListLine } from 'react-icons/ri'

function HomePage() {
    return (
        <div className='home-page'>
            <Header/>
            <div className="page-title">[myx home]</div>
            <div className="section-text">Welcome to <b>Myx V1: Acapella Match</b>! Navigate through the pages below. The Myx logo is your home button!</div>
            <div className="page-navigation">
                <Link to="/match">
                    <div className="nav-item">
                        <RxMixerHorizontal className="nav-icon"/>
                        <div className="nav-text">acapella match</div>
                    </div>
                </Link>
                <Link to="/saved">
                    <div className="nav-item">
                        <RiPlayListLine className="nav-icon"/>
                        <div className="nav-text">saved mashups</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;