// Navbar.js
import React from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';

const Navbar = ({ onNavItemClick }) => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item" onClick={() => onNavItemClick('song')}>Song Stats</li>
        <li className="navbar-item" onClick={() => onNavItemClick('artist')}>Artist Stats</li>
        <li className="navbar-item" onClick={() => onNavItemClick('replay')}>Replay Stats</li>
      </ul>
    </nav>
  );
};

Navbar.propTypes = {
  onNavItemClick: PropTypes.func.isRequired,
};

export default Navbar;
