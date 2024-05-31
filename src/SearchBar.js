import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ userLibrary, onSelectSong }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.length > 0) {
      const results = userLibrary.filter(song =>
        song.attributes.name.toLowerCase().includes(query.toLowerCase())
      );
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
    <div>
      <input
        type="text"
        placeholder="Search for a song or artist"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <ul>
        {searchResults.slice(0, 5).map(song => (
          <li key={song.id} onClick={() => handleSelectSong(song)}>
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
