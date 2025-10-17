// src/screens/HomeScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../theme';
import { HomeStackScreenProps } from '../types/navigation';
import { CourseSection, LessonData } from '../components/CourseSection';
import { useFocusEffect } from '@react-navigation/native';
import { BilingualText } from '../types/common.types';
import { getDisplayTitleParts } from '../utils/textUtils';

type UnitData = {
    id: number;
    title: BilingualText;
    skills: {
        id: number;
        title: BilingualText;
        lessons: LessonData[];
    }[];
}

type CourseData = {
  id: number;
  title: BilingualText;
  units: UnitData[];
  target_language: string;
};

type LanguagePath = {
  language: string;
  courses: CourseData[];
}

type UserPathData = {
  languages: LanguagePath[];
}

const HomeScreen = ({ navigation }: HomeStackScreenProps<'Home'>) => {
  const { session } = useAuth();
  // State mới để lưu trữ toàn bộ lộ trình
  const [userPath, setUserPath] = useState<LanguagePath[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    console.log("Fetching user path from backend...");
    setIsLoading(true);
    
    try {
      // === THAY ĐỔI LỚN: GỌI RPC FUNCTION ===
      const { data, error } = await supabase.rpc('get_user_path', {
        p_user_id: session.user.id,
      });

      if (error) throw error;

      // Dữ liệu trả về đã có cấu trúc hoàn chỉnh
      const pathData: UserPathData = data || { languages: [] };
      const languages = pathData.languages || [];
      setUserPath(languages);
      
      // Tự động chọn tab ngôn ngữ đầu tiên nếu chưa có
      if ((!selectedLanguage || !languages.some(p => p.language === selectedLanguage)) && languages.length > 0) {
        setSelectedLanguage(languages[0].language);
      }

    } catch (e: any) {
      Alert.alert("Lỗi", "Không thể tải lộ trình học tập: " + e.message);
    } finally {
      setIsLoading(false);
    }
  }, [session, selectedLanguage]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleLessonPress = (lesson: LessonData, course: CourseData, allLessonsInSkill: LessonData[]) => {
    if (lesson.status !== 'ACTIVE') return;

    navigation.navigate('LessonSession', { 
      lessonId: lesson.id, 
      lessonTitle: getDisplayTitleParts(lesson.title, course.target_language).main || lesson.title.vi, // <-- Lấy title đúng
      onComplete: fetchData,
      allLessons: allLessonsInSkill.map(l => ({id: l.id, title: l.title.vi})), // <-- Lấy title.vi cho dễ xử lý
    });
  };
  if (isLoading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  }

  const availableLanguages = userPath.map(p => p.language);
  const coursesForSelectedLanguage = userPath.find(p => p.language === selectedLanguage)?.courses || [];

  const activeCourse = userPath.find(p => p.language === selectedLanguage)?.courses[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.tabsContainer}>
          {userPath.map(p => (
            <TouchableOpacity 
              key={p.language} 
              style={[styles.tab, selectedLanguage === p.language && styles.tabActive]}
              onPress={() => setSelectedLanguage(p.language)}
            >
              <Text style={[styles.tabText, selectedLanguage === p.language && styles.tabTextActive]}>{p.language}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeCourse ? (
            <>
                <Text style={styles.headerTitle}>{getDisplayTitleParts(activeCourse.title, activeCourse.target_language).main}</Text>
                <Text style={styles.headerSubtitle}>{getDisplayTitleParts(activeCourse.title, activeCourse.target_language).sub}</Text>
                
                {activeCourse.units.map(unit => {
                    // Gom tất cả lesson trong một unit lại
                    const allLessonsInUnit = unit.skills.flatMap(skill => skill.lessons);
                    return (
                        <CourseSection 
                            key={unit.id}
                            courseTitle={activeCourse.title}
                            unitTitle={unit.title}
                            lessons={allLessonsInUnit}
                            targetLanguage={activeCourse.target_language}
                            onLessonPress={(lesson) => handleLessonPress(lesson, activeCourse, allLessonsInUnit)}
                        />
                    )
                })}
            </>
        ) : (
            <Text>Không có khóa học nào cho ngôn ngữ này.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  container: { padding: SIZES.padding },
  headerTitle: { color: COLORS.text, fontSize: SIZES.h1, fontWeight: 'bold', marginBottom: SIZES.padding },
  tabsContainer: { flexDirection: 'row', marginBottom: SIZES.padding },
  tab: { paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, borderRadius: SIZES.radius, marginRight: SIZES.base, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontWeight: 'bold' },
  tabTextActive: { color: COLORS.white },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: SIZES.h3, marginBottom: SIZES.padding },
});

export default HomeScreen;