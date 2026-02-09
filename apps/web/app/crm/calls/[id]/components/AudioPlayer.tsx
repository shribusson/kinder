'use client';

import { useState, useRef, useEffect } from 'react';
import { IconPlayerPlay, IconPlayerPause, IconVolume, IconDownload } from '@tabler/icons-react';

interface AudioPlayerProps {
  url: string;
  duration: number;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function AudioPlayer({ url, duration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-recording-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-4">
      <audio ref={audioRef} src={url} />

      {/* Player Controls */}
      <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 rounded-full bg-orange-600 p-3 text-white hover:bg-orange-700 transition-colors"
          title={isPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {isPlaying ? (
            <IconPlayerPause size={20} />
          ) : (
            <IconPlayerPlay size={20} />
          )}
        </button>

        {/* Time Display */}
        <div className="flex-shrink-0 text-sm font-medium text-slate-900 w-16">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Seek Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
        />

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <IconVolume size={18} className="text-slate-600" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            title="Громкость"
          />
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex-shrink-0 rounded p-2 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Скачать запись"
        >
          <IconDownload size={18} />
        </button>
      </div>

      {/* Info */}
      <div className="text-sm text-slate-500">
        Максимальная длительность: {formatTime(duration)}
      </div>
    </div>
  );
}
