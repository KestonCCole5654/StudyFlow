import { format, parseISO } from 'date-fns';
import { Clock, CheckCircle, Circle, Edit, Trash2, Calendar as CalendarIcon, BookOpen, FileText, Target, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { StudySession } from '../../types/database';
import { useState } from 'react';

interface SessionListProps {
  sessions: StudySession[];
  onToggleComplete: (sessionId: string) => void;
  onEdit?: (session: StudySession) => void;
  onDelete?: (sessionId: string) => void;
  showActions?: boolean;
}

export function SessionList({
  sessions,
  onToggleComplete,
  onEdit,
  onDelete,
  showActions = true
}: SessionListProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const toggleExpanded = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="w-20 h-20 bg-gray-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CalendarIcon className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">No Study Sessions Yet</h3>
        <p className="text-base sm:text-lg text-gray-400 max-w-md mx-auto leading-relaxed">
          Create your first session to start tracking your study progress and build productive habits.
        </p>
        <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Track Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Organize Studies</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {sessions.map((session) => {
        const dbDate = parseISO(session.date || session.created_at);
        const localDate = new Date(dbDate.getUTCFullYear(), dbDate.getUTCMonth(), dbDate.getUTCDate());
        const createdDate = parseISO(session.created_at);
        const isExpanded = expandedSessions.has(session.id);
        
        return (
          <div
            key={session.id}
            className={`bg-gray-900 border border-gray-700/40 rounded-xl overflow-hidden transition-all duration-300 ${
              session.completed 
                ? 'opacity-75 hover:opacity-90' 
                : 'hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10'
            }`}
          >
            {/* Top color bar */}
            <div className={`h-2 ${session.completed ? 'bg-green-600' : 'bg-primary-500'}`} />
            
            <div className="p-4 sm:p-5">
              {/* Main Header - Always Visible */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Status Checkbox */}
                  <button
                    onClick={() => onToggleComplete(session.id)}
                    className="focus:outline-none flex-shrink-0 group"
                  >
                    {session.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 group-hover:text-green-400 transition-colors" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-600 group-hover:text-primary-400 transition-colors" />
                    )}
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg sm:text-xl font-bold ${
                          session.completed ? 'text-gray-500 line-through' : 'text-white'
                        } truncate`}>
                          {session.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{session.subject}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{format(localDate, 'MMM d')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleExpanded(session.id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-2"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {showActions && (
                  <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(session)}
                        className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-900/30 rounded-lg transition-all duration-200"
                        title="Edit Session"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(session.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-700/30 space-y-4 animate-slide-down">
                  {/* Session Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 font-medium">Duration:</span>
                      <span className="text-white ml-2">{session.duration_minutes} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Scheduled:</span>
                      <span className="text-white ml-2">{format(localDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        session.completed 
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-primary-900/30 text-primary-400'
                      }`}>
                        {session.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Created:</span>
                      <span className="text-white ml-2">{format(createdDate, 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>

                  {/* Breaks Information */}
                  {session.breaks && session.breaks.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 font-medium">Planned Breaks ({session.breaks.length}):</span>
                      </div>
                      <div className="space-y-1 ml-6">
                        {session.breaks.map((brk, idx) => (
                          <div key={idx} className="text-sm text-gray-300">
                            <span className="text-purple-400 font-medium">Break {idx + 1}:</span>
                            <span className="ml-2">
                              Start after {brk.startAfterMinutes} minutes, duration {brk.durationMinutes} minutes
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 font-medium">Notes:</span>
                      </div>
                      <div className="ml-6 text-sm text-gray-300 leading-relaxed">
                        {session.notes}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 font-medium text-sm">Progress:</span>
                      <span className="text-xs text-gray-400">
                        {session.completed ? '100%' : '0%'} complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          session.completed ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                        style={{ width: session.completed ? '100%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Session ID */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-700/30">
                    Session ID: {session.id.slice(-12)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}