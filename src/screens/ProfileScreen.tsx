// src/screens/ProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from "react-native-gifted-charts";

import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { AppButton } from '../components/AppButton';
import { StatCard } from '../components/profile/StatCard';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { Tables } from '../types/database.types';
import { AppTabScreenProps } from '../types/navigation';

type ProfileData = {
  profile: Tables<'profiles'>;
  join_date: string;
  daily_xp_summary: { date: string, xp: number }[];
}

const ProfileScreen = ({ navigation }: AppTabScreenProps<'Profile'>) => {
  const { session } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileDetails = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_profile_details', {
        p_user_id: session.user.id,
      });
      if (error) throw error;
      setProfileData(data);
    } catch (e: any)      {
      Alert.alert("Lỗi", "Không thể tải dữ liệu hồ sơ: " + e.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileDetails();
    }, [fetchProfileDetails])
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading || !profileData) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const { profile, join_date, daily_xp_summary } = profileData;

  const chartData = daily_xp_summary.map(item => ({
    value: item.xp,
    label: new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
    frontColor: COLORS.primary,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image 
            source={{ uri: profile.avatar_url || 'https://i.pravatar.cc/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.fullName}>{profile.full_name || 'Người dùng mới'}</Text>
          <Text style={styles.joinDate}>
            Thành viên từ {new Date(join_date).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="star-four-points" value={profile.xp} label="Tổng XP" color={COLORS.warning} />
          <StatCard icon="fire" value={profile.streak} label="Streak" color={COLORS.danger} />
          <StatCard icon="diamond-stone" value={profile.lingots} label="Lingots" color={COLORS.primary} />
        </View>
        
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Hoạt động 7 ngày qua</Text>
            <BarChart
                data={chartData}
                barWidth={22}
                noOfSections={4}
                barBorderRadius={4}
                yAxisTextStyle={{color: COLORS.textSecondary}}
                xAxisLabelTextStyle={{color: COLORS.textSecondary, paddingTop: SIZES.base}}
                yAxisThickness={0}
                xAxisThickness={0}
                isAnimated
            />
        </View>
        
        <View style={styles.actions}>
          <AppButton 
            title="Khám phá khóa học mới" 
            onPress={() => navigation.navigate('HomeStack', { screen: 'CourseDiscovery' })}
            variant='primary'
            style={{ marginBottom: SIZES.base }}
          />
          <AppButton title="Đăng xuất" onPress={handleSignOut} variant="danger" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scrollContent: { padding: SIZES.padding },
  header: { alignItems: 'center', marginBottom: SIZES.padding },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primary },
  fullName: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text, marginTop: SIZES.base },
  joinDate: { fontSize: SIZES.body, color: COLORS.textSecondary },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SIZES.padding },
  card: {
      backgroundColor: COLORS.card,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      marginBottom: SIZES.padding,
      ...SHADOWS.light,
  },
  cardTitle: {
      fontSize: SIZES.h3,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: SIZES.padding,
  },
  actions: { marginTop: SIZES.padding },
});

export default ProfileScreen;