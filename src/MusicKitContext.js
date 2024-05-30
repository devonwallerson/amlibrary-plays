// src/MusicKitContext.js
import React, { createContext, useEffect, useState } from 'react';

const MusicKitContext = createContext();

export const MusicKitProvider = ({ children }) => {
  const [musicKitInstance, setMusicKitInstance] = useState(null);

  useEffect(() => {
    const configureMusicKit = async () => {
      document.addEventListener('musickitloaded', async () => {
        try {
          const musicKit = await MusicKit.configure({
            developerToken: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkI2OVJGN0wyVDUifQ.eyJpYXQiOjE3MTcxMDM3NDQsImV4cCI6MTczMjY1NTc0NCwiaXNzIjoiQlhQWFY3WEg0UCJ9.vPpuST0lAYcPdGPFggBYL9kt9T7zuLaf-hlYepDhna1RRtqDb5jPwQtjb6bbulwxIHGWoDqh_jhWfyQhYRGSUQ',
            app: {
              name: 'Library.Plays',
              build: '1978.4.1',
            },
          });
          setMusicKitInstance(musicKit);
        } catch (err) {
          console.error('Failed to configure MusicKit', err);
        }
      });
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
