// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { Tables } from '../types/database.types';

type Profile = Tables<'profiles'>;

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean; // Giữ lại loading để xử lý màn hình chờ ban đầu
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // Bắt đầu với trạng thái loading

  useEffect(() => {
    console.log('[AuthContext] Setting up onAuthStateChange listener...');

    // onAuthStateChange là nguồn chân lý duy nhất
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(`[AuthContext] onAuthStateChange event: ${_event}. Session exists:`, !!session);
      
      setSession(session);

      if (session?.user) {
        // Nếu có session, fetch profile
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error("[AuthContext] Error fetching profile:", error);
        }
        setProfile(userProfile);
        console.log("[AuthContext] Profile set:", userProfile);
      } else {
        // Nếu không có session, xóa profile
        setProfile(null);
      }
      
      // Quan trọng: Set loading thành false SAU KHI tất cả đã được xử lý
      setLoading(false);
    });

    // Dọn dẹp listener khi component unmount
    return () => {
      console.log('[AuthContext] Unsubscribing from auth state changes.');
      subscription.unsubscribe();
    };
  }, []); // Phụ thuộc rỗng để đảm bảo chỉ chạy MỘT LẦN

  // useEffect để lắng nghe thay đổi profile (giữ nguyên)
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