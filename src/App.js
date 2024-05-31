import React, { useContext, useEffect, useState } from 'react';
import MusicKitContext from './MusicKitContext';
import SearchBar from './SearchBar'
import SongStats from './SongStats'

const App = () => {
  const musicKit = useContext(MusicKitContext);
  const [userLibrary, setUserLibrary] = useState([]);
  const [loading, setLoading] = useState(true)
  const [selectedSong, setSelectedSong] = useState(null)

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (musicKit) {
        console.log('MusicKit instance available:', musicKit);
        try {
          await musicKit.authorize();
          console.log('MusicKit authorized');

          let allSongs = []; // stores songs
          let next = true; // next song pointer
          let offset = 0; 
          const limit = 100

          while(next) {
            const response = await musicKit.api.library.songs({limit,offset})
            console.log(' New Batch' , response)
            allSongs = allSongs.concat(response);
            offset += limit; // ensures that the API will not call the same songs again
            next = response.length > 0 // checks if there are more songs to be retrieved by api
            console.log('New batch needed')
          } 

          console.log ("Library fetched!")
          setUserLibrary(allSongs);
          setLoading(false);

        } catch (error) {
          if (error.networkError) {
            console.error('Network error:', error.networkError);
          } else if (error.response) {
            console.error('Response error:', error.response);
          } else {
            console.error('Unknown error:', error);
          }
          setLoading(false);
        }
      } else {
        console.log('MusicKit instance is not available yet');
      }
    };

    fetchUserLibrary();
  }, [musicKit]);

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Music Library</h1>
      <SearchBar userLibrary = {userLibrary} onSelectSong = {setSelectedSong}/>
      {selectedSong && <SongStats song = {selectedSong}/>}

      <ul>
        {userLibrary.map(song => (
          <li key={song.id}>{song.attributes.name}</li>
        ))}
      </ul>
    </div> 
  );
};

export default App;
