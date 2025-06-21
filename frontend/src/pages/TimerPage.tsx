import { useState} from 'react';
import { Timer } from '../components/Timer/Timer';
import { useSessions } from '../hooks/useSessions';
import { parseISO, isToday } from 'date-fns';
import { useTimer } from '../context/TimerContext';
import { YouTubePlayer } from '../components/Music/YouTubePlayer';
import { JamendoPlayer } from '../components/Music/JamendoPlayer';
import { MonitorDot, MonitorOff, Music, Play, Search, List, Youtube, Zap } from 'lucide-react';
import { useQuizHub } from '../hooks/useQuizHub';
import { youtubeAPI } from '../lib/youtube';


export function TimerPage() {
  const { sessions, loading, error, updateSession } = useSessions();
  const { selectedSession, setSelectedSessionContext, time, clearTimer, isActive, isPaused } = useTimer();
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [activeMusicTab, setActiveMusicTab] = useState<'spotify' | 'youtube' | 'jamendo'>('spotify');
  const [spotifySearchQuery, setSpotifySearchQuery] = useState('');
  const [jamendoSearchQuery, setJamendoSearchQuery] = useState('');

  // Quiz Hub integration
  const { createYouTubeUpload, generateQuizWithAI, isAIConfigured } = useQuizHub();

  const todaysSessions = sessions.filter(session => 
    session.created_at && isToday(parseISO(session.created_at))
  );

  const handleTimerComplete = async (elapsedTimeSeconds: number) => {
    if (!selectedSession) {
      console.log('handleTimerComplete: No selected session. Exiting.');
      return;
    }

    console.log('handleTimerComplete: Session:', selectedSession);
    console.log('handleTimerComplete: Elapsed time seconds:', elapsedTimeSeconds);

    const elapsedMinutes = Math.floor(elapsedTimeSeconds / 60);
    console.log('handleTimerComplete: Elapsed minutes:', elapsedMinutes);
    console.log('handleTimerComplete: Planned duration minutes:', selectedSession.duration_minutes);

    if (elapsedMinutes >= selectedSession.duration_minutes) {
      console.log('handleTimerComplete: Elapsed time is greater than or equal to planned duration. Attempting to complete session...');
      try {
        await updateSession(selectedSession.id, { completed: true });
        console.log('handleTimerComplete: Session marked as completed successfully.');
      } catch (error) {
        console.error('handleTimerComplete: Error completing session:', error);
      }
    } else {
      console.log(`handleTimerComplete: Session not marked complete. Elapsed time (${elapsedMinutes} min) is less than planned duration (${selectedSession.duration_minutes} min).`);
    }
  };

  const handleClearSummary = () => {
    setSelectedSessionContext(null);
    clearTimer();
    setFocusMode(false);
  };

  const showSummaryDetails = !isActive && !isPaused && selectedSession && time > 0;

  // Enhanced YouTube video change handler with quiz generation
  const handleYouTubeVideoChange = async (video: any) => {
    setYoutubeVideoId(video.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
        <p className="text-red-400">Error loading sessions: {error}</p>
      </div>
    );
  }

  const renderMusicTab = () => {
    switch (activeMusicTab) {
      case 'spotify':
        return (
          <div className="space-y-6">
            {/* Spotify Connect Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Music className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">Connect Your Spotify</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                Access your playlists, discover study music, and control playback directly from your timer.
              </p>
              
              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col items-center space-y-2 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <Search className="w-6 h-6 text-green-400" />
                  <span className="text-sm text-gray-300 text-center">Search study playlists</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <List className="w-6 h-6 text-green-400" />
                  <span className="text-sm text-gray-300 text-center">Browse saved playlists</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <Play className="w-6 h-6 text-green-400" />
                  <span className="text-sm text-gray-300 text-center">Control playback</span>
                </div>
              </div>
              
              <button className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Connect Spotify Account
              </button>
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            <YouTubePlayer 
              videoId={youtubeVideoId} 
              onVideoChange={handleYouTubeVideoChange}
            />
          </div>
        );

      case 'jamendo':
        return (
          <div className="space-y-4">
            <JamendoPlayer />
          </div>
        );

      default:
        return null;
    }
  };

  const mappedSessions = sessions.map((s) => {
    const start = new Date(s.date || s.created_at);
    const startTime = start.toTimeString().slice(0, 5); // "HH:MM"
    const end = new Date(start.getTime() + (s.duration_minutes || 60) * 60000);
    const endTime = end.toTimeString().slice(0, 5); // "HH:MM"
    return {
      id: s.id,
      title: s.title,
      date: start,
      startTime,
      endTime,
    };
  });

  return (
    <>
      <div className="space-y-6 lg:space-y-8 bg-gray-950 min-h-screen pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Study Timer</h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">
              Focus on your study sessions with our built-in timer and music integration.
            </p>
          </div>
          <button
            onClick={() => setFocusMode(prev => !prev)}
            disabled={!selectedSession}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {focusMode ? (
              <>
                <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Exit Focus Mode
              </>
            ) : (
              <>
                <MonitorDot className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Enter Focus Mode
              </>
            )}
          </button>
        </div>

        <div className={`grid ${focusMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'} gap-6 lg:gap-8`}>
          <div className="space-y-4 sm:space-y-6">
            <Timer
              sessionTitle={selectedSession?.title || 'Free Study Session'}
              onComplete={handleTimerComplete}
              onTimerStart={() => setFocusMode(true)}
            />
            
            {selectedSession && (
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Current Session</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-300">Subject:</span>
                    <span className="font-medium text-white">{selectedSession.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-300">Planned Duration:</span>
                    <span className="font-medium text-white">{selectedSession.duration_minutes} minutes</span>
                  </div>
                  {/* Show planned breaks if any */}
                  {selectedSession.breaks && selectedSession.breaks.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs sm:text-sm text-primary-400 font-semibold mb-2">Planned Breaks</div>
                      <ul className="space-y-1">
                        {selectedSession.breaks.map((brk, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-primary-200 bg-primary-900/20 rounded px-2 sm:px-3 py-1">
                            <span className="font-bold">Break #{idx + 1}:</span>
                            <span>Start at {brk.startAfterMinutes} min</span>
                            <span>•</span>
                            <span>Duration {brk.durationMinutes} min</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(!isActive && !isPaused && time > 0) && (
                    <>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-300">Elapsed Time:</span>
                        <span className="font-medium text-white">{Math.floor(time / 60)} minutes</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-300">Remaining Time:</span>
                        <span className="font-medium text-white">{Math.floor((selectedSession?.duration_minutes || 0) - (Math.floor(time / 60))) } minutes</span>
                      </div>
                    </>
                  )}
                  {selectedSession.notes && (
                    <div className="mt-4">
                      <span className="text-gray-300 text-sm sm:text-base">Notes:</span>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1 p-2 sm:p-3 bg-gray-800/50 rounded-lg">
                        {selectedSession.notes}
                      </p>
                    </div>
                  )}
                </div>
                {(!isActive && !isPaused && time > 0) && (
                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 text-sm sm:text-base"
                      onClick={handleClearSummary}
                    >
                      Clear Timer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!focusMode && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/20">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Today's Sessions</h3>
              
              <div className="space-y-2 sm:space-y-3">
                {todaysSessions.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <p className="text-sm sm:text-base">No sessions scheduled for today</p>
                    <p className="text-xs sm:text-sm">Create a session to get started!</p>
                  </div>
                ) : (
                  todaysSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedSession?.id === session.id
                          ? 'border-primary-300 bg-primary-900/20'
                          : session.completed
                          ? 'border-secondary-700 bg-secondary-900/20'
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                      }`}
                      onClick={() => !session.completed && setSelectedSessionContext(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm sm:text-base ${
                            session.completed ? 'text-gray-500 line-through' : 'text-white'
                          } truncate`}>
                            {session.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-300">{session.subject} • {session.duration_minutes} min</p>
                        </div>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs ${
                          session.completed 
                            ? 'bg-secondary-500 text-white' 
                            : selectedSession?.id === session.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                        } flex-shrink-0`}>
                          {session.completed ? '✓' : selectedSession?.id === session.id ? '▶' : '○'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Music Section - Reverted to Previous Design */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 border-b border-gray-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Study Music</h2>
                <p className="text-gray-300">
                  Choose your preferred music platform for focused studying
                </p>
              </div>
            </div>
            
            {/* Music Platform Tabs - Reverted to Previous Simple Design */}
            <div className="flex items-center gap-8 border-b border-gray-700 mb-2 px-2" style={{height: 40}}>
              <button
                onClick={() => setActiveMusicTab('spotify')}
                className="flex items-center gap-2 focus:outline-none relative"
                style={{
                  fontWeight: activeMusicTab === 'spotify' ? 700 : 400,
                  color: activeMusicTab === 'spotify' ? '#22c55e' : '#d1d5db',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 15,
                  height: 40,
                }}
              >
                Spotify
                {activeMusicTab === 'spotify' && (
                  <span style={{position: 'absolute', left: 0, right: 0, bottom: -2, height: 3, background: '#ef4444', borderRadius: 2}} />
                )}
              </button>
              <button
                onClick={() => setActiveMusicTab('youtube')}
                className="flex items-center gap-2 focus:outline-none relative"
                style={{
                  fontWeight: activeMusicTab === 'youtube' ? 700 : 400,
                  color: activeMusicTab === 'youtube' ? '#fff' : '#d1d5db',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 15,
                  height: 40,
                }}
              >
                YouTube
                {activeMusicTab === 'youtube' && (
                  <span style={{position: 'absolute', left: 0, right: 0, bottom: -2, height: 3, background: '#ef4444', borderRadius: 2}} />
                )}
              </button>
              <button
                onClick={() => setActiveMusicTab('jamendo')}
                className="flex items-center gap-2 focus:outline-none relative"
                style={{
                  fontWeight: activeMusicTab === 'jamendo' ? 700 : 400,
                  color: activeMusicTab === 'jamendo' ? '#3b82f6' : '#d1d5db',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 15,
                  height: 40,
                }}
              >
                Jamendo
                {activeMusicTab === 'jamendo' && (
                  <span style={{position: 'absolute', left: 0, right: 0, bottom: -2, height: 3, background: '#ef4444', borderRadius: 2}} />
                )}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {renderMusicTab()}
          </div>
        </div>
      </div>
    </>
  );
}