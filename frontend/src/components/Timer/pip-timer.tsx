import { createRoot } from 'react-dom/client';
import { TimerProvider, useTimer } from '../../context/TimerContext';
import { Pause, Play, RotateCcw } from 'lucide-react';

export const MinimalTimer = () => {
  const { time, isActive, isPaused, isOnBreak, start, pause, resume, reset, formatTime } = useTimer();

  // Determine which icon and action for the left button
  const handleLeftButton = () => {
    if (!isActive) {
      start();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };
  const leftIcon = !isActive ? <Play size={24} /> : isPaused ? <Play size={24} /> : <Pause size={24} />;
  const leftAria = !isActive ? 'Start' : isPaused ? 'Resume' : 'Pause';

  // Set background color based on break state
  const background = isOnBreak ? '#bbf7d0' : '#181c28'; // light green for break
  const textColor = isOnBreak ? '#181c28' : '#fff';

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (
    <div style={{ width: 200, background, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto', padding: 24 }}>
      {isOnBreak && (
        <div style={{ color: '#059669', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Break Time!</div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', fontFamily: 'monospace', fontWeight: 700, fontSize: 28, color: textColor, marginBottom: 24, letterSpacing: 2, textAlign: 'center' }}>
        <div style={{textAlign: 'center'}}>
          <div>{String(hours).padStart(2, '0')}</div>
          <div style={{fontSize: '10px', color: '#888', marginTop: '2px'}}>hours</div>
        </div>
        <div>:</div>
        <div style={{textAlign: 'center'}}>
          <div>{String(minutes).padStart(2, '0')}</div>
          <div style={{fontSize: '10px', color: '#888', marginTop: '2px'}}>minutes</div>
        </div>
        <div>:</div>
        <div style={{textAlign: 'center'}}>
          <div>{String(seconds).padStart(2, '0')}</div>
          <div style={{fontSize: '10px', color: '#888', marginTop: '2px'}}>seconds</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 0 }}>
        <button
          onClick={handleLeftButton}
          aria-label={leftAria}
          style={{ width: 44, height: 44, borderRadius: '50%', background: '#d6b4f7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', transition: 'background 0.2s', color: '#181c28', fontSize: 20, opacity: isActive || !isActive ? 1 : 0.7 }}
        >
          {leftIcon}
        </button>
        <button
          onClick={reset}
          aria-label="Reset"
          disabled={time === 0}
          style={{ width: 44, height: 44, borderRadius: '50%', background: '#23242b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: time === 0 ? 'not-allowed' : 'pointer', outline: 'none', color: '#b0b3c6', fontSize: 20, opacity: time === 0 ? 0.5 : 1 }}
        >
          <RotateCcw size={22} />
        </button>
      </div>
    </div>
  );
};

const App = () => (
  <div style={{ width: '100vw', height: '100vh', background: '#181c28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <TimerProvider>
      <MinimalTimer />
    </TimerProvider>
  </div>
);