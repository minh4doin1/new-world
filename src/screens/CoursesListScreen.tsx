import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { CoursesListScreenProps } from '../types/navigation';
import { COLORS, SIZES } from '../theme';
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
      try {
        // Lấy danh sách khóa học
        const { data: coursesData, error: coursesError } = await supabase.functions.invoke('get-courses');
        if (coursesError) throw coursesError;
        if (coursesData.courses) setCourses(coursesData.courses);

        // Lấy thông tin profile (streak)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', session!.user.id)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData);

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (session) {
      fetchData();
    }
  }, [session]);

  const StreakDisplay = () => (
    <View style={styles.streakContainer}>
      <Text style={styles.streakText}>🔥 {profile?.streak || 0} Ngày</Text>
    </View>
  );

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
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
          <Text style={styles.title}>{item.title}</Text>
          {item.description && <Text style={styles.description}>{item.description}</Text>}
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.container}
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
});

export default CoursesListScreen;