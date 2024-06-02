import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';

const ShieldBadge = styled.div`
  display: inline-block;
  padding: 0.5em 1em;
  margin: 0.5em;
  border-radius: 0.5em;
  background-color: ${({ $rank }) =>
    $rank === 1 ? '#ffd700' : $rank === 2 ? '#c0c0c0' : $rank === 3 ? '#cd7f32' : $rank <= 5 ? '#d52aa7' : $rank <= 10 ? '#9c41be' : '#ADD8E6'};
  color: ${({ $rank }) => ($rank <= 10 ? 'black' : 'black')};
  text-align: center;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
`;

const MixBadge = styled.div`
  display: inline-block;
  padding: 0.5em 1em;
  margin: 0.5em;
  border-radius: 0.5em;
  background-color: ${({ type }) => (type === 'Heavy Rotation Mix' ? '#FFA500' : type === 'Favorite Song' ? '#d22d45' : type === 'Recently Played' ? '#ffd700': '#ADD8E6')};
  color: black;
  text-align: center;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
`;

const SongStats = ({ song, playlists, recentlyPlayedTracks, musicUserToken }) => {
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
    trackNumber,
  } = song.attributes || {}; // Provide default empty object if attributes are undefined

  const songName = name;
  const songArtist = artistName;
  const songDuration = durationInMillis;
  const songTrackNumber = trackNumber;

  const length = durationInMillis ? new Date(durationInMillis).toISOString().substr(11, 8) : 'N/A'; // Handle undefined duration

  const [replayYears, setReplayYears] = useState([]);
  const [mixes, setMixes] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfSongInPlaylists = async (songName, songDuration, songTrackNumber, songArtist) => {
      setLoading(true);
      try {
        const years = [];
        const mixList = [];
        for (const playlist of playlists) {
          console.log(`Checking playlist: ${playlist.attributes.name}`); // Log the playlist names
          const response = await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlist.id}/tracks`, {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_APPLE_DEVELOPER_TOKEN}`,
              'Music-User-Token': musicUserToken,
            },
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();

          const songIndex = data.data.findIndex(track =>
            (track.attributes.name === songName && track.attributes.artistName === songArtist) ||
            (track.attributes.durationInMillis === songDuration && track.attributes.trackNumber === songTrackNumber)
          );

          if (songIndex !== -1) {
            const yearMatch = playlist.attributes.name.match(/Replay (\d{4})/);
            if (yearMatch) {
              const year = yearMatch[1];
              years.push({ year, position: songIndex + 1 });
            }

            if (playlist.attributes.name.includes('Heavy Rotation Mix')) {
              mixList.push({ name: playlist.attributes.name });
            }
            if (playlist.attributes.name.includes('Favorite Songs')) {
              mixList.push({ name: 'Favorite Song' });
            }
          }
        }
        setReplayYears(years);
        setMixes(mixList);
      } catch (error) {
        console.error('Error checking if song is in playlists:', error);
      }
      setLoading(false);
    };

    const checkIfSongRecentlyPlayed = (songName, songArtist) => {
      const recentlyPlayed = recentlyPlayedTracks.some(track =>
        track.attributes.name === songName && track.attributes.artistName === songArtist
      );
      setRecentlyPlayed(recentlyPlayed);
    };

    if (song && song.attributes && playlists.length > 0) {
      checkIfSongInPlaylists(songName, songDuration, songTrackNumber, songArtist);
      checkIfSongRecentlyPlayed(songName, songArtist);
    }
  }, [song, playlists, recentlyPlayedTracks, musicUserToken]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2>Selected Song</h2>
          {artwork && artwork.url ? (
            <img src={artwork.url.replace('{w}', '300').replace('{h}', '300')} alt={`${name} album cover`} />
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
          <h3>Replay Years</h3>
          <ul>
            {replayYears.map(({ year, position }) => (
              <ShieldBadge key={year} $rank={position}>
                {`Replay ${year}`}<br />
                {/*position <= 5 ? */`Song #${position}` /* : position <= 10 ? 'Top 10 Song' : <em>Playlist Song</em>*/}
              </ShieldBadge>
            ))}
          </ul>
          <h3>Mixes</h3>
          <ul>
            {mixes.map(({ name }, index) => (
              <MixBadge key={index} type={name}>
                {name}
              </MixBadge>
            ))}
            {recentlyPlayed && (
              <MixBadge key="recentlyPlayed" type = "Recently Played">
                Recently Played
              </MixBadge>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

SongStats.propTypes = {
  song: PropTypes.object.isRequired,
  playlists: PropTypes.array.isRequired,
  recentlyPlayedTracks: PropTypes.array.isRequired,
  musicUserToken: PropTypes.string.isRequired,
};

export default SongStats;
