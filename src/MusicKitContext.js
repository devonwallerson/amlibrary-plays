
import React, { createContext, useEffect, useState } from 'react';

const MusicKitContext = createContext();

export const MusicKitProvider = ({ children }) => {
  const [musicKitInstance, setMusicKitInstance] = useState(null);

  useEffect(() => {
    const configureMusicKit = async () => {
      console.log('Adding musickitloaded event listener');
      document.addEventListener('musickitloaded', async () => {
        console.log('MusicKit loaded');
        try {
          const musicKit = await window.MusicKit.configure({
            developerToken: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkI2OVJGN0wyVDUifQ.eyJpYXQiOjE3MTcxMDM3NDQsImV4cCI6MTczMjY1NTc0NCwiaXNzIjoiQlhQWFY3WEg0UCJ9.vPpuST0lAYcPdGPFggBYL9kt9T7zuLaf-hlYepDhna1RRtqDb5jPwQtjb6bbulwxIHGWoDqh_jhWfyQhYRGSUQ',
            app: {
              name: 'libraryPlays',
              build: '1978.4.1',
            },
          });
          console.log('MusicKit configured:', musicKit);
          setMusicKitInstance(musicKit);
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
    <MusicKitContext.Provider value={musicKitInstance}>
      {children}
    </MusicKitContext.Provider>
  );
};

export default MusicKitContext;
