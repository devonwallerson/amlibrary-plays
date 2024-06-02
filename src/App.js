import React, { useContext, useEffect, useState } from 'react';
import MusicKitContext from './MusicKitContext';
import SearchBar from './SearchBar';
import SongStats from './SongStats';

const CACHE_KEY = 'userLibraryCache';
const CACHE_TIMESTAMP_KEY = 'userLibraryCacheTimestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const App = () => {
  const { musicKitInstance, musicUserToken } = useContext(MusicKitContext);
  const [userLibrary, setUserLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

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
        setLoading(false);

        // Cache the fetched data and timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify(allSongs));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      } catch (error) {
        console.error('Error fetching songs:', error.message);
        setLoading(false);
      }
    };

    const loadCachedData = () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      const currentTime = Date.now();

      if (cachedData && cachedTimestamp) {
        const cacheAge = currentTime - parseInt(cachedTimestamp, 10);
        if (cacheAge < CACHE_DURATION) {
          console.log('Using cached data');
          setUserLibrary(JSON.parse(cachedData));
          setLoading(false);
          return true;
        }
      }
      return false;
    };

    if (musicUserToken) {
      if (!loadCachedData()) {
        fetchUserLibrary();
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
      {selectedSong && <SongStats song={selectedSong} musicUserToken={musicUserToken} />}
    </div>
  );
};

export default App;
