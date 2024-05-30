// src/App.js
import React, { useContext, useEffect, useState } from 'react';
import MusicKitContext from './MusicKitContext';

const App = () => {
  const musicKit = useContext(MusicKitContext);
  const [userLibrary, setUserLibrary] = useState([]);

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (musicKit) {
        try {
          await musicKit.authorize();
          const library = await musicKit.api.library.songs();
          setUserLibrary(library);
        } catch (error) {
          console.error('Failed to fetch user library', error);
        }
      }
    };

    fetchUserLibrary();
  }, [musicKit]);

  return (
    <div>
      <h1>Music Library</h1>
      <ul>
        {userLibrary.map(song => (
          <li key={song.id}>{song.attributes.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
