import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  plan: 'free' | 'paid';
  songsToday: number;
  isAdmin: boolean;
}

interface Song {
  id: string;
  title: string;
  lyrics: string;
  audioUrl?: string;
  mood?: string;
  genre?: string;
  createdAt: string;
  tags?: string;
  prompt?: string;
  status?: string;
  taskId?: string;
}

interface AppContextType {
  user: User | null;
  songs: Song[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addSong: (song: Omit<Song, 'createdAt'>) => void;
  canGenerateSong: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin: !!session.user.user_metadata?.is_admin
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin: !!session.user.user_metadata?.is_admin
        });
      } else {
        setSupabaseUser(null);
        setUser(null);
        setSongs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;
      if (data.user) {
        setSupabaseUser(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin: !!data.user.user_metadata?.is_admin
        });
        return true;
      }
      return false;
    } catch { return false; }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return false;
      if (data.user) {
        setSupabaseUser(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin: !!data.user.user_metadata?.is_admin
        });
        return true;
      }
      return false;
    } catch { return false; }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setUser(null);
      setSongs([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addSong = (songData: Omit<Song, 'createdAt'>) => {
    const newSong: Song = { ...songData, createdAt: new Date().toISOString() };
    setSongs(prev => {
      const existing = prev.find(s => s.id === newSong.id || s.taskId === newSong.taskId);
      if (existing) {
        return prev.map(s => s.id === newSong.id || s.taskId === newSong.taskId ? newSong : s);
      }
      return [newSong, ...prev];
    });
    if (user && !songs.find(s => s.taskId === newSong.taskId)) {
      setUser(prev => prev ? { ...prev, songsToday: prev.songsToday + 1 } : null);
    }
  };

  const canGenerateSong = () => {
    if (!user) return false;
    return user.plan === 'paid' || user.songsToday < 3;
  };

  return (
    <AppContext.Provider value={{
      user, songs, isAuthenticated: !!supabaseUser, login, register, logout, addSong, canGenerateSong
    }}>
      {children}
    </AppContext.Provider>
  );
};