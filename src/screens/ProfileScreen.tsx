// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../services/supabaseClient';

const ProfileScreen = () => {
  const handleSignOut = async () => {
    // TC-FL-01: Đăng xuất
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tài khoản</Text>
        <Button title="Đăng xuất" onPress={handleSignOut} color="red" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
});

export default ProfileScreen;