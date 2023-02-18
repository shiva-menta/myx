import React from 'react';
import MyxDisc from '../images/Disc.png'
import { Link } from 'react-router-dom'

function Header() {

    return (
        <div className="header">
            <Link to="/home">
                <img src={MyxDisc}/>
            </Link>
        </div>
    );
}

export default Header;