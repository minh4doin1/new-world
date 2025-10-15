// src/components/GoogleSignInButton.tsx
import React, { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../services/supabaseClient';
import { AppButton } from './AppButton';
import { COLORS } from '../theme';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const GoogleSignInButton = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Chỉ cấu hình cho mobile, không cấu hình cho web
    if (Platform.OS !== 'web' && GOOGLE_WEB_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    if (Platform.OS === 'web') {
      // --- LOGIC CHO WEB ---
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Chuyển hướng về trang hiện tại sau khi đăng nhập
        },
      });
      if (error) {
        Alert.alert("Lỗi Đăng nhập Google", error.message);
        setLoading(false);
      }
    } else {
      // --- LOGIC CHO MOBILE (IOS/ANDROID) ---
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo: any = await GoogleSignin.signIn();
        if (userInfo && userInfo.idToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: userInfo.idToken,
          });
          if (error) throw error;
        } else {
          throw new Error('Không nhận được Google ID Token');
        }
      } catch (error: any) {
        if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
          Alert.alert("Lỗi Đăng nhập Google", error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AppButton 
      title="Tiếp tục với Google" 
      onPress={signInWithGoogle} 
      loading={loading}
      style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}
    />
  );
};