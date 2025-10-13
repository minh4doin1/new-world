// src/screens/AuthScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';
import { AuthStackScreenProps } from '../types/navigation'; // Sẽ tạo ở bước sau

const AuthScreen = ({ navigation }: AuthStackScreenProps<'Auth'>) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Chào mừng bạn!</Text>
        <Text style={styles.subtitle}>Hãy tham gia cộng đồng học ngoại ngữ của chúng tôi.</Text>
        <View style={styles.buttonContainer}>
          <Button title="Đăng nhập" onPress={() => navigation.navigate('SignIn')} />
          <View style={{ marginVertical: 8 }} />
          <Button title="Đăng ký" onPress={() => navigation.navigate('SignUp')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 32 },
  buttonContainer: { width: '80%' },
});

export default AuthScreen;