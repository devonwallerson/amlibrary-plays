import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const SongStats = ({ song, musicUserToken }) => {
  const {
    name,
    artistName,
    albumName,
    releaseDate,
    playCount,
    durationInMillis,
    artwork,
    contentRating,
    genreNames,
  } = song.attributes || {}; // Provide default empty object if attributes are undefined

  const length = durationInMillis ? new Date(durationInMillis).toISOString().substr(11, 8) : 'N/A'; // Handle undefined duration

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('https://api.music.apple.com/v1/me/recommendations', {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_APPLE_DEVELOPER_TOKEN}`, // Ensure you use the correct token here
            'Music-User-Token': musicUserToken,
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data.data) {
          // Extract up to 3 recommendations and get playlist names
          const playlistRecommendations = data.data.slice(0, 3).flatMap(rec => 
            rec.relationships.contents.data.map(content => ({
              name: content.attributes.name,
              artistName: content.attributes.curatorName
            }))
          );
          setRecommendations(playlistRecommendations);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [musicUserToken]);

  return (
    <div>
      <h2>Selected Song</h2>
      {artwork && artwork.url ? (
        <img src={artwork.url.replace('{w}x{h}', '500x500')} alt={`${name} album cover`} />
      ) : (
        <div>No artwork available</div>
      )}
      <ul>
        <li><strong>Song Name:</strong> {name || 'N/A'}</li>
        <li><strong>Artist Name:</strong> {artistName || 'N/A'}</li>
        <li><strong>Album Name:</strong> {albumName || 'N/A'}</li>
        <li><strong>Release Date:</strong> {releaseDate || 'N/A'}</li>
        <li><strong>Number of Plays:</strong> {playCount !== undefined ? playCount : 'N/A'}</li>
        <li><strong>Song Length:</strong> {length}</li>
        <li><strong>Content Rating:</strong> {contentRating || 'N/A'}</li>
        <li><strong>Song Genre:</strong> {genreNames ? genreNames.join(', ') : 'N/A'}</li>
      </ul>
      <h3>Recommendations</h3>
      <ul>
        {recommendations.slice(0, 3).map((recommendation, index) => (
          <li key={index}>
            {recommendation.name} by {recommendation.artistName}
          </li>
        ))}
      </ul>
    </div>
  );
};

SongStats.propTypes = {
  song: PropTypes.object.isRequired,
  musicUserToken: PropTypes.string.isRequired, // Ensure the music user token is passed as a prop
};

export default SongStats;
