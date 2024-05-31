import React from 'react';
import PropTypes from 'prop-types';

const SongStats = ({ song }) => {
    const {
        name,
        artistName,
        albumName,
        releaseDate,
        playCount,
        durationInMillis,
        artwork,
    } = song.attributes

    const length = new Date(durationInMillis).toISOString().substr(11,8)

   
  return (
    <div>
      <h2>Selected Song</h2>
      <img src={artwork.url} alt={`${name} album cover`} />
      <ul>
        <li><strong>Song Name:</strong> {name}</li>
        <li><strong>Artist Name:</strong> {artistName}</li>
        <li><strong>Album Name:</strong> {albumName}</li>
        <li><strong>Release Date:</strong> {releaseDate}</li>
        <li><strong>Number of Plays:</strong> {playCount}</li>
        <li><strong>Song Length:</strong> {length}</li>
      </ul>
    </div>
  );
};

SongStats.propTypes = {
  song: PropTypes.object.isRequired,
};

export default SongStats;