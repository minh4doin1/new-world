// src/screens/PronunciationScreen.web.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PronunciationScreenProps } from '../types/navigation';
import { AppButton } from '../components/AppButton';
import { COLORS, SIZES } from '../theme';

// Phiên bản Web của màn hình Luyện phát âm
const PronunciationScreen = ({ route, navigation }: PronunciationScreenProps) => {
  const { originalText } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.promptTitle}>Hãy đọc câu sau:</Text>
        <Text style={styles.originalText}>{originalText}</Text>
      </View>

      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>
          Tính năng luyện phát âm bằng micro hiện chỉ hỗ trợ trên ứng dụng di động.
        </Text>
        <Text style={styles.placeholderSubText}>
          Chúng tôi đang làm việc để sớm mang tính năng này lên phiên bản web!
        </Text>
      </View>

      <AppButton
        title="Quay lại bài học"
        onPress={() => navigation.goBack()}
        style={{ marginTop: SIZES.padding, width: '80%' }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '100%',
    marginBottom: SIZES.padding,
  },
  promptTitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  originalText: {
    fontSize: SIZES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SIZES.base,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '100%',
  },
  placeholderText: {
    fontSize: SIZES.h3,
    color: COLORS.info,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholderSubText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
});

export default PronunciationScreen;