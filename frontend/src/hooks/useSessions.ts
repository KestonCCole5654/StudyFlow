import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { StudySession } from '../types/database';

export function useSessions() {
  const { user, session } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchSessions = async () => {
    if (!user || !session) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Ensure breaks is always an array
      setSessions((data || []).map(s => ({ 
        ...s, 
        breaks: Array.isArray(s.breaks) ? s.breaks : [] 
      })));
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (err) {
      console.error('Error fetching sessions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      
      // If we get insufficient resources error, retry with exponential backoff
      if (errorMessage.includes('ERR_INSUFFICIENT_RESOURCES') && retryCount < 3) {
        const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, backoffTime);
      }
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: {
    title: string;
    subject: string;
    notes?: string;
    created_at: string;
    duration_minutes: number;
    breaks?: { startAfterMinutes: number; durationMinutes: number }[];
  }) => {
    if (!user || !session) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          title: sessionData.title,
          subject: sessionData.subject,
          notes: sessionData.notes || null,
          date: new Date(sessionData.created_at).toISOString(),
          created_at: new Date(sessionData.created_at).toISOString(),
          duration_minutes: sessionData.duration_minutes,
          completed: false,
          breaks: sessionData.breaks || [], // Save breaks to backend
        })
        .select()
        .single();

      if (error) throw error;
      
      const newSession = { 
        ...data, 
        breaks: Array.isArray(data.breaks) ? data.breaks : [] 
      };
      setSessions(prev => [...prev, newSession]);
      await fetchSessions(); // Refresh sessions after create
      return newSession;
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<StudySession>) => {
    if (!user || !session) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .update({
          ...updates,
          breaks: updates.breaks !== undefined ? updates.breaks : undefined, // Only update if provided
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession = { 
        ...data, 
        breaks: Array.isArray(data.breaks) ? data.breaks : [] 
      };
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? updatedSession : session
        )
      );
      await fetchSessions(); // Refresh sessions after update
      return updatedSession;
    } catch (err) {
      console.error('Error updating session:', err);
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user || !session) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      throw err;
    }
  };

  const toggleSessionCompletion = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    return updateSession(sessionId, { completed: !session.completed });
  };

  // Only fetch sessions when user or retryCount changes
  useEffect(() => {
    fetchSessions();
  }, [user?.id, retryCount]); // Remove session from dependencies

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    toggleSessionCompletion,
  };
}