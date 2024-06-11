import React, { useContext, useEffect, useState } from 'react';
import MusicKitContext from './MusicKitContext';
import SearchBar from './SearchBar';
import SongStats from './SongStats';
import Navbar from './Navbar';
import './App.css';

// Use a cache to prevent user from having to reload their data every time they use the website. Data stays in cache for 30 minutes
const CACHE_KEY = 'userLibraryCache';
const CACHE_TIMESTAMP_KEY = 'userLibraryCacheTimestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const PLAYLISTS_CACHE_TIMESTAMP_KEY = 'userPlaylistsCacheTimestamp';
const PLAYLISTS_CACHE_KEY = 'userPlaylistsCache';
const RECENTLY_PLAYED_CACHE_KEY = 'userRecentlyPlayedCache';
const RECENTLY_PLAYED_CACHE_TIMESTAMP_KEY = 'userRecentlyPlayedCacheTimestamp';

const App = () => {
  // State variables for sign in, user library, loading screen, and selected song
  const { musicKitInstance, musicUserToken } = useContext(MusicKitContext);
  const [userLibrary, setUserLibrary] = useState([]);
  const [signIn, setSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadedSongCount, setLoadedSongCount] = useState(0); // State to track the count of loaded songs
  const [selectedSong, setSelectedSong] = useState(null);
  const [replayPlaylists, setReplayPlaylists] = useState([]);
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [replayArtists, setReplayArtists] = useState([]); // New state for replay artists

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (!musicUserToken) {
        console.error('No music user token found');
        return;
      }
      setSignIn(false);
      setLoading(true);
      try {
        let allSongs = [];
        let offset = 0;
        const limit = 100;
        let hasNext = true;

        while (hasNext) {
          const response = await fetch(`https://api.music.apple.com/v1/me/library/songs?limit=${limit}&offset=${offset}`, {
            headers: {
              Authorization: `Bearer ${musicKitInstance.developerToken}`,
              'Music-User-Token': musicUserToken,
            },
          });

          const data = await response.json();
          console.log('Response Data:', data);

          if (data && data.data) {
            allSongs = allSongs.concat(data.data);
            setLoadedSongCount(prevCount => prevCount + data.data.length); // Update the loaded song count
            hasNext = data.data.length === limit;
            offset += limit;
          } else {
            hasNext = false;
          }
        }

        console.log('Library fetched!');
        setUserLibrary(allSongs);

        // Cache the fetched data and timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify(allSongs));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      } catch (error) {
        console.error('Error fetching songs:', error.message);
      } finally {
        setLoading(false);
        renderContent();
      }
    };

    const fetchReplayPlaylists = async () => {
      try {
        let allPlaylists = [];
        let offset = 0;
        const limit = 25;
        let hasNext = true;
        let allArtists = [];
    
        console.log("Fetching Replay Playlists...");
    
        while (hasNext) {
          const response = await fetch(`https://api.music.apple.com/v1/me/library/playlists?limit=${limit}&offset=${offset}`, {
            headers: {
              Authorization: `Bearer ${musicKitInstance.developerToken}`,
              'Music-User-Token': musicUserToken,
            },
          });
    
          const data = await response.json();
          console.log("Fetched Playlists Batch:", data);
    
          if (data && data.data) {
            allPlaylists = allPlaylists.concat(data.data);
            hasNext = data.data.length === limit;
            offset += limit;
          } else {
            hasNext = false;
          }
        }
        console.log("All Playlists Fetched:", allPlaylists);
    
        const replayPlaylists = allPlaylists.filter(playlist =>
          playlist.attributes.name.startsWith('Replay') ||
          playlist.attributes.name.startsWith('Favorite Songs') ||
          playlist.attributes.name.startsWith('Heavy Rotation Mix')
        );
        console.log("Filtered Replay Playlists:", replayPlaylists);
    
        // Fetch complete details for each replay playlist
        const replayPlaylistDetails = await Promise.all(replayPlaylists.map(async playlist => {
          const response = await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlist.id}/tracks`, {
            headers: {
              Authorization: `Bearer ${musicKitInstance.developerToken}`,
              'Music-User-Token': musicUserToken,
            },
          });
          const data = await response.json();
          console.log(`Fetched Playlist Tracks for ${playlist.attributes.name}:`, data);
    
          const tracks = data.data || [];
          console.log(`Tracks in ${playlist.attributes.name}:`, tracks);
    
          // Collect artist names from each track
          tracks.forEach(track => {
            if (track.attributes && track.attributes.artistName) {
              allArtists.push(track.attributes.artistName);
            }
          });
    
          return playlist; // Return the playlist itself since we don't need extra details
        }));
    
        console.log("Replay Playlist Details:", replayPlaylistDetails);
        console.log("All Artists Collected:", allArtists);
    
        setReplayPlaylists(replayPlaylistDetails);
        setReplayArtists(allArtists);
    
        // Cache the fetched playlists and timestamp
        localStorage.setItem(PLAYLISTS_CACHE_KEY, JSON.stringify(replayPlaylistDetails));
        localStorage.setItem(PLAYLISTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
        // Optionally, you can also cache the artist names
        localStorage.setItem('replayArtistsCache', JSON.stringify(allArtists));
    
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setReplayPlaylists([]);
      }
    };

    const fetchRecentlyPlayedTracks = async () => {
      try {
        const response = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks', {
          headers: {
            Authorization: `Bearer ${musicKitInstance.developerToken}`,
            'Music-User-Token': musicUserToken,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Recently Played Tracks:', data);
        setRecentlyPlayedTracks(data.data);

        // Cache the fetched recently played tracks and timestamp
        localStorage.setItem(RECENTLY_PLAYED_CACHE_KEY, JSON.stringify(data.data));
        localStorage.setItem(RECENTLY_PLAYED_CACHE_TIMESTAMP_KEY, Date.now().toString());

      } catch (error) {
        console.error('Error fetching recently played tracks:', error);
      }
    };

const loadCachedData = () => {
  console.log("Loading Cached Data...");
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const cachedPlaylists = localStorage.getItem(PLAYLISTS_CACHE_KEY);
  const cachedPlaylistsTimestamp = localStorage.getItem(PLAYLISTS_CACHE_TIMESTAMP_KEY);
  const cachedRecentlyPlayed = localStorage.getItem(RECENTLY_PLAYED_CACHE_KEY);
  const cachedRecentlyPlayedTimestamp = localStorage.getItem(RECENTLY_PLAYED_CACHE_TIMESTAMP_KEY);
  const cachedReplayArtists = localStorage.getItem('replayArtistsCache');
  const currentTime = Date.now();

  if (cachedData && cachedTimestamp && cachedPlaylists && cachedPlaylistsTimestamp && cachedRecentlyPlayed && cachedRecentlyPlayedTimestamp && cachedReplayArtists) {
    const cacheAge = currentTime - parseInt(cachedTimestamp, 10);
    const playlistsCacheAge = currentTime - parseInt(cachedPlaylistsTimestamp, 10);
    const recentlyPlayedCacheAge = currentTime - parseInt(cachedRecentlyPlayedTimestamp, 10);

    if (cacheAge < CACHE_DURATION && playlistsCacheAge < CACHE_DURATION && recentlyPlayedCacheAge < CACHE_DURATION) {
      console.log('Using cached data');
      setUserLibrary(JSON.parse(cachedData));
      setReplayPlaylists(JSON.parse(cachedPlaylists));
      setRecentlyPlayedTracks(JSON.parse(cachedRecentlyPlayed));
      setReplayArtists(JSON.parse(cachedReplayArtists)); // Set the replay artists from cache
      setLoading(false);
      setSignIn(false);
      renderContent();
      return true;
    }
  }
  return false;
};


    if (musicUserToken) {
      if (!loadCachedData()) {
        fetchUserLibrary();
        fetchReplayPlaylists();
        fetchRecentlyPlayedTracks();
      }
    }
  }, [musicKitInstance, musicUserToken]);

  useEffect(() => {
    if (backgroundColors.length > 0) {
      const sortedColors = backgroundColors.sort((a, b) => {
        const luminanceA = (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) / 255;
        const luminanceB = (0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]) / 255;
        return luminanceA - luminanceB;
      });

      const gradient = `linear-gradient(45deg, ${sortedColors.map(color => `rgb(${color.join(',')})`).join(', ')})`;
      const songContainer = document.querySelector('.songContainer');
      if (songContainer) {
        songContainer.style.background = gradient;
      }
    }
  }, [backgroundColors]);

  const handleExtractColors = (colors) => {
    console.log('Received colors:', colors);
    setBackgroundColors(colors);
  };

  const handleSelectSong = (song) => {
    setSelectedSong(song);
  };

  const [activePage, setActivePage] = useState('song'); // Default to 'song' page

  const handleNavItemClick = (page) => {
    setActivePage(page);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'artist':
        return <div>
              <Navbar onNavItemClick={handleNavItemClick}></Navbar>
              <h3 className="generalInfo">Coming Soon</h3>;
              </div>
      case 'replay':
        return <div>
            <Navbar onNavItemClick={handleNavItemClick}></Navbar>
            <h3 className="generalInfo">Coming Soon</h3>;
        </div>
      case 'song':
        return (
          <div>
              <Navbar onNavItemClick={handleNavItemClick}></Navbar>
              <div className="songContainer">
                <SearchBar userLibrary={userLibrary} onSelectSong={handleSelectSong} />
                {selectedSong && (
                  <SongStats
                  song={selectedSong}
                  playlists={replayPlaylists}
                  recentlyPlayedTracks={recentlyPlayedTracks}
                  musicUserToken={musicUserToken}
                  onExtractColors={handleExtractColors}
                  replayArtists={replayArtists} // Pass replay artists to SongStats
                />
            )}
            </div>
          </div>
          
        );
      default:
        return (
          <div>
          <Navbar onNavItemClick={handleNavItemClick} ></Navbar>
          <div className="songContainer">
            <SearchBar userLibrary={userLibrary} onSelectSong={handleSelectSong} />
            {selectedSong && (
              <SongStats
                song={selectedSong}
                playlists={replayPlaylists}
                recentlyPlayedTracks={recentlyPlayedTracks}
                musicUserToken={musicUserToken}
                onExtractColors={handleExtractColors}
                replayArtists={replayArtists} // Pass replay artists to SongStats
              />
            )}
          </div></div>
        );
    }
  };

  if (signIn){
    return (
      <div className="preContainer">
        <img src="AppleMusic.png" alt="Apple Music Icon" className="centeredImage" />
        <h1 className = "preMessage loadingMessage">Please sign in with Apple Music.</h1>
        <h2 className = "preMessage loadingMessage2">Ensure that you have browser popups enabled.</h2>
      </div>
     );}
  if (loading) {
    return (
    <div className="preContainer">
      <img src="AppleMusic.png" alt="Apple Music Icon" className="centeredImage" />
      <h1 className = "preMessage loadingMessage">Loading User Data...</h1>
      <h2 className = "preMessage loadingMessage2">({loadedSongCount} songs loaded so far...)</h2>
    </div>
  );
  }

  return (
    <div>
      <h1 className = "generalInfo">amlibrary-plays</h1>
      <h3 className = "generalInfo">Search a song in your Apple Music Library to see your user statistics.</h3>
      {renderContent()}
    </div>
  );
};

export default App;
