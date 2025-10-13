import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { CoursesListScreenProps } from '../types/navigation';
import { COLORS, SHADOWS, SIZES } from '../theme';
import { useAuth } from '../contexts/AuthContext';

interface Course {
  id: number;
  title: string;
  description: string | null;
}

const CoursesListScreen = ({ navigation }: CoursesListScreenProps) => {
  const { session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ streak: number } | null>(null);

 useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }
      try {
        // Lấy danh sách khóa học (không đổi)
        const { data: coursesData, error: coursesError } = await supabase.functions.invoke('get-courses');
        if (coursesError) throw coursesError;
        if (coursesData.courses) setCourses(coursesData.courses);

        // Lấy thông tin profile (thay đổi ở đây)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', session.user.id)
          .single(); // Vẫn dùng .single()

        // THAY ĐỔI QUAN TRỌNG: Không ném lỗi ra ngoài nữa
        if (profileError && profileError.code !== 'PGRST116') {
          // Chỉ log các lỗi khác, còn lỗi "không tìm thấy" thì bỏ qua
          console.error("Error fetching profile:", profileError);
        }
        
        // Nếu có dữ liệu thì set, không thì profile sẽ là null
        if (profileData) {
          setProfile(profileData);
        }

      } catch (e) {
        // Catch các lỗi nghiêm trọng hơn như lỗi mạng
        console.error("A critical error occurred:", e);
        Alert.alert("Lỗi", "Không thể tải dữ liệu, vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [session]);

  const StreakDisplay = () => (
    <View style={styles.streakContainer}>
      <Text style={styles.streakEmoji}>🔥</Text>
      <View>
        <Text style={styles.streakNumber}>{profile?.streak || 0}</Text>
        <Text style={styles.streakLabel}>Chuỗi ngày học</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <FlatList
      data={courses}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={<StreakDisplay />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, courseTitle: item.title })}
        >
          <View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: SIZES.padding, backgroundColor: COLORS.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  streakContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  streakEmoji: { fontSize: 40, marginRight: SIZES.padding },
  streakNumber: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.primary },
  streakLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  cardTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.text },
  cardDescription: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: SIZES.base / 2 },
  arrow: { fontSize: 24, color: COLORS.textSecondary },
});

export default CoursesListScreen;