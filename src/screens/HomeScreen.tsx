// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../theme';
import { LessonNode, NodeStatus } from '../components/LessonNode'; // Sẽ cập nhật style sau
import { HomeStackScreenProps } from '../types/navigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

const WelcomeWidget = ({ name }: { name: string }) => (
  <View>
    <Text style={styles.welcomeSubtitle}>CHÀO MỪNG TRỞ LẠI,</Text>
    <Text style={styles.welcomeTitle}>{name}</Text>
  </View>
);

const ContinueLearningWidget = ({ activeNode, onPress }: { activeNode: PathNode | null, onPress: () => void }) => {
  if (!activeNode) return null;
  return (
    <TouchableOpacity style={styles.continueCard} onPress={onPress}>
      <View>
        <Text style={styles.cardSubheading}>Tiếp tục hành trình</Text>
        <Text style={styles.cardHeading}>{activeNode.title}</Text>
      </View>
      <MaterialCommunityIcons name="arrow-right-circle" size={40} color={COLORS.accent} />
    </TouchableOpacity>
  );
};

// --- MÀN HÌNH HOME MỚI ---
const HomeScreen = ({ navigation }: HomeStackScreenProps<'Home'>) => {
  const { session } = useAuth();
  const [path, setPath] = useState<PathNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string, streak: number } | null>(null);

const fetchData = useCallback(async () => {
    if (!session) return;
    try {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`id, title, lessons (id, title, order)`)
        .order('id', { ascending: true })
        .order('order', { referencedTable: 'lessons', ascending: true });
        
      if (coursesError) throw coursesError;
      

      if (!courses || courses.length === 0) {
        console.warn("CẢNH BÁO: Không có khóa học nào được trả về từ Supabase. Kiểm tra lại RLS."); // LOG 3
      }
      if (coursesError) throw coursesError;
      // Lấy tiến độ của người dùng
      const { data: completedProgress, error: progressError } = await supabase
        .from('user_activity_log')
        .select('lesson_id')
        .eq('user_id', session.user.id)
        .not('lesson_id', 'is', null);
      
      if (progressError) throw progressError;

      // Xử lý dữ liệu trả về
      const completedLessonIds = new Set(
        completedProgress.map(p => p.lesson_id)
      );
      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('full_name, streak').eq('id', session.user.id).single();
      if (profileError) console.error(profileError.message);
      setProfile(profileData);

      let tempPath: PathNode[] = [];
      let isNextNodeActive = true; 

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
  const activeNode = path.find(node => node.status === 'ACTIVE') || null;
  if (isLoading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

 return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Widget Chào mừng */}
        <WelcomeWidget name={profile?.full_name || 'Nhà du hành'} />

        {/* Widget Tiếp tục học */}
        <ContinueLearningWidget 
          activeNode={activeNode} 
          onPress={() => {
            if (activeNode) {
              // CHÚNG TA SẼ SỬA ĐIỂM ĐẾN NÀY Ở PHẦN 2
              navigation.navigate('LessonSession', {
                lessonId: activeNode.id as number,
                lessonTitle: activeNode.title,
              });
            }
          }}
        />

        {/* Con đường học tập (bây giờ chỉ là một phần của HomeScreen) */}
        <View style={styles.pathContainer}>
            <Text style={styles.pathTitle}>Bản đồ các vì sao</Text>
            {path.map((node, index) => {
                if (node.type === 'SECTION_HEADER') {
                    return <Text key={node.id} style={styles.sectionTitle}>{node.title}</Text>;
                }
                const alignment = index % 4 < 2 ? 'flex-start' : 'flex-end'; // Zic-zac
                return (
                    <View key={node.id} style={[styles.nodeWrapper, { alignItems: alignment }]}>
                        <LessonNode
                            title={node.title} status={node.status}
                                            onPress={() => navigation.navigate('LessonSession', {
                  lessonId: node.id as number,
                  lessonTitle: node.title,
                })}
                        />
                    </View>
                );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLESHEET MỚI HOÀN TOÀN ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.padding },
  // Welcome
  welcomeSubtitle: { color: COLORS.textSecondary, fontSize: SIZES.body, fontWeight: 'bold' },
  welcomeTitle: { color: COLORS.text, fontSize: SIZES.h1, fontWeight: 'bold', marginBottom: SIZES.padding },
  // Continue Card
  continueCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSubheading: { color: COLORS.textSecondary, fontSize: SIZES.caption, fontWeight: 'bold' },
  cardHeading: { color: COLORS.accent, fontSize: SIZES.h3, fontWeight: 'bold' },
  // Path
  pathContainer: { marginTop: SIZES.padding },
  pathTitle: { color: COLORS.text, fontSize: SIZES.h2, fontWeight: 'bold', marginBottom: SIZES.padding },
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