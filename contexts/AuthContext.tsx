import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 获取初始 session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 监听 auth 状态变化
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      setUser(null);
      setSession(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabaseClient.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        throw error;
      }
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

