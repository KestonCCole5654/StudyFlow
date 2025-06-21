import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Heart, Clock } from 'lucide-react';
import { jamendoAPI, JamendoTrack } from '../../lib/jamendo';

interface JamendoPlayerProps {
  onTrackChange?: (track: JamendoTrack) => void;
}

export const JamendoPlayer: React.FC<JamendoPlayerProps> = ({ onTrackChange }) => {
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<JamendoTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [searchResults, setSearchResults] = useState<JamendoTrack[]>([]);

  useEffect(() => {
    // Debug: log client ID
    // @ts-ignore
    console.log('Jamendo Client ID:', jamendoAPI.clientId);
    loadStudyMusic();
  }, []);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audio;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  const loadStudyMusic = async () => {
    setIsLoading(true);
    try {
      console.log('Loading study music from Jamendo...');
      const studyTracks = await jamendoAPI.searchStudyMusic(10);
      console.log('Study music loaded:', studyTracks);
      setTracks(studyTracks);
      if (studyTracks.length > 0 && !currentTrack) {
        setCurrentTrack(studyTracks[0]);
      }
    } catch (error) {
      console.error('Failed to load study music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    console.log('Search triggered with:', searchQuery);
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await jamendoAPI.searchTracks(searchQuery, 10);
      console.log('Jamendo API search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = (track: JamendoTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    onTrackChange?.(track);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const playPrevious = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl p-4 border border-blue-700/30">
        <div className="flex items-center space-x-3 mb-3">
          <Search className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">Search Jamendo Music</span>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for study music, instrumental, ambient..."
            className="flex-1 px-4 py-2 border border-blue-700/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Search Results</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <img
                  src={track.image}
                  alt={track.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{track.name}</h4>
                  <p className="text-sm text-gray-300 truncate">{track.artist_name}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {formatTime(track.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Player */}
      {currentTrack && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={currentTrack.image}
              alt={currentTrack.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{currentTrack.name}</h3>
              <p className="text-gray-300">{currentTrack.artist_name}</p>
              <p className="text-sm text-gray-400">{currentTrack.album_name}</p>
            </div>
          </div>

          {/* Progress Bar - Fixed Styling */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 100%)`
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
              `}</style>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={playPrevious}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={playNext}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }
              `}</style>
            </div>
            <span className="text-sm text-gray-400 w-8">{Math.round(volume * 100)}</span>
          </div>
        </div>
      )}

      {/* Study Music Suggestions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Study Music Suggestions</h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading study music...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentTrack?.id === track.id
                    ? 'bg-blue-900/20 border border-blue-700/30'
                    : 'hover:bg-gray-700'
                }`}
              >
                <img
                  src={track.image}
                  alt={track.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{track.name}</h4>
                  <p className="text-sm text-gray-300 truncate">{track.artist_name}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(track.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={handleTimeUpdate}
      />
    </div>
  );
};