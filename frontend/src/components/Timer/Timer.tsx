import React from 'react';
import { Play, Pause, Square, RotateCcw, ExternalLink, Clock, Coffee } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { BlobsAnimatedBackground } from './BlobsAnimatedBackground';
import { RingTimerDisplay } from './RingTimerDisplay';

interface TimerProps {
  sessionTitle?: string;
  onComplete?: (duration: number) => void;
  onTimerStart?: () => void;
}

export function Timer({ sessionTitle = 'Study Session', onComplete, onTimerStart }: TimerProps) {
  const { time, isActive, isPaused, start, pause, resume, stop, reset, formatTime, selectedSession, isOnBreak, currentBreakIndex } = useTimer();

  const handleStartStop = () => {
    if (!isActive) {
      // Start the timer
      start();
      if (onTimerStart) {
        onTimerStart();
      }
    } else if (isPaused) {
      // Resume the timer
      resume();
    } else {
      // Stop the timer
      stop();
      if (onComplete && time > 0) {
        onComplete(time);
      }
    }
  };

  const handlePopout = () => {
    window.open('/pip-timer.html', 'pip-timer', 'width=248,height=168,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
  };

  // Calculate progress based on session duration or default to time-based progress
  const calculateProgress = () => {
    if (selectedSession?.duration_minutes) {
      // If we have a session with duration, calculate progress based on that
      const totalSeconds = selectedSession.duration_minutes * 60;
      return Math.min(time / totalSeconds, 1);
    }
    // For sessions without duration, we'll show progress based on hours (max 2 hours)
    const maxSeconds = 2 * 60 * 60; // 2 hours
    return Math.min(time / maxSeconds, 1);
  };

  // Get next break information
  const getNextBreakInfo = () => {
    if (!selectedSession?.breaks || selectedSession.breaks.length === 0) {
      return null;
    }

    const currentTimeMinutes = Math.floor(time / 60);
    const nextBreakIndex = currentBreakIndex !== null ? currentBreakIndex + 1 : 0;
    
    // Find the next upcoming break
    const nextBreak = selectedSession.breaks.find((brk, index) => {
      return index >= nextBreakIndex && brk.startAfterMinutes > currentTimeMinutes;
    });

    if (nextBreak) {
      const timeUntilBreak = nextBreak.startAfterMinutes - currentTimeMinutes;
      return {
        break: nextBreak,
        timeUntil: timeUntilBreak,
        breakNumber: selectedSession.breaks.indexOf(nextBreak) + 1
      };
    }

    return null;
  };

  const nextBreakInfo = getNextBreakInfo();

  // Determine button appearance and functionality
  const getButtonProps = () => {
    if (!isActive) {
      return {
        icon: <Play className="w-6 h-6 ml-0.5" />,
        bgClass: "bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700",
        disabled: !selectedSession,
        title: "Start Timer"
      };
    } else if (isPaused) {
      return {
        icon: <Play className="w-6 h-6 ml-0.5" />,
        bgClass: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700",
        disabled: false,
        title: "Resume Timer"
      };
    } else {
      return {
        icon: <Square className="w-6 h-6" />,
        bgClass: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
        disabled: false,
        title: "Stop Timer"
      };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/30 overflow-hidden">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 border-b border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{sessionTitle}</h3>
            <p className="text-sm text-gray-400">
              {isOnBreak ? 'Break Time!' : isActive && !isPaused ? 'Session Active' : 'Ready to Start'}
            </p>
          </div>
          
          {/* Popout button */}
          <button
            onClick={handlePopout}
            title="Pop out timer window"
            className="p-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/30 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Break Status Banner */}
        {isOnBreak && (
          <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Break Time!</span>
              <span className="text-green-200 text-sm">
                Break {(currentBreakIndex || 0) + 1} in progress
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Timer Display Section */}
      <div className="p-8">
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <RingTimerDisplay
            sessionTitle={sessionTitle}
            time={formatTime(time)}
            status={isActive && !isPaused ? 'Recording' : 'Stopped'}
            isActive={isActive}
            isPaused={isPaused}
            size={320}
            progress={calculateProgress()}
          />
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={handleStartStop}
            disabled={buttonProps.disabled}
            title={buttonProps.title}
            className={`flex items-center justify-center w-14 h-14 ${buttonProps.bgClass} text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {buttonProps.icon}
          </button>
          <button
            onClick={reset}
            disabled={time === 0}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        {/* Session Information */}
        {selectedSession && (
          <div className="space-y-4">
            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-gray-300">Duration</span>
                </div>
                <p className="text-lg font-bold text-white">{selectedSession.duration_minutes} min</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Coffee className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">Breaks</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {selectedSession.breaks?.length || 0}
                </p>
              </div>
            </div>

            {/* Next Break Information */}
            {nextBreakInfo && !isOnBreak && (
              <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Coffee className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Next Break</span>
                    </div>
                    <p className="text-white font-semibold">
                      Break {nextBreakInfo.breakNumber} in {nextBreakInfo.timeUntil} minutes
                    </p>
                    <p className="text-sm text-purple-200">
                      Duration: {nextBreakInfo.break.durationMinutes} minutes
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-300 font-bold text-lg">
                        {nextBreakInfo.breakNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Breaks Overview */}
            {selectedSession.breaks && selectedSession.breaks.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Coffee className="w-4 h-4 mr-2 text-gray-400" />
                  Break Schedule
                </h4>
                <div className="space-y-2">
                  {selectedSession.breaks.map((brk, idx) => {
                    const isCurrentBreak = isOnBreak && currentBreakIndex === idx;
                    const isPastBreak = Math.floor(time / 60) > brk.startAfterMinutes + brk.durationMinutes;
                    const isUpcoming = Math.floor(time / 60) < brk.startAfterMinutes;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                          isCurrentBreak
                            ? 'bg-green-500/20 border-green-500/30 text-green-300'
                            : isPastBreak
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-400'
                            : isUpcoming
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                            : 'bg-gray-700/20 border-gray-600/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCurrentBreak
                              ? 'bg-green-500 text-white'
                              : isPastBreak
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-purple-500/30 text-purple-300'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">
                              Break {idx + 1}
                              {isCurrentBreak && <span className="ml-2 text-xs">(Active)</span>}
                              {isPastBreak && <span className="ml-2 text-xs">(Completed)</span>}
                            </p>
                            <p className="text-xs opacity-75">
                              After {brk.startAfterMinutes} min • {brk.durationMinutes} min duration
                            </p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          isCurrentBreak
                            ? 'bg-green-400 animate-pulse'
                            : isPastBreak
                            ? 'bg-gray-500'
                            : 'bg-purple-400'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}