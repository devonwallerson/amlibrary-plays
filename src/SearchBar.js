import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css'; // Import the CSS file

const SearchBar = ({ userLibrary, onSelectSong }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.length > 0) {
      const results = userLibrary.filter(song => {
        const name = song.attributes.name || '';
        const artistName = song.attributes.artistName || '';

        return name.toLowerCase().includes(query.toLowerCase()) ||
             artistName.toLowerCase().includes(query.toLowerCase());
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSong = (song) => {
    onSelectSong(song);
    setSearchQuery('');
    setSearchResults([]);
    console.log("Selected song", song);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search for a song or artist"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-bar-input"
      />
      <ul className="search-results-list">
        {searchResults.slice(0, 10).map((song, index) => (
          <li key={song.id} onClick={() => handleSelectSong(song)} className="search-result-item">
            {song.attributes.name} by {song.attributes.artistName}
          </li>
        ))}
      </ul>
    </div>
  );
};

SearchBar.propTypes = {
  userLibrary: PropTypes.array.isRequired,
  onSelectSong: PropTypes.func.isRequired,
};

export default SearchBar;
