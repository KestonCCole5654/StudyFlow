import React from 'react';
import { BlobsAnimatedBackground } from './BlobsAnimatedBackground';

interface RingTimerDisplayProps {
  sessionTitle?: string;
  time: string;
  status: 'Recording' | 'Stopped';
  isActive: boolean;
  isPaused: boolean;
  size?: number; // px
  progress?: number; // 0 to 1
}

export const RingTimerDisplay: React.FC<RingTimerDisplayProps> = ({
  sessionTitle = 'Study Session',
  time,
  status,
  isActive,
  isPaused,
  size = 320,
  progress = 0,
}) => {
  // Calculate the circle's properties
  const strokeWidth = size * 0.02; // 2% of size
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Parse time string to get individual components
  const timeParts = time.split(':');
  const hours = timeParts[0] || '0';
  const minutes = timeParts[1] || '00';
  const seconds = timeParts[2] || '00';

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width: size, height: size, position: 'relative' }}
    >
      {/* SVG Progress Ring */}
      <svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          transform: 'rotate(-90deg)',
          filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))',
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(99, 102, 241)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>

      {/* Animated ring background */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <BlobsAnimatedBackground className="halo" />
      </div>

      {/* Timer content */}
      <div
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ position: 'relative', zIndex: 2 }}
      >
        {/* Time Display with Labels */}
        <div
          className="flex items-baseline justify-center font-mono font-bold text-white drop-shadow-lg"
          style={{
            fontSize: size * 0.12,
            marginBottom: size * 0.05,
            textShadow: '0 2px 8px #0008',
            lineHeight: 1.05,
            textAlign: 'center',
            gap: size * 0.02,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div>{hours}</div>
            <div style={{ fontSize: size * 0.04, color: '#9ca3af', marginTop: size * 0.01 }}>hours</div>
          </div>
          <div style={{ marginBottom: size * 0.03 }}>:</div>
          <div style={{ textAlign: 'center' }}>
            <div>{minutes}</div>
            <div style={{ fontSize: size * 0.04, color: '#9ca3af', marginTop: size * 0.01 }}>minutes</div>
          </div>
          <div style={{ marginBottom: size * 0.03 }}>:</div>
          <div style={{ textAlign: 'center' }}>
            <div>{seconds}</div>
            <div style={{ fontSize: size * 0.04, color: '#9ca3af', marginTop: size * 0.01 }}>seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};