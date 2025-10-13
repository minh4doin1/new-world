// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../theme';
import { LessonNode, NodeStatus } from '../components/LessonNode';
import { HomeStackScreenProps } from '../types/navigation'; // Cần cập nhật navigation types

// Định nghĩa cấu trúc dữ liệu cho một "Node" trên con đường
type PathNode = {
  type: 'LESSON' | 'SECTION_HEADER';
  id: number | string;
  title: string;
  status: NodeStatus;
  courseId?: number;
};

// Component Header hiển thị thông tin Streak
const HomeHeader = ({ streak }: { streak: number }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>Học</Text>
    <View style={styles.streakContainer}>
      <Text style={styles.streakEmoji}>🔥</Text>
      <Text style={styles.streakNumber}>{streak}</Text>
    </View>
  </View>
);

const HomeScreen = ({ navigation }: HomeStackScreenProps<'Home'>) => {
  const { session } = useAuth();
  const [path, setPath] = useState<PathNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ streak: number } | null>(null);

const fetchData = useCallback(async () => {
    if (!session) return;
    try {
      console.log("Bắt đầu fetch dữ liệu..."); // LOG 1

      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`id, title, lessons (id, title, order)`)
        .order('id', { ascending: true })
        .order('order', { referencedTable: 'lessons', ascending: true });
        
      if (coursesError) throw coursesError;
      
      console.log("Dữ liệu khóa học nhận được:", JSON.stringify(courses, null, 2)); // LOG 2

      if (!courses || courses.length === 0) {
        console.warn("CẢNH BÁO: Không có khóa học nào được trả về từ Supabase. Kiểm tra lại RLS."); // LOG 3
      }
      if (coursesError) throw coursesError;

      // Lấy tiến độ của người dùng
      const { data: completedProgress, error: progressError } = await supabase
        .from('user_activity_log')
        .select('lesson_id') // Chỉ cần chọn cột lesson_id
        .eq('user_id', session.user.id)
        .not('lesson_id', 'is', null); // Chỉ lấy những dòng có lesson_id
      
      if (progressError) throw progressError;

      // Xử lý dữ liệu trả về
      const completedLessonIds = new Set(
        completedProgress.map(p => p.lesson_id)
      );
      // Lấy thông tin profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('streak').eq('id', session.user.id).single();
      if (profileError) console.error(profileError.message);
      setProfile(profileData);

      // BIẾN ĐỔI DỮ LIỆU THÀNH CON ĐƯỜNG
      let tempPath: PathNode[] = [];
      let isNextNodeActive = true; // Node đầu tiên luôn active

      courses.forEach(course => {
        tempPath.push({ type: 'SECTION_HEADER', id: `course_${course.id}`, title: course.title, status: 'COMPLETED' });
        course.lessons.forEach(lesson => {
          let status: NodeStatus = 'LOCKED';
          if (completedLessonIds.has(lesson.id)) {
            status = 'COMPLETED';
          } else if (isNextNodeActive) {
            status = 'ACTIVE';
            isNextNodeActive = false; // Chỉ có một node được active
          }
          tempPath.push({ type: 'LESSON', id: lesson.id, title: lesson.title, status, courseId: course.id });
        });
      });

    setPath(tempPath);
      console.log("Đã xây dựng xong con đường học tập với", tempPath.length, "node."); // LOG 4

    } catch (e) {
      console.error("ĐÃ XẢY RA LỖI TRONG fetchData:", e); // LOG 5
      Alert.alert("Lỗi", "Không thể tải lộ trình học tập của bạn.");
    } finally {
      setIsLoading(false);
    }
}, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeHeader streak={profile?.streak || 0} />
      <ScrollView contentContainerStyle={styles.container}>
        {path.map((node, index) => {
          if (node.type === 'SECTION_HEADER') {
            return <Text key={node.id} style={styles.sectionTitle}>{node.title}</Text>;
          }
          
          // Logic để sắp xếp node sang trái hoặc phải
          const alignment = index % 4 === 1 || index % 4 === 2 ? 'flex-start' : 'flex-end';
          
          return (
            <View key={node.id} style={[styles.nodeWrapper, { alignItems: alignment }]}>
              <LessonNode
                title={node.title}
                status={node.status}
                onPress={() => navigation.navigate('LessonDetail', {
                  lessonId: node.id as number,
                  lessonTitle: node.title,
                })}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.text },
  streakContainer: { flexDirection: 'row', alignItems: 'center' },
  streakEmoji: { fontSize: 24, marginRight: SIZES.base },
  streakNumber: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.text },
  container: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    marginVertical: SIZES.padding,
    padding: SIZES.base,
    backgroundColor: '#E9F7FE',
    borderRadius: SIZES.radius,
  },
  nodeWrapper: {
    minHeight: 180, // Tạo khoảng cách dọc giữa các node
    justifyContent: 'center',
  },
});

export default HomeScreen;