// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { supabase } from '../services/supabaseClient';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // TC-SU-03, TC-SU-04: Supabase client tự động validate
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      // TC-SU-02: Hiển thị lỗi
      Alert.alert('Lỗi Đăng ký', error.message);
    } else if (!data.session) {
      // TC-SU-01: Đăng ký thành công
      Alert.alert('Đăng ký thành công!', 'Vui lòng kiểm tra email để xác thực tài khoản.');
    }
    // Nếu thành công, onAuthStateChange sẽ xử lý
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button title="Đăng ký" onPress={handleSignUp} />
        )}
      </View>
    </SafeAreaView>
  );
};

// Sử dụng lại styles từ SignInScreen
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
});

export default SignUpScreen;