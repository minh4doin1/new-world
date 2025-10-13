import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CourseDetailScreenProps } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { COLORS } from '../theme';

interface Lesson {
  id: number;
  title: string;
}

const CourseDetailScreen = ({ route, navigation }: CourseDetailScreenProps) => {
  const { courseId, courseTitle } = route.params;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error) console.error(error);
      else setLessons(data);
      setLoading(false);
    };
    fetchLessons();
  }, [courseId]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <FlatList
      data={lessons}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id, lessonTitle: item.title })}
        >
          <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  info: { fontSize: 18, marginBottom: 8 },
  comingSoon: { fontSize: 16, color: 'gray', marginTop: 24, textAlign: 'center' },
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
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

});

export default CourseDetailScreen;