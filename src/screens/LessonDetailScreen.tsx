// src/screens/LessonDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { LessonDetailScreenProps } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { AppButton } from '../components/AppButton';
import { COLORS, SIZES } from '../theme';

interface Activity {
  id: number;
  prompt: string; // Giả sử chúng ta lấy prompt từ DB
  // Thêm các trường khác nếu cần
}

const LessonDetailScreen = ({ route }: LessonDetailScreenProps) => {
  const { lessonId } = route.params;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchActivities = async () => {
      // ... logic fetch activities tương tự fetch lessons
      setLoading(false);
    };
    fetchActivities();
  }, [lessonId]);

  const handleCompleteActivity = async (activityId: number) => {
    try {
      const { error } = await supabase.functions.invoke('complete-activity', {
        body: { activity_id: activityId },
      });
      if (error) throw error;

      Alert.alert("Thành công!", "Bạn đã hoàn thành hoạt động. Hãy tiếp tục!");
      setCompletedIds(prev => new Set(prev).add(activityId)); // Cập nhật UI
    } catch (e) {
      Alert.alert("Lỗi", "Không thể hoàn thành hoạt động. Vui lòng thử lại.");
      console.error(e);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.prompt}>{item.prompt}</Text>
          <AppButton
            title={completedIds.has(item.id) ? "Đã hoàn thành" : "Hoàn thành"}
            onPress={() => handleCompleteActivity(item.id)}
            disabled={completedIds.has(item.id)}
          />
        </View>
      )}
    />
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#666', marginTop: 4 },
  container: { paddingBottom: 16, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  streakContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  prompt: { fontSize: 16}
});
export default LessonDetailScreen;