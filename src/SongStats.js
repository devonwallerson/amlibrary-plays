import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import ColorThief from 'color-thief-browser';
import './App.css';


const SongStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SongInfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20px;
`;

const Artwork = styled.img`
  max-width: 300px;
  max-height: 300px;
  margin: 0 4em;
`;

const SongDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 20px 0;
`;

const SongName = styled.h1`
  font-size: 2.5em;
  color: white;
  font-family: 'Archivo Black';
`;

const ArtistName = styled.h2`
  font-size: 2em;
  color: white;
  font-family: 'Archivo Black';
`;

const AdditionalInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
`;

const InfoItem = styled.div`
  font-size: 1.2em;
  color: white;
`;

const BadgesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

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

const SongStats = ({ song, playlists, recentlyPlayedTracks, musicUserToken, onExtractColors }) => {
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
  const [colorsExtracted, setColorsExtracted] = useState(false); // New state variable
  const [prevSong, setPrevSong] = useState(null); // Track the previous song



  useEffect(() => {
    const checkIfSongInPlaylists = async () => {
      setLoading(true);
      setPrevSong(song); // Update the previous song state
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
      setColorsExtracted(false);
      setLoading(false);
    };

    const checkIfSongRecentlyPlayed = () => {
      const recentlyPlayed = recentlyPlayedTracks.some(track =>
        track.attributes.name === songName && track.attributes.artistName === songArtist
      );
      setRecentlyPlayed(recentlyPlayed);
    };

    if (song && song.attributes && playlists.length > 0) {
      checkIfSongInPlaylists();
      checkIfSongRecentlyPlayed();
    }
  }, [song, playlists, recentlyPlayedTracks, musicUserToken]);

  useEffect(() => {
    const extractColors = () => {
      console.log("New song loading");
      console.log(typeof artwork !== "undefined", "artwork available");
      console.log(!prevSong || prevSong.id === song.id, "is it not the same song");
  
      if (artwork && (!prevSong || prevSong.id !== song.id)) { // Check if the song has changed
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = artwork.url.replace('{w}', '300').replace('{h}', '300');
  
        img.onload = () => {
          const colorThief = new ColorThief();
          const colors = colorThief.getPalette(img, 2); // Extract 4 dominant colors
  
          // Log the raw extracted colors
          console.log('Raw extracted colors:', colors);
  
          // Filter and sort by luminance
          const filteredColors = colors
            .map(color => {
              const luminance = (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
              return { color, luminance };
            })
            .filter(({ luminance }) => luminance < 0.6) // Relaxed the luminance threshold to include slightly brighter colors
            .sort((a, b) => a.luminance - b.luminance) // Sort by luminance
            .map(({ color }) => color);
  
          // Ensure a minimum number of colors are returned
          const finalColors = filteredColors.length >= 4 ? filteredColors : colors.slice(0, 4);
  
          // Log the filtered colors
          console.log('Filtered and sorted colors:', filteredColors);
          console.log('Final colors:', finalColors);
  
          // Sort colors by luminance again to ensure the darkest color is first
          const sortedColors = finalColors.sort((a, b) => {
            const luminanceA = (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) / 255;
            const luminanceB = (0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]) / 255;
            return luminanceA - luminanceB;
          });
  
          // Create a gradient with the darkest color being the most prominent
          const gradient = `linear-gradient(45deg, rgb(${sortedColors[0].join(',')}), rgb(${sortedColors[0].join(',')}) 50%, ${sortedColors.map(color => `rgb(${color.join(',')})`).join(', ')})`;
  
          const songContainer = document.querySelector('.songContainer');
          if (songContainer) {
            songContainer.style.background = gradient;
            songContainer.style.backgroundSize = '200% 200%';
            songContainer.style.animation = 'moveGradient 10s ease infinite';
          }
  
          console.log('Sorted colors:', sortedColors);
          onExtractColors(finalColors);
          setColorsExtracted(true); // Mark colors as extracted
        };
  
        img.onerror = (err) => {
          console.error('Error loading image for color extraction:', err);
        };
      }
    };
  
    if (artwork && artwork.url) {
      extractColors();
    }
  }, [artwork, onExtractColors]);
  
  

  return (
    <SongStatsContainer>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <SongInfoContainer>
            {artwork && artwork.url ? (
              <Artwork src={artwork.url.replace('{w}', '300').replace('{h}', '300')} alt={`${name} album cover`} />
            ) : (
              <div>No artwork available</div>
            )}
            <SongDetails>
              <SongName>{name || 'N/A'}</SongName>
              <ArtistName>{artistName || 'N/A'}</ArtistName>
            </SongDetails>
          </SongInfoContainer>
          <AdditionalInfoGrid>
            <InfoItem><strong>Album Name:</strong> {albumName || 'N/A'}</InfoItem>
            <InfoItem><strong>Release Date:</strong> {releaseDate || 'N/A'}</InfoItem>
            <InfoItem><strong>Song Length:</strong> {length}</InfoItem>
            <InfoItem><strong>Song Genre:</strong> {genreNames ? genreNames.join(', ') : 'N/A'}</InfoItem>
          </AdditionalInfoGrid>
          <BadgesContainer>
            {replayYears.map(({ year, position }) => (
              <ShieldBadge key={year} $rank={position}>
                {`Replay ${year}`}<br />
                {`Song #${position}`}
              </ShieldBadge>
            ))}
            {mixes.map(({ name }, index) => (
              <MixBadge key={index} type={name}>
                {name}
              </MixBadge>
            ))}
            {recentlyPlayed && (
              <MixBadge key="recentlyPlayed" type="Recently Played">
                Recently Played
              </MixBadge>
            )}
          </BadgesContainer>
        </>
      )}
    </SongStatsContainer>
  );
};

SongStats.propTypes = {
  song: PropTypes.object.isRequired,
  playlists: PropTypes.array.isRequired,
  recentlyPlayedTracks: PropTypes.array.isRequired,
  musicUserToken: PropTypes.string.isRequired,
  onExtractColors: PropTypes.func.isRequired,
};

export default SongStats;
