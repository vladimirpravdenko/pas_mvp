import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
  hasInitialDialogueResponses: boolean;
  refreshInitialDialogueResponses: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addSong: (song: Omit<Song, 'createdAt'>) => void;
  canGenerateSong: () => boolean;
  preferredLanguage: string;
  setPreferredLanguage: (lang: string) => void;
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
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [hasInitialDialogueResponses, setHasInitialDialogueResponses] = useState<boolean>(false);

  const checkInitialDialogueResponses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_initial_dialogue_responses')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      if (error) throw error;
      setHasInitialDialogueResponses(!!data && data.length > 0);
    } catch (err) {
      console.error('Failed to load initial dialogue responses:', err);
      setHasInitialDialogueResponses(false);
    }
  };

  const refreshInitialDialogueResponses = async () => {
    if (supabaseUser) {
      await checkInitialDialogueResponses(supabaseUser.id);
    }
  };

  const fetchIsAdmin = async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', id)
        .single();
      if (error) {
        console.error('is_admin fetch error', error);
        return false;
      }
      return data?.is_admin ?? false;
    } catch (err) {
      console.error('is_admin fetch error', err);
      return false;
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseUser(session.user);
        const isAdmin = await fetchIsAdmin(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin
        });
        checkInitialDialogueResponses(session.user.id);
      }
    };
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        const isAdmin = await fetchIsAdmin(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin
        });
        checkInitialDialogueResponses(session.user.id);
      } else {
        setSupabaseUser(null);
        setUser(null);
        setSongs([]);
        setHasInitialDialogueResponses(false);
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
        const isAdmin = await fetchIsAdmin(data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin
        });
        checkInitialDialogueResponses(data.user.id);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return false;
      if (data.user) {
        setSupabaseUser(data.user);
        const isAdmin = await fetchIsAdmin(data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          plan: 'free',
          songsToday: 0,
          isAdmin
        });
        checkInitialDialogueResponses(data.user.id);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setUser(null);
      setSongs([]);
      setHasInitialDialogueResponses(false);
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
      user,
      songs,
      isAuthenticated: !!supabaseUser,
      hasInitialDialogueResponses,
      refreshInitialDialogueResponses,
      login,
      register,
      logout,
      addSong,
      canGenerateSong,
      preferredLanguage,
      setPreferredLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
};
