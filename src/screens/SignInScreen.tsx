// src/screens/SignInScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { AppTextInput } from '../components/AppTextInput';
import { AppButton } from '../components/AppButton';
import { COLORS, SIZES } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icon
import { GoogleSignInButton } from '../components/GoogleSignInButton';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Lỗi Đăng nhập', error.message || 'Thông tin đăng nhập không chính xác.');
    }
    // Nếu thành công, onAuthStateChange trong AuthContext sẽ tự động xử lý việc fetch profile và điều hướng.
    // Không cần làm gì thêm ở đây.
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          {/* TODO: Thay thế bằng một SVG hoặc hình ảnh mascot vui nhộn */}
          <MaterialCommunityIcons name="owl" size={80} color={COLORS.primary} />
          <Text style={styles.title}>Chào mừng trở lại!</Text>
        </View>
        
        <View style={styles.formContainer}>
          <AppTextInput
            label="Email"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppTextInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.footer}>
          <AppButton title="Đăng nhập" onPress={handleSignIn} loading={loading} />
          <View style={{marginVertical: 8}} />
          <GoogleSignInButton />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    padding: SIZES.padding,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.padding,
  },
  formContainer: {
    flex: 1.5,
    justifyContent: 'center',
  },
  footer: {
    flex: 0.5,
    justifyContent: 'flex-end',
    paddingBottom: SIZES.padding,
  },
});

export default SignInScreen;