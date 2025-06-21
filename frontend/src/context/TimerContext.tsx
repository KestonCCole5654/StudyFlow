import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { StudySession } from '../types/database';

interface TimerContextType {
  time: number;
  isActive: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  currentBreakIndex: number | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  formatTime: (totalSeconds: number) => string;
  selectedSession: StudySession | null;
  setSelectedSessionContext: (session: StudySession | null) => void;
  clearTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TIMER_BROADCAST_CHANNEL = 'timer-sync';
const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel(TIMER_BROADCAST_CHANNEL) : null;

// Generate a unique window ID for leader election
const WINDOW_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const timerRef = useRef<number | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentBreakIndex, setCurrentBreakIndex] = useState<number | null>(null);
  const breakEndTimeRef = useRef<number | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);
  const isSyncingRef = useRef(false); // Prevent sync loops
  const [leader, setLeader] = useState<string | null>(null);
  const leaderPingTimeout = useRef<number | null>(null);

  // --- Event-based Broadcast ---
  const broadcastEvent = (event: any) => {
    if (bc) {
      bc.postMessage({ ...event, _windowId: WINDOW_ID });
    }
  };

  // --- Handle incoming events ---
  useEffect(() => {
    if (!bc) return;
    const handler = (event: MessageEvent) => {
      const { _windowId, type, payload } = event.data || {};
      if (_windowId === WINDOW_ID) return; // Ignore self
      switch (type) {
        case 'request_state':
          // Only respond if this window is the leader or has the latest state
          if (isActive || isPaused || time > 0) {
            broadcastEvent({ type: 'sync_state', payload: { time, isActive, isPaused, isOnBreak, currentBreakIndex, selectedSession, leader: leader || WINDOW_ID } });
          }
          break;
        case 'sync_state':
          isSyncingRef.current = true;
          setTime(payload.time);
          setIsActive(payload.isActive);
          setIsPaused(payload.isPaused);
          setIsOnBreak(payload.isOnBreak);
          setCurrentBreakIndex(payload.currentBreakIndex);
          setSelectedSession(payload.selectedSession);
          setLeader(payload.leader);
          setTimeout(() => { isSyncingRef.current = false; }, 10);
          break;
        case 'start':
          setIsActive(true); setIsPaused(false); setLeader(_windowId);
          break;
        case 'pause':
          setIsPaused(true); setLeader(_windowId);
          break;
        case 'resume':
          setIsPaused(false); setLeader(_windowId);
          break;
        case 'stop':
          setIsActive(false); setIsPaused(false); setLeader(_windowId);
          break;
        case 'reset':
          setIsActive(false); setIsPaused(false); setTime(0); setLeader(_windowId);
          break;
        case 'set_time':
          // Only accept time updates from the current leader to prevent race conditions
          if (_windowId === leader) {
            setTime(payload);
          }
          break;
        case 'set_session':
          setSelectedSession(payload); setLeader(_windowId);
          break;
        case 'ping':
          // If we receive a ping, we know who the leader is. Reset our timeout.
          if (_windowId !== leader) {
            setLeader(_windowId);
          }
          if (leaderPingTimeout.current) {
            window.clearTimeout(leaderPingTimeout.current);
          }
          // Set a timeout to check if the leader is still alive.
          // If we don't get another ping within 2.5s, we'll try to become the leader.
          leaderPingTimeout.current = window.setTimeout(() => {
            if (isActive) { // Only try to take over if the timer is supposed to be running
              setLeader(WINDOW_ID);
            }
          }, 2500);
          break;
        default:
          break;
      }
    };
    bc.addEventListener('message', handler);
    return () => bc.removeEventListener('message', handler);
  }, [isActive, isPaused, time, isOnBreak, currentBreakIndex, selectedSession, leader]);

  // --- On mount, request state from other windows ---
  useEffect(() => {
    if (bc) {
      broadcastEvent({ type: 'request_state' });
    }
    // eslint-disable-next-line
  }, []);

  // --- Only the leader runs the timer interval ---
  useEffect(() => {
    if (leader !== WINDOW_ID) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Leader sends a ping every second to show it's alive
    const pingInterval = window.setInterval(() => {
      broadcastEvent({ type: 'ping' });
    }, 1000);

    if (!selectedSession || !selectedSession.breaks || selectedSession.breaks.length === 0) {
      if (isActive && !isPaused) {
        timerRef.current = window.setInterval(() => {
          setTime(prevTime => {
            broadcastEvent({ type: 'set_time', payload: prevTime + 1 });
            return prevTime + 1;
          });
        }, 1000);
      } else if (!isActive || isPaused) {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      return () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        window.clearInterval(pingInterval);
      };
    }
    if (isActive && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setTime(prevTime => {
          let nextTime = prevTime + 1;
          if (isOnBreak && breakEndTimeRef.current !== null) {
            if (nextTime >= breakEndTimeRef.current) {
              setIsOnBreak(false);
              setCurrentBreakIndex((idx) => (idx !== null ? idx + 1 : null));
              playBeep();
            }
          }
          if (!isOnBreak && selectedSession.breaks) {
            const nextBreakIdx = (currentBreakIndex ?? 0);
            const nextBreak = selectedSession.breaks[nextBreakIdx];
            if (nextBreak && nextTime === nextBreak.startAfterMinutes * 60) {
              setIsOnBreak(true);
              breakEndTimeRef.current = (nextBreak.startAfterMinutes + nextBreak.durationMinutes) * 60;
              playBeep();
            }
          }
          broadcastEvent({ type: 'set_time', payload: nextTime });
          return nextTime;
        });
      }, 1000);
    } else if (!isActive || isPaused) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      window.clearInterval(pingInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPaused, selectedSession, isOnBreak, currentBreakIndex, leader]);

  // --- Timer actions now broadcast events ---
  const start = useCallback(() => {
    broadcastEvent({ type: 'start' });
    setIsActive(true);
    setIsPaused(false);
    setLeader(WINDOW_ID);
  }, []);

  const pause = useCallback(() => {
    broadcastEvent({ type: 'pause' });
    setIsPaused(true);
    setLeader(WINDOW_ID);
  }, []);

  const resume = useCallback(() => {
    broadcastEvent({ type: 'resume' });
    setIsPaused(false);
    setLeader(WINDOW_ID);
  }, []);

  const stop = useCallback(() => {
    broadcastEvent({ type: 'stop' });
    setIsActive(false);
    setIsPaused(false);
    setLeader(WINDOW_ID);
  }, []);

  const clearTimer = useCallback(() => {
    setTime(0);
  }, []);

  const reset = useCallback(() => {
    broadcastEvent({ type: 'reset' });
    setIsActive(false);
    setIsPaused(false);
    setTime(0);
    setLeader(WINDOW_ID);
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const playBeep = () => {
    if (!breakAudioRef.current) {
      breakAudioRef.current = new window.Audio('/publics/beep.mp3');
    }
    breakAudioRef.current.currentTime = 0;
    breakAudioRef.current.play();
  };

  useEffect(() => {
    setIsOnBreak(false);
    setCurrentBreakIndex(0);
    breakEndTimeRef.current = null;
  }, [selectedSession, isActive]);

  const setSelectedSessionContext = useCallback((session: StudySession | null) => {
    broadcastEvent({ type: 'set_session', payload: session });
    setSelectedSession(session);
    if (session === null) {
      clearTimer();
    }
    setLeader(WINDOW_ID);
  }, [clearTimer]);

  const value = {
    time,
    isActive,
    isPaused,
    isOnBreak,
    currentBreakIndex,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime,
    selectedSession,
    setSelectedSessionContext,
    clearTimer,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}; 