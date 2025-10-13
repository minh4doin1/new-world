import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { AppTextInput } from '../components/AppTextInput';
import { AppButton } from '../components/AppButton';
import { COLORS } from '../theme'

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    // TC-UI-01: Hiển thị loading
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // TC-SI-02, TC-SI-03: Hiển thị lỗi
      Alert.alert('Lỗi Đăng nhập', 'Thông tin đăng nhập không chính xác.');
    }
    // Nếu thành công, onAuthStateChange trong AuthContext sẽ tự động xử lý
    setLoading(false);
  };

return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng nhập</Text>
        <AppTextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <AppTextInput placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton title="Đăng nhập" onPress={handleSignIn} loading={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: COLORS.text },
});


export default SignInScreen;