import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setShowSessionExpired(false);
      } catch (err) {
        console.error('Error getting session:', err);
        setError(err instanceof Error ? err.message : 'Failed to get session');
        setShowSessionExpired(true);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setShowSessionExpired(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setShowSessionExpired(true);
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setShowSessionExpired(false);
        }
        setLoading(false);
      }
    );

    // Set up automatic token refresh
    const refreshInterval = setInterval(async () => {
      if (session) {
        try {
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          setSession(refreshedSession);
          setUser(refreshedSession?.user ?? null);
        } catch (err) {
          console.error('Error refreshing session:', err);
          setShowSessionExpired(true);
        }
      }
    }, 1000 * 60 * 30); // Refresh every 30 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [session]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setShowSessionExpired(false);
      return { error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      return { error: err instanceof Error ? err : new Error('Failed to sign in') };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setShowSessionExpired(false);
      return { error: null };
    } catch (err) {
      console.error('Error signing up:', err);
      return { error: err instanceof Error ? err : new Error('Failed to sign up') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setShowSessionExpired(false);
      return { error: null };
    } catch (err) {
      console.error('Error signing out:', err);
      return { error: err instanceof Error ? err : new Error('Failed to sign out') };
    }
  };

  const updateEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating email:', err);
      throw err;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating password:', err);
      throw err;
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateEmail,
    updatePassword,
    error,
    setError,
    setLoading,
    showSessionExpired,
    setShowSessionExpired,
  };
}