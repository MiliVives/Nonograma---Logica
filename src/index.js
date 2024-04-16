import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './index.css';
import Game from './Game';
import jazz from './berlioz - wash my sins away.mp3'; // cancion

function playAudio() {
  const audio = new Audio(jazz);
  audio.volume = 0.3; 
  audio.play();

  document.removeEventListener('click', playAudio);
  audio.addEventListener('ended', function() {
    audio.currentTime = 0; // Reset audio to the beginning
    audio.play();
  });
}

document.addEventListener('click', playAudio);

ReactDOMClient.createRoot(document.getElementById('root'))
  .render(<Game />);
