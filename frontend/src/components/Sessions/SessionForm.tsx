import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, FileText, X } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions';
import { StudySession } from '../../types/database';

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: () => void;
  selectedDate?: Date;
  editingSession?: StudySession | null;
}

export function SessionForm({ 
  isOpen, 
  onClose, 
  onSessionCreated, 
  selectedDate,
  editingSession 
}: SessionFormProps) {
  const { createSession, updateSession } = useSessions();
  const [formData, setFormData] = useState<{
    title: string;
    subject: string;
    notes: string;
    date: string;
    duration_minutes: number | ''; // Allow empty string for input
  }>({
    title: '',
    subject: '',
    notes: '',
    date: selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    duration_minutes: '', // Changed initial value to empty string to show placeholder
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breaks, setBreaks] = useState<{ startAfterMinutes: number; durationMinutes: number }[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (editingSession) {
      setFormData({
        title: editingSession.title,
        subject: editingSession.subject,
        notes: editingSession.notes || '',
        date: new Date(editingSession.created_at).toISOString().split('T')[0],
        duration_minutes: editingSession.duration_minutes,
      });
    } else {
      setFormData({
        title: '',
        subject: '',
        notes: '',
        date: selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        duration_minutes: '', // Changed initial value to empty string to show placeholder
      });
    }
  }, [editingSession, selectedDate]);

  // Populate breaks when editing
  useEffect(() => {
    if (editingSession && editingSession.breaks) {
      setBreaks(editingSession.breaks);
    } else {
      setBreaks([]);
    }
  }, [editingSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parsedDuration = typeof formData.duration_minutes === 'string' 
      ? parseInt(formData.duration_minutes) || 0 
      : formData.duration_minutes;

    try {
      let savedSession;
      if (editingSession) {
        savedSession = await updateSession(editingSession.id, {
          title: formData.title,
          subject: formData.subject,
          notes: formData.notes || null,
          created_at: new Date(formData.date + 'T00:00:00Z').toISOString(),
          duration_minutes: parsedDuration,
          breaks, // Save breaks to backend
        });
      } else {
        savedSession = await createSession({
          title: formData.title,
          subject: formData.subject,
          notes: formData.notes,
          created_at: new Date(formData.date + 'T00:00:00Z').toISOString(),
          duration_minutes: parsedDuration,
          breaks, // Save breaks to backend
        });
      }
      // No need to attach breaks in frontend only

      setFormData({
        title: '',
        subject: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        duration_minutes: '', // Changed initial value to empty string to show placeholder
      });
      onSessionCreated();
      onClose();
    } catch (err) {
      console.error('Error saving session:', err);
      setError(err instanceof Error ? err.message : 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  // Handler to add a new break
  const handleAddBreak = () => {
    setBreaks([...breaks, { startAfterMinutes: 0, durationMinutes: 5 }]);
  };

  // Handler to update a break
  const handleBreakChange = (index: number, field: 'startAfterMinutes' | 'durationMinutes', value: number) => {
    setBreaks(breaks.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  // Handler to remove a break
  const handleRemoveBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingSession ? 'Edit Study Session' : 'Create Study Session'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              Session Title *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900"
                placeholder="e.g., Review Chapter 5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900"
              placeholder="e.g., Mathematics"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="duration_minutes" className="block text-md font-medium text-gray-700">Duration (min) *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="number"
                  id="duration_minutes"
                  name="duration_minutes"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900"
                  placeholder="60"
                  value={formData.duration_minutes === '' ? '' : formData.duration_minutes}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      duration_minutes: value === '' ? '' : parseInt(value) || 0,
                    });
                  }}
                  min="0"
                  required
                  max="480"
                  step="1"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">Study Breaks</label>
            {/* Show live example or warning under the title */}
            {(() => {
              const duration = typeof formData.duration_minutes === 'string' ? parseInt(formData.duration_minutes) || 0 : formData.duration_minutes;
              const invalidBreak = breaks.find(brk => brk.startAfterMinutes > duration);
              if (invalidBreak) {
                return (
                  <span className="text-sm text-red-500 mb-4 block">Breaks must be scheduled within the study duration.</span>
                );
              }
              const validBreak = breaks.find(brk => brk.startAfterMinutes > 0 && brk.durationMinutes > 0 && brk.startAfterMinutes <= duration);
              if (validBreak) {
                return (
                  <span className="text-sm text-primary-500 mb-4 block">This break will occur after your first {validBreak.startAfterMinutes} minutes of study.</span>
                );
              }
              return null;
            })()}
            <div className="space-y-2">
              {breaks.map((brk, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 w-full">
                  <div className="flex flex-col flex-1 w-full">
                    <label className="text-sm font-bold text-gray-700 mb-3">After X (mins)</label>
                    <input
                      id={`break-start-${idx}`}
                      type="number"
                      min={''}
                      max={formData.duration_minutes || 480}
                      value={brk.startAfterMinutes === 0 ? '' : brk.startAfterMinutes}
                      onChange={e => handleBreakChange(idx, 'startAfterMinutes', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                      placeholder="Minutes"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-bold text-gray-700 mb-3">Break for X (mins)</label>
                    <input
                      id={`break-duration-${idx}`}
                      type="number"
                      min={''}
                      max={60}
                      value={brk.durationMinutes === 0 ? '' : brk.durationMinutes}
                      onChange={e => handleBreakChange(idx, 'durationMinutes', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                      placeholder="Minutes"
                    />
                  </div>
                  <button type="button" onClick={() => handleRemoveBreak(idx)} className="text-red-500 hover:underline ml-2 sm:self-end">Remove</button>
                </div>
              ))}
              <button type="button" onClick={handleAddBreak} className="mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200">+ Add Break</button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Breaks will automatically pause your study timer at the scheduled time.</p>
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none text-gray-900"
                rows={3}
                placeholder="Additional notes or objectives..."
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingSession ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}