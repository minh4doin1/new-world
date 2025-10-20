// src/screens/CourseDiscoveryScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { BilingualText } from '../types/common.types';
import { getDisplayTitleParts } from '../utils/textUtils';
import { AppButton } from '../components/AppButton';

// ... (type AvailableCourse giữ nguyên)
type AvailableCourse = {
  id: number;
  title: BilingualText;
  description: BilingualText;
  target_language: string;
};

const CourseDiscoveryScreen = () => {
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const navigation = useNavigation();

  const fetchAvailableCourses = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_available_courses');
    if (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách khóa học.');
      console.error(error);
    } else {
      setCourses(data || []);
    }
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAvailableCourses();
    }, [fetchAvailableCourses])
  );

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    try {
      const { error } = await supabase.functions.invoke('enroll-in-course', {
        body: { course_id: courseId },
      });

      if (error) {
        if (error.message.includes('409')) {
          Alert.alert('Thông báo', 'Bạn đã tham gia khóa học này rồi.');
        } else {
          throw new Error(error.message);
        }
      } else {
        // SỬA LỖI & CẢI THIỆN UX
        Alert.alert('Thành công!', 'Bạn đã ghi danh vào khóa học mới. Hãy bắt đầu hành trình!', [
          { text: 'OK', onPress: () => navigation.navigate('Home' as never) } // Chuyển hướng về Home
        ]);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể ghi danh: ' + e.message);
    } finally {
      setEnrollingId(null);
    }
  };

  // ... (phần render và styles giữ nguyên)

  if (isLoading) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" /></View>;
  }

  const renderCourseCard = ({ item }: { item: AvailableCourse }) => {
    const titleParts = getDisplayTitleParts(item.title, item.target_language);
    const descParts = getDisplayTitleParts(item.description, item.target_language);

    return (
      <View style={styles.card}>
        <Text style={styles.cardLanguage}>{item.target_language}</Text>
        <Text style={styles.cardTitle}>{titleParts.main}</Text>
        <Text style={styles.cardSubtitle}>{titleParts.sub}</Text>
        <Text style={styles.cardDescription}>{descParts.sub}</Text>
        <AppButton 
          title="Bắt đầu học" 
          onPress={() => handleEnroll(item.id)}
          loading={enrollingId === item.id}
          disabled={!!enrollingId}
          style={{marginTop: SIZES.padding}}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={courses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderCourseCard}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.loaderContainer}>
          <Text>Chúc mừng! Bạn đã tham gia tất cả các khóa học.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
    container: { padding: SIZES.padding, backgroundColor: COLORS.background },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        ...SHADOWS.medium,
    },
    cardLanguage: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: SIZES.base / 2,
    },
    cardTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    cardSubtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginBottom: SIZES.base,
    },
    cardDescription: {
        fontSize: SIZES.body,
        color: COLORS.text,
        lineHeight: SIZES.body * 1.5,
    }
});


export default CourseDiscoveryScreen;