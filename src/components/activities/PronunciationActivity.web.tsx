// src/components/activities/PronunciationActivity.web.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../theme';
import { PronunciationContent } from '../../types/activities.types';

type Props = {
  data: PronunciationContent;
  navigation: any; // navigation không được sử dụng trên web
};

export const PronunciationActivity = ({ data }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luyện phát âm (Web)</Text>
      <View style={styles.card}>
        <Text style={styles.sentence}>{data.text_to_pronounce}</Text>
      </View>
      <Text style={styles.infoText}>
        Tính năng này hiện chỉ có trên ứng dụng di động. Bạn có thể nhấn "Tiếp tục" để bỏ qua.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    width: '100%',
    marginBottom: SIZES.padding * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sentence: {
    color: COLORS.primary,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: SIZES.h2 * 1.5,
  },
  infoText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});