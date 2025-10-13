// src/screens/QuizScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuizScreenProps } from '../types/navigation';
import { COLORS } from '../theme';

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

// ... styles
export default QuizScreen;