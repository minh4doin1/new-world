// src/navigation/Router.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator'; // Đảm bảo đã import

export const Router = () => {
  const { session, profile, loading } = useAuth();

  // Đây là nơi ứng dụng của bạn bị kẹt
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Nếu có session, nhưng profile chưa được load (profile là null)
  // và AuthProvider đã chuyển `loading` thành `false`,
  // chúng ta cần xử lý trường hợp này để tránh lỗi.
  
  if (session && profile) {
    // Đã có session VÀ profile
    return profile.has_completed_onboarding 
      ? <AppNavigator /> 
      : <OnboardingNavigator />;
  }

  // Trường hợp có session nhưng profile là null (ví dụ: người dùng mới tạo mà trigger chưa kịp chạy)
  // Trong trường hợp này, chúng ta không làm gì cả, cứ hiển thị AuthNavigator
  // Sau khi người dùng đăng ký/đăng nhập, AuthProvider sẽ cố gắng tải profile
  
  // Mặc định cho người chưa đăng nhập HOẶC người mới đăng ký chưa có profile hoàn chỉnh
  return <AuthNavigator />;
};