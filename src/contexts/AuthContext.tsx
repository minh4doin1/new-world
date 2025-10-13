// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

// Định nghĩa "hình dạng" của Context
type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

// Tạo Context
const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

// Tạo Provider Component
export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // UC-04: Tự động đăng nhập
    // Lấy phiên đăng nhập hiện tại ngay khi app khởi động
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Lắng nghe các thay đổi trạng thái đăng nhập (SIGN_IN, SIGN_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Dọn dẹp listener khi component bị unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Tạo custom hook để dễ dàng sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};