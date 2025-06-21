import React, { useEffect, useRef, useState } from 'react';
import { Search, Play, Clock, Eye, List, Minimize2, Maximize2 } from 'lucide-react';
import { youtubeAPI, YouTubeVideo, YouTubePlaylist } from '../../lib/youtube';

interface YouTubePlayerProps {
  videoId?: string;
  onVideoChange?: (video: YouTubeVideo) => void;
}

interface Window {
  YT: any;
  onYouTubeIframeAPIReady: () => void;
}

declare const window: Window;

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onVideoChange }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [playlistResults, setPlaylistResults] = useState<YouTubePlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [studyVideos, setStudyVideos] = useState<YouTubeVideo[]>([]);
  const [searchType, setSearchType] = useState<'videos' | 'playlists'>('videos');
  const [minimized, setMinimized] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debug: log API key
    // @ts-ignore
    console.log('YouTube API Key:', youtubeAPI.apiKey);
    loadStudyMusic();
  }, []);

  useEffect(() => {
    let destroyed = false;
    let timeout: NodeJS.Timeout;
    setLoading(true);
    setPlayerError(false);
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (playerRef.current && !destroyed) {
          playerInstance.current = new window.YT.Player(playerRef.current, {
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
            },
            events: {
              onReady: () => {
                setPlayerReady(true);
                setLoading(false);
                setPlayerError(false);
                console.log('YouTube Player Ready');
              },
              onError: (e: any) => {
                console.error('YouTube Player Error:', e);
                setPlayerReady(false);
                setPlayerError(true);
                setLoading(false);
              },
              onStateChange: (e: any) => {
                console.log('YouTube Player State Change:', e.data);
              },
            },
          });
        }
      };
    } else if (playerRef.current && !playerInstance.current) {
      playerInstance.current = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
            setLoading(false);
            setPlayerError(false);
            console.log('YouTube Player Ready');
          },
          onError: (e: any) => {
            console.error('YouTube Player Error:', e);
            setPlayerReady(false);
            setPlayerError(true);
            setLoading(false);
          },
          onStateChange: (e: any) => {
            console.log('YouTube Player State Change:', e.data);
          },
        },
      });
    }
    // Fallback: if not ready after 5 seconds, show error
    timeout = setTimeout(() => {
      if (!playerReady && !destroyed) {
        setPlayerError(true);
        setLoading(false);
      }
    }, 5000);
    return () => {
      destroyed = true;
      clearTimeout(timeout);
      if (playerInstance.current) {
        try {
          playerInstance.current.destroy();
        } catch (err) {
          console.error('Error destroying YouTube player:', err);
        }
        playerInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (playerInstance.current && playerReady && videoId) {
      try {
        playerInstance.current.loadVideoById(videoId);
        setLoading(false);
        setPlayerError(false);
      } catch (err) {
        console.error('Error loading video by ID:', err);
        setPlayerError(true);
        setLoading(false);
      }
    }
  }, [videoId, playerReady]);

  const loadStudyMusic = async () => {
    setIsLoading(true);
    try {
      console.log('Loading YouTube study music...');
      const videos = await youtubeAPI.searchStudyMusic(10);
      console.log('YouTube study music loaded:', videos);
      setStudyVideos(videos);
    } catch (error) {
      console.error('Failed to load YouTube study music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    console.log('YouTube search triggered with:', searchQuery, 'type:', searchType);
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      if (searchType === 'videos') {
        const results = await youtubeAPI.searchVideos(searchQuery, 10);
        console.log('YouTube video search results:', results);
        setSearchResults(results);
        setPlaylistResults([]);
      } else {
        const results = await youtubeAPI.searchPlaylists(searchQuery, 10);
        console.log('YouTube playlist search results:', results);
        setPlaylistResults(results);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('YouTube search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playVideo = (video: YouTubeVideo) => {
    setCurrentVideo(video);
    if (playerInstance.current) {
      playerInstance.current.loadVideoById(video.id);
    }
    if (onVideoChange) {
      onVideoChange(video);
    }
  };

  const playPlaylist = async (playlist: YouTubePlaylist) => {
    try {
      setIsLoading(true);
      const videos = await youtubeAPI.getPlaylistVideos(playlist.id, 10);
      if (videos.length > 0) {
        playVideo(videos[0]);
        setSearchResults(videos);
        setPlaylistResults([]);
      }
    } catch (error) {
      console.error('Failed to load playlist videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-4 border border-red-700/30">
        <div className="flex items-center space-x-3 mb-3">
          <Search className="w-5 h-5 text-red-400" />
          <span className="font-medium text-white">Search YouTube Music</span>
        </div>
        
        {/* Search Type Toggle */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 border border-red-700/30 mb-3">
          <button
            onClick={() => setSearchType('videos')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
              searchType === 'videos'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Videos</span>
          </button>
          <button
            onClick={() => setSearchType('playlists')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
              searchType === 'playlists'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Playlists</span>
          </button>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search for ${searchType === 'videos' ? 'videos' : 'playlists'}...`}
            className="flex-1 px-4 py-2 border border-red-700/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-800 text-white placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Video Results</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((video) => (
              <div
                key={video.id}
                onClick={() => playVideo(video)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-16 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{video.title}</h4>
                  <p className="text-sm text-gray-300 truncate">{video.channelTitle}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{youtubeAPI.formatDuration(video.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{youtubeAPI.formatViewCount(video.viewCount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlist Results */}
      {playlistResults.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Playlist Results</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {playlistResults.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => playPlaylist(playlist)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-16 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{playlist.title}</h4>
                  <p className="text-sm text-gray-300 truncate">{playlist.channelTitle}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <List className="w-3 h-3" />
                      <span>Playlist</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Video Player with Minimize Button */}
      {videoId && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-white">Now Playing</span>
            <button
              onClick={() => setMinimized((m) => !m)}
              className="flex items-center px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              title={minimized ? 'Maximize Video' : 'Minimize Video'}
            >
              {minimized ? <Maximize2 className="w-4 h-4 mr-1" /> : <Minimize2 className="w-4 h-4 mr-1" />}
              {minimized ? 'Show Video' : 'Minimize Video'}
            </button>
          </div>
          <div className={minimized ? 'w-32 h-8 overflow-hidden transition-all duration-300' : 'aspect-video w-full min-h-[200px] mb-4 transition-all duration-300'}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <span className="ml-2 text-gray-400">Loading player...</span>
              </div>
            )}
            {playerError && !loading && (
              <div className="flex items-center justify-center h-full text-red-400 font-semibold">
                Failed to load YouTube player. Please try another video.
              </div>
            )}
            <div ref={playerRef} id="youtube-player" className={loading || playerError ? 'hidden' : 'w-full h-full'}></div>
          </div>
          
          {currentVideo && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white">{currentVideo.title}</h3>
              <p className="text-sm text-gray-300">{currentVideo.channelTitle}</p>
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{youtubeAPI.formatDuration(currentVideo.duration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Study Music Suggestions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Study Music Suggestions</h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading study music...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {studyVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => playVideo(video)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentVideo?.id === video.id
                    ? 'bg-red-900/20 border border-red-700/30'
                    : 'hover:bg-gray-700'
                }`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-12 h-9 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate text-sm">{video.title}</h4>
                  <p className="text-xs text-gray-300 truncate">{video.channelTitle}</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{youtubeAPI.formatDuration(video.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 