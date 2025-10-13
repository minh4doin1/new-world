// src/screens/LessonDetailScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { LessonDetailScreenProps } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { AppButton } from '../components/AppButton';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { Tables } from '../types/database.types';

// Định nghĩa kiểu cho một hoạt động đã được kết hợp với tiến độ
type ActivityWithProgress = Tables<'activities'> & {
  is_completed: boolean;
};

const LessonDetailScreen = ({ route, navigation }: LessonDetailScreenProps) => {
  const { lessonId } = route.params;
  const { session } = useAuth();
  const { width } = useWindowDimensions(); // Lấy chiều rộng màn hình cho RenderHTML

  const [activities, setActivities] = useState<ActivityWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Sử dụng useCallback để tránh re-render không cần thiết
  const fetchData = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      // 1. Lấy danh sách hoạt động của bài học
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order', { ascending: true });
      if (activitiesError) throw activitiesError;

      // 2. Lấy danh sách các hoạt động người dùng đã hoàn thành
      const activityIds = activitiesData.map(a => a.id);
      const { data: progressData, error: progressError } = await supabase
        .from('user_activity_log')
        .select('activity_id')
        .eq('user_id', session.user.id)
        .in('activity_id', activityIds);
      if (progressError) throw progressError;

      const completedIds = new Set(progressData.map(p => p.activity_id));

      // 3. Kết hợp hai luồng dữ liệu
      const activitiesWithProgress = activitiesData.map(activity => ({
        ...activity,
        is_completed: completedIds.has(activity.id),
      }));

      setActivities(activitiesWithProgress);
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Không thể tải nội dung bài học.");
    } finally {
      setLoading(false);
    }
  }, [lessonId, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompleteActivity = async (activity: ActivityWithProgress) => {
    if (activity.is_completed) return;
    setCompletingId(activity.id);
    try {
      const { error } = await supabase.functions.invoke('complete-activity', {
        body: { activity_id: activity.id },
      });
      if (error) throw error;

      // Cập nhật UI ngay lập tức
      setActivities(currentActivities =>
        currentActivities.map(a =>
          a.id === activity.id ? { ...a, is_completed: true } : a
        )
      );
    } catch (e) {
      Alert.alert("Lỗi", "Không thể hoàn thành hoạt động. Vui lòng thử lại.");
    } finally {
      setCompletingId(null);
    }
  };

  // HÀM RENDER "THÔNG MINH"
  const renderActivity = ({ item }: { item: ActivityWithProgress }) => {
    const content = item.content as any; // Cast để dễ truy cập các thuộc tính JSON
    
    return (
      <View style={[styles.card, SHADOWS.light]}>
        {/* LOẠI 1: BÀI GIẢNG */}
        {item.activity_type === 'LESSON_CONTENT' && content.html_content && (
          <>
            <RenderHTML contentWidth={width - SIZES.padding * 4} source={{ html: content.html_content }} />
            <AppButton
              title={item.is_completed ? "Đã hoàn thành" : "Đánh dấu đã đọc"}
              onPress={() => handleCompleteActivity(item)}
              loading={completingId === item.id}
              disabled={item.is_completed}
            />
          </>
        )}

        {/* LOẠI 2: LUYỆN PHÁT ÂM */}
        {item.activity_type === 'PRONUNCIATION' && (
          <>
            <Text style={styles.promptTitle}>Luyện phát âm:</Text>
            <Text style={styles.promptText}>"{content.text}"</Text>
            <AppButton 
              title="Bắt đầu luyện tập" 
              onPress={() => navigation.navigate('Pronunciation', { 
                activityId: item.id, 
                originalText: content.text 
              })} 
            />
          </>
        )}
        
        {/* LOẠI 3: LUYỆN GIAO TIẾP */}
        {item.activity_type === 'CONVERSATION' && (
          <>
            <Text style={styles.promptTitle}>Luyện giao tiếp:</Text>
            <Text style={styles.promptText}>"{content.scenario}"</Text>
            <AppButton 
              title="Bắt đầu hội thoại" 
              onPress={() => navigation.navigate('LiveTalk', { 
                activityId: item.id, 
                scenario: content.scenario, 
                initialPrompt: content.initial_prompt 
              })} 
            />
          </>
        )}

        {/* LOẠI 4: BÀI KIỂM TRA */}
        {item.activity_type === 'QUIZ' && (
           <>
            <Text style={styles.promptTitle}>Bài kiểm tra:</Text>
            <Text style={styles.promptText}>"{content.title}"</Text>
            <AppButton 
              title="Làm bài" 
              onPress={() => navigation.navigate('Quiz', { 
                activityId: item.id, 
                quizTitle: content.title 
              })} 
            />
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <FlatList
      data={activities}
      renderItem={renderActivity}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bài học này chưa có nội dung. 🙁</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: SIZES.padding, backgroundColor: COLORS.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  promptTitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.base },
  promptText: { fontSize: SIZES.h3, color: COLORS.primary, marginBottom: SIZES.padding, fontStyle: 'italic', fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: SIZES.h3, color: COLORS.textSecondary },
});

export default LessonDetailScreen;