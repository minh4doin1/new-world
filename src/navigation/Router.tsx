// src/navigation/Router.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export const Router = () => {
  const { session, loading } = useAuth();

  // TC-FL-02: Hiển thị loading khi đang kiểm tra phiên
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // TC-FL-03: Bảo vệ Route
  // Nếu có session, hiển thị AppNavigator, ngược lại hiển thị AuthNavigator
  return session && session.user ? <AppNavigator /> : <AuthNavigator />;
};