// src/components/activities/FillInBlankActivity.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../theme';
import { FillInBlankContent } from '../../types/activities.types';

type Props = {
  // SỬA LỖI: Cho phép data có thể có cả hai cấu trúc
  data: FillInBlankContent & { sentence_template?: string };
  userAnswer: string;
  onAnswerChange: (text: string) => void;
};

export const FillInBlankActivity = ({ data, userAnswer, onAnswerChange }: Props) => {
  // SỬA LỖI: Xử lý cả hai trường hợp dữ liệu
  // Ưu tiên cấu trúc mới `sentence_template` nếu có
  const parts = data.sentence_template
    ? data.sentence_template.split('____')
    : data.sentence_parts;

  // Đảm bảo `parts` luôn là một mảng có 2 phần tử để tránh lỗi runtime
  const part1 = parts?.[0] || '';
  const part2 = parts?.[1] || '';

  return (
    <View style={styles.container}>
      <View style={styles.sentenceContainer}>
        <Text style={styles.textPart}>{part1}</Text>
        <TextInput
          style={styles.input}
          value={userAnswer}
          onChangeText={onAnswerChange}
          placeholder="......"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.textPart}>{part2}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sentenceContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.padding },
  textPart: { color: COLORS.text, fontSize: SIZES.h2, marginHorizontal: 4, lineHeight: SIZES.h2 * 1.5 },
  input: {
    borderBottomWidth: 2,
    borderColor: COLORS.border,
    color: COLORS.accent,
    minWidth: 80,
    textAlign: 'center',
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
});