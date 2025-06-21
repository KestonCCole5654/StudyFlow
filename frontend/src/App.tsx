import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './pages/Dashboard';
import { CalendarPage } from './pages/CalendarPage';
import { TimerPage } from './pages/TimerPage';
import { SessionsPage } from './pages/SessionsPage';
import { QuizHubPage } from './pages/QuizHubPage';
import { SessionForm } from './components/Sessions/SessionForm';
import { SettingsPage } from './pages/SettingsPage';
import { SessionExpiredModal } from './components/Auth/SessionExpiredModal';
import { Sidebar } from './components/Layout/Sidebar';
import { TimerProvider } from './context/TimerContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { MinimalTimer } from './components/Timer/pip-timer';

function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionFormDate, setSessionFormDate] = useState<Date | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);
  const [calendarShowModal, setCalendarShowModal] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const handleCreateSession = (date?: Date) => {
    setSessionFormDate(date);
    setShowSessionForm(true);
  };

  const handleSessionCreated = () => {
    setShowSessionForm(false);
    if (sessionFormDate) {
      setCalendarSelectedDate(sessionFormDate);
      setCalendarShowModal(true);
    }
  };

  const handleCalendarModalClose = () => {
    setCalendarShowModal(false);
    setCalendarSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <TimerProvider>
        <SessionExpiredModal />

        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthForm mode="signin" onModeChange={setAuthMode} />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <AuthForm mode="signup" onModeChange={setAuthMode} />} />
          <Route path="/pip-timer" element={
            <div style={{ width: '100vw', height: '100vh', background: '#181c28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MinimalTimer  />
            </div>
          } />

          <Route
            path="/*"
            element={
              user ? (
                <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row">
                  <Sidebar
                    currentView={window.location.pathname.substring(1)}
                    onCreateSession={handleCreateSession}
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                  />
                  
                  <div className="flex-1 pt-16 lg:pt-0">
                    <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 lg:ml-0 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-56'} transition-all duration-300`}>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard onCreateSession={handleCreateSession} />} />
                        <Route path="sessions" element={<SessionsPage />} />
                        <Route path="calendar" element={
                          <CalendarPage 
                            onCreateSession={handleCreateSession} 
                            calendarSelectedDate={calendarSelectedDate}
                            calendarShowModal={calendarShowModal}
                            onCalendarModalClose={handleCalendarModalClose}
                          />
                        } />
                        <Route path="timer" element={<TimerPage />} />
                        <Route path="quiz-hub" element={<QuizHubPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

        <SessionForm
          isOpen={showSessionForm}
          onClose={() => {
            setShowSessionForm(false);
            setSessionFormDate(undefined);
          }}
          onSessionCreated={handleSessionCreated}
          selectedDate={sessionFormDate}
        />

      </TimerProvider>
    </Router>
  );
}

export default App;