import { format, parseISO } from 'date-fns';
import { Clock, CheckCircle, Circle, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { StudySession } from '../../types/database';

interface RecentSessionsProps {
  sessions: StudySession[];
  onSessionUpdate: (sessionId: string) => void;
}

export function RecentSessions({ sessions, onSessionUpdate }: RecentSessionsProps) {
  const recentSessions = sessions
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const handleToggleCompletion = async (sessionId: string) => {
    try {
      await onSessionUpdate(sessionId);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-xl font-bold text-white">Recent Sessions</h3>
            <p className="text-sm text-gray-400">Your latest study activities</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-700/50 px-3 py-1 rounded-full">
          {sessions.length} total
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {recentSessions.map((session, index) => {
          const dbDate = parseISO(session.date || session.created_at);
          const localDate = new Date(dbDate.getUTCFullYear(), dbDate.getUTCMonth(), dbDate.getUTCDate());
          
          return (
            <div
              key={session.id}
              className={`bg-gray-900 border border-gray-700/40 rounded-xl overflow-hidden transition-all duration-300 ${session.completed ? 'opacity-60' : 'hover:border-primary-500/50 hover:shadow-lg'}`}
            >
              {/* Top color bar */}
              <div
                className={`h-2 ${session.completed ? 'bg-green-600' : 'bg-primary-500'}`}
              />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleCompletion(session.id)}
                      className="mt-1 focus:outline-none flex-shrink-0"
                    >
                      {session.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-600 hover:text-primary-400 transition-colors" />
                      )}
                    </button>

                    {/* Session Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between space-y-1 sm:space-y-0">
                        <h4 className={`text-lg font-semibold truncate ${session.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {session.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 flex-shrink-0">
                          <Calendar className="w-4 h-4" />
                          <span>{format(localDate, 'MMM d')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-400 mt-2">
                        <span className="truncate">{session.subject}</span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {session.duration_minutes} min
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded-lg mt-4 line-clamp-2">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No study sessions yet</h4>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              Create your first session to start tracking your study progress and build productive habits.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Track Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Organize Studies</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {sessions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="text-gray-400">
                <span className="font-semibold text-white">{sessions.filter(s => s.completed).length}</span> completed
              </div>
              <div className="text-gray-400">
                <span className="font-semibold text-white">{sessions.filter(s => !s.completed).length}</span> pending
              </div>
            </div>
            <div className="text-gray-400">
              Total: <span className="font-semibold text-white">
                {sessions.reduce((total, s) => total + s.duration_minutes, 0)} min
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}