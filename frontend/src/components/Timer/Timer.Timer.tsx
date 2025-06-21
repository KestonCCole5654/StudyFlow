import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

interface TimerProps {
  sessionTitle?: string;
  onComplete?: (duration: number) => void;
  onTimerStart?: () => void; // New prop for starting focus mode
}

export function Timer({ sessionTitle = 'Study Session', onComplete, onTimerStart }: TimerProps) {
  const { time, isActive, isPaused, start, pause, resume, stop, reset, formatTime, selectedSession } = useTimer();

  const handleStart = () => {
    start();
    if (onTimerStart) {
      onTimerStart();
    }
  };

  const handleStop = () => {
    stop();
    if (onComplete && time > 0) {
      onComplete(time);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{sessionTitle}</h3>
        
        <div className="mb-8">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(time)}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isActive && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">
              {isActive && !isPaused ? 'Recording' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          {!isActive ? (
            <button
              onClick={handleStart}
              disabled={!selectedSession}
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-full hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-6 h-6 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={isPaused ? resume : pause}
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-full hover:from-accent-600 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isPaused ? <Play className="w-6 h-6 ml-0.5" /> : <Pause className="w-6 h-6" />}
            </button>
          )}
          
          <button
            onClick={handleStop}
            disabled={!isActive && time === 0}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-6 h-6" />
          </button>
          
          <button
            onClick={reset}
            disabled={time === 0}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
} 