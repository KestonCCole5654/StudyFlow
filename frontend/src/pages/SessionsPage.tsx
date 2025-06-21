import React, { useState } from 'react';
import { Plus, Filter, Search, ChevronDown } from 'lucide-react';
import { useSessions } from '../hooks/useSessions';
import { SessionForm } from '../components/Sessions/SessionForm';
import { SessionList } from '../components/Sessions/SessionList';
import { StudySession } from '../types/database';

export function SessionsPage() {
  const { sessions, loading, error, toggleSessionCompletion, deleteSession } = useSessions();
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCompleted === 'all' ||
                         (filterCompleted === 'completed' && session.completed) ||
                         (filterCompleted === 'pending' && !session.completed);
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateSession = () => {
    setEditingSession(null);
    setShowForm(true);
  };

  const handleEditSession = (session: StudySession) => {
    console.log('Editing session:', session);
    setEditingSession(session);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Study Sessions</h1>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">
            Manage your study sessions and track your progress
          </p>
        </div>
        <button
          onClick={handleCreateSession}
          className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          New Session
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/40">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-900 text-white placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <div className="relative">
              <select
                value={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.value as 'all' | 'pending' | 'completed')}
                className="appearance-none pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 rounded-lg border border-primary-500/60 bg-gray-900/80 text-white shadow-[0_0_8px_rgba(167,139,250,0.2)] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm sm:text-base"
              >
                <option value="all">All Sessions</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/40">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-primary-400">{sessions.length}</div>
            <div className="text-gray-300 text-xs sm:text-base">Total Sessions</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/40">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-secondary-400">
              {sessions.filter(s => s.completed).length}
            </div>
            <div className="text-gray-300 text-xs sm:text-base">Completed</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/40">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-accent-400">
              {sessions.filter(s => !s.completed).length}
            </div>
            <div className="text-gray-300 text-xs sm:text-base">Pending</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {filterCompleted === 'all' ? 'All Sessions' : 
             filterCompleted === 'completed' ? 'Completed Sessions' : 'Pending Sessions'}
          </h2>
          <span className="text-xs sm:text-sm text-gray-300">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <SessionList
          sessions={filteredSessions}
          onToggleComplete={toggleSessionCompletion}
          onEdit={handleEditSession}
          onDelete={handleDeleteSession}
        />
      </div>

      {/* Session Form Modal */}
      <SessionForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSessionCreated={handleFormClose}
        editingSession={editingSession}
      />
    </div>
  );
}