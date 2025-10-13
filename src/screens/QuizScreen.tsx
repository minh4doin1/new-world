// src/screens/QuizScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuizScreenProps } from '../types/navigation';
import { COLORS, SIZES } from '../theme';

const QuizScreen = ({ route }: QuizScreenProps) => {
  const { activityId, quizTitle } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quizTitle}</Text>
      <Text>Activity ID: {activityId}</Text>
      <Text style={styles.comingSoon}>Nội dung Quiz sẽ được xây dựng ở đây!</Text>
    </View>
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
  comingSoon: { fontSize: 16},
});
export default QuizScreen;