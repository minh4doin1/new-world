import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CourseDetailScreenProps } from '../types/navigation';

const CourseDetailScreen = ({ route }: CourseDetailScreenProps) => {
  const { courseId, courseTitle } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{courseTitle}</Text>
      <Text style={styles.info}>Course ID: {courseId}</Text>
      <Text style={styles.comingSoon}>Danh sách bài học sẽ được hiển thị ở đây!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  info: { fontSize: 18, marginBottom: 8 },
  comingSoon: { fontSize: 16, color: 'gray', marginTop: 24, textAlign: 'center' },
});

export default CourseDetailScreen;