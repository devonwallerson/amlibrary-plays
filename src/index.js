// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { MusicKitProvider } from './MusicKitContext';

ReactDOM.render(
  <MusicKitProvider>
    <App />
  </MusicKitProvider>,
  document.getElementById('root')
);