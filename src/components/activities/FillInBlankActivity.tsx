// src/components/activities/FillInBlankActivity.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../theme';
import { FillInBlankContent } from '../../types/activities.types';

type Props = {
  data: FillInBlankContent;
  userAnswer: string;
  onAnswerChange: (text: string) => void;
};

export const FillInBlankActivity = ({ data, userAnswer, onAnswerChange }: Props) => {
  // TypeScript bây giờ biết chắc chắn data.sentence_parts là một mảng 2 chuỗi
  return (
    <View style={styles.container}>
      <View style={styles.sentenceContainer}>
        <Text style={styles.textPart}>{data.sentence_parts[0]}</Text>
        <TextInput
          style={styles.input}
          value={userAnswer}
          onChangeText={onAnswerChange}
          placeholder="......"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
        />
        <Text style={styles.textPart}>{data.sentence_parts[1]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sentenceContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  textPart: { color: COLORS.text, fontSize: SIZES.h2, marginHorizontal: 4 },
  input: {
    borderBottomWidth: 2,
    borderColor: COLORS.border,
    color: COLORS.accent,
    minWidth: 80,
    textAlign: 'center',
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
});