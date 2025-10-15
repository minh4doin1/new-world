// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { Tables } from '../types/database.types';

type Profile = Tables<'profiles'>;

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log('[AuthContext] useEffect triggered. Starting session check...');

    // 1. Lấy session ban đầu
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AuthContext] Initial getSession() result. Session exists:', !!session);
      setSession(session);
      if (session) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
        console.log('[AuthContext] Initial profile loaded.');
      }
      setLoading(false);
    });

    // 2. Lắng nghe các thay đổi trạng thái đăng nhập/đăng xuất
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] onAuthStateChange event: ${event}`);
      setSession(session);
      
      if (session) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
        console.log('[AuthContext] Profile updated on auth state change.');
      } else {
        setProfile(null);
        console.log('[AuthContext] Session ended, profile cleared.');
      }
    });

    // 3. Dọn dẹp khi component unmount
    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // 4. MỘT useEffect RIÊNG ĐỂ LẮNG NGHE THAY ĐỔI PROFILE (REALTIME)
  useEffect(() => {
    if (!session?.user) return;

    console.log(`[AuthContext] Setting up Realtime subscription for profile: ${session.user.id}`);
    
    const profileChannel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload) => {
          console.log('[AuthContext] REALTIME: Profile change received!', payload);
          // Cập nhật state profile với dữ liệu mới
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      console.log('[AuthContext] Unsubscribing from profile changes.');
      supabase.removeChannel(profileChannel);
    };
  }, [session]); // useEffect này sẽ chạy lại mỗi khi session thay đổi

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};