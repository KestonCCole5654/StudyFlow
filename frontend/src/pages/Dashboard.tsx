import { Plus } from 'lucide-react';
import { useSessions } from '../hooks/useSessions';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { RecentSessions } from '../components/Dashboard/RecentSessions';

interface DashboardProps {
  onCreateSession: () => void;
}

export function Dashboard({ onCreateSession }: DashboardProps) {
  const { sessions, loading, error, toggleSessionCompletion } = useSessions();

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

  return (
    <div className="space-y-6 lg:space-y-8 bg-gray-950 min-h-screen pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back!</h1>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">
            Let's continue your study journey. You have {sessions.filter(s => !s.completed).length} pending sessions.
          </p>
        </div>
        <button
          onClick={onCreateSession}
          className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Create Session
        </button>
      </div>

      <DashboardStats sessions={sessions} />

      <div className="grid grid-cols-1 gap-6 lg:gap-8">
        <RecentSessions 
          sessions={sessions} 
          onSessionUpdate={toggleSessionCompletion} 
        />
      </div>
    </div>
  );
}