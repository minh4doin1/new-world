// src/components/activities/SentenceScrambleActivity.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../theme';

type Props = {
  data: { scrambled_words: string[] };
  currentAnswer: string[];
  onWordPress: (word: string, isFromBank: boolean) => void;
};

export const SentenceScrambleActivity = ({ data, currentAnswer, onWordPress }: Props) => {
  const wordBank = data.scrambled_words.filter(word => !currentAnswer.includes(word));

  return (
    <View style={styles.container}>
      <View style={styles.answerArea}>
        {currentAnswer.map((word, index) => (
          <TouchableOpacity key={`${word}-${index}`} style={styles.wordChip} onPress={() => onWordPress(word, false)}>
            <Text style={styles.wordText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.wordBank}>
        {wordBank.map((word, index) => (
          <TouchableOpacity key={`${word}-${index}`} style={styles.wordChip} onPress={() => onWordPress(word, true)}>
            <Text style={styles.wordText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  answerArea: { minHeight: 100, backgroundColor: COLORS.background, borderBottomWidth: 2, borderBottomColor: COLORS.border, flexDirection: 'row', flexWrap: 'wrap', padding: SIZES.base },
  wordBank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: SIZES.padding },
  wordChip: { backgroundColor: COLORS.card, paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, borderRadius: SIZES.radius, margin: SIZES.base, borderWidth: 1, borderColor: COLORS.border },
  wordText: { color: COLORS.text, fontSize: SIZES.h3 },
});