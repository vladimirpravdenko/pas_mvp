import React from 'react';

interface AudioPlayerProps {
  src: string;
}

/**
 * Simple wrapper around the native audio element. Accepts an audio source URL
 * and renders controls for playback.
 */
export default function AudioPlayer({ src }: AudioPlayerProps) {
  return (
    <audio controls className="w-full" src={src}>
      Your browser does not support the audio element.
    </audio>
  );
}
