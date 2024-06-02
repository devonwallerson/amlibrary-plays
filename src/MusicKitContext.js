import React, { createContext, useEffect, useState } from 'react';
import config from './config'; // Import the configuration

const MusicKitContext = createContext();

export const MusicKitProvider = ({ children }) => {
  const [musicKitInstance, setMusicKitInstance] = useState(null);
  const [musicUserToken, setMusicUserToken] = useState(null);

  useEffect(() => {
    const configureMusicKit = async () => {
      console.log('Adding musickitloaded event listener');
      document.addEventListener('musickitloaded', async () => {
        console.log('MusicKit loaded');
        try {
          const musicKit = await window.MusicKit.configure({
            developerToken: config.developerToken,
            app: {
              name: config.appName,
              build: config.appBuild,
            },
          });
          console.log('MusicKit configured:', musicKit);
          setMusicKitInstance(musicKit);

          // Automatically authorize the user when MusicKit is loaded
          const userToken = await musicKit.authorize();
          console.log('User authorized, music user token:', userToken);
          setMusicUserToken(userToken);
        } catch (err) {
          console.error('Failed to configure MusicKit', err);
        }
      });

      if (window.MusicKit) {
        // This ensures the musickitloaded event is fired if MusicKit is already loaded
        const event = new Event('musickitloaded');
        document.dispatchEvent(event);
      }
    };

    configureMusicKit();
  }, []);

  return (
    <MusicKitContext.Provider value={{ musicKitInstance, musicUserToken }}>
      {children}
    </MusicKitContext.Provider>
  );
};

export default MusicKitContext;
