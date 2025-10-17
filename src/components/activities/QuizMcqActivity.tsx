// src/components/activities/QuizMcqActivity.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../theme';

type Props = {
  data: { question_text: string; options: string[] };
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
};

export const QuizMcqActivity = ({ data, selectedOption, onSelectOption }: Props) => {
  return (
    <View>
      <Text style={styles.question}>{data.question_text}</Text>
      <View>
        {data.options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selectedOption === option && styles.optionSelected]}
            onPress={() => onSelectOption(option)}
          >
            <Text style={[styles.optionText, selectedOption === option && styles.optionTextSelected]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  question: { color: COLORS.text, fontSize: SIZES.h2, fontWeight: 'bold', marginBottom: SIZES.padding * 2, textAlign: 'center' },
  option: { backgroundColor: COLORS.card, padding: SIZES.padding, borderRadius: SIZES.radius, borderWidth: 2, borderColor: COLORS.border, marginBottom: SIZES.base * 2 },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  optionText: { color: COLORS.text, fontSize: SIZES.h3 },
  optionTextSelected: { color: COLORS.primaryDark, fontWeight: 'bold' },
});