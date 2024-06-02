import React, { useContext, useEffect, useState } from 'react';
import MusicKitContext from './MusicKitContext';
import SearchBar from './SearchBar';
import SongStats from './SongStats';

// Use a cache to prevent user from having to reload their data every time they use the website. Data stays in cache for 30 minutes
const CACHE_KEY = 'userLibraryCache';
const CACHE_TIMESTAMP_KEY = 'userLibraryCacheTimestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const PLAYLISTS_CACHE_TIMESTAMP_KEY = 'userPlaylistsCacheTimestamp';
const PLAYLISTS_CACHE_KEY = 'userPlaylistsCache';

const App = () => {
  // State variables for sign in, user library, loading screen, and selected song
  const { musicKitInstance, musicUserToken } = useContext(MusicKitContext);
  const [userLibrary, setUserLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [replayPlaylists, setReplayPlaylists] = useState([]);

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (!musicUserToken) {
        console.error('No music user token found');
        return;
      }

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
      }
    };

    const fetchReplayPlaylists = async () => {
      try {
        let allPlaylists = [];
        let offset = 0;
        const limit = 25;
        let hasNext = true;

        while (hasNext) {
          const response = await fetch(`https://api.music.apple.com/v1/me/library/playlists?limit=${limit}&offset=${offset}`, {
            headers: {
              Authorization: `Bearer ${musicKitInstance.developerToken}`,
              'Music-User-Token': musicUserToken,
            },
          });

          const data = await response.json();
          console.log(data,'data')

          if (data && data.data) {
            allPlaylists = allPlaylists.concat(data.data);
            hasNext = data.data.length === limit;
            offset += limit;
          } else {
            hasNext = false;
          }
        }
        const replayPlaylists = allPlaylists.filter(playlist =>
          playlist.attributes.name.startsWith("Replay") || playlist.attributes.name.startsWith("Favorite Songs") || playlist.attributes.name.startsWith("Heavy Rotation Mix")
        );
        console.log(replayPlaylists,'replay playlists')

        // Fetch complete details for each replay playlist
        const replayPlaylistDetails = await Promise.all(replayPlaylists.map(async playlist => {
          const response = await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlist.id}`, {
            headers: {
              Authorization: `Bearer ${musicKitInstance.developerToken}`,
              'Music-User-Token': musicUserToken,
            },
          });
          const data = await response.json();
          return data.data[0];
        }));

        console.log(replayPlaylistDetails,'details')
        setReplayPlaylists(replayPlaylistDetails);

        // Cache the fetched playlists and timestamp
        localStorage.setItem(PLAYLISTS_CACHE_KEY, JSON.stringify(replayPlaylistDetails));
        localStorage.setItem(PLAYLISTS_CACHE_TIMESTAMP_KEY, Date.now().toString());

      } catch (error) {
        console.error('Error fetching playlists:', error);
        setReplayPlaylists([]);
      }
    };

    const loadCachedData = () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      const cachedPlaylists = localStorage.getItem(PLAYLISTS_CACHE_KEY);
      const cachedPlaylistsTimestamp = localStorage.getItem(PLAYLISTS_CACHE_TIMESTAMP_KEY);
      const currentTime = Date.now();

      if (cachedData && cachedTimestamp && cachedPlaylists && cachedPlaylistsTimestamp) {
        const cacheAge = currentTime - parseInt(cachedTimestamp, 10);
        const playlistsCacheAge = currentTime - parseInt(cachedPlaylistsTimestamp, 10);

        if (cacheAge < CACHE_DURATION && playlistsCacheAge < CACHE_DURATION) {
          console.log('Using cached data');
          setUserLibrary(JSON.parse(cachedData));
          setReplayPlaylists(JSON.parse(cachedPlaylists));
          setLoading(false);
          return true;
        }
      }
      return false;
    };

    if (musicUserToken) {
      if (!loadCachedData()) {
        fetchUserLibrary();
        fetchReplayPlaylists();
      }
    }
  }, [musicKitInstance, musicUserToken]);

  const handleSelectSong = (song) => {
    setSelectedSong(song);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Music Library</h1>
      <SearchBar userLibrary={userLibrary} onSelectSong={handleSelectSong} />
      {selectedSong && <SongStats song={selectedSong} playlists={replayPlaylists} musicUserToken={musicUserToken} />}
    </div>
  );
};

export default App;
