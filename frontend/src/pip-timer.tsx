import React from 'react';
import { createRoot } from 'react-dom/client';
import { TimerProvider } from './context/TimerContext';
import { MinimalTimer } from './components/Timer/pip-timer';
import './index.css';

const App = () => (
  <div style={{ width: '100vw', height: '100vh', background: '#181c28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <TimerProvider>
      <MinimalTimer />
    </TimerProvider>
  </div>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />); 