// src/components/activities/PronunciationActivity.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../theme';
import { PronunciationContent } from '../../types/activities.types';
import { AppButton } from '../AppButton';
import { HomeStackScreenProps } from '../../types/navigation';

// Sử dụng kiểu `any` cho navigation vì nó được truyền từ một màn hình cha
// có kiểu phức tạp. Đây là một trường hợp chấp nhận được.
type Props = {
  data: PronunciationContent;
  navigation: any; 
};

export const PronunciationActivity = ({ data, navigation }: Props) => {
  const handlePractice = () => {
    // Điều hướng đến màn hình PronunciationScreen, truyền vào dữ liệu cần thiết
    navigation.navigate('Pronunciation', {
      // activityId không thực sự cần thiết ở đây vì việc hoàn thành
      // được xử lý trong LessonSessionScreen, nhưng ta vẫn có thể truyền
      activityId: 0, // Giá trị giả, không dùng đến
      originalText: data.text_to_pronounce,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luyện phát âm</Text>
      <View style={styles.card}>
        <Text style={styles.sentence}>{data.text_to_pronounce}</Text>
      </View>
      <AppButton
        title="Bắt đầu luyện tập"
        onPress={handlePractice}
        style={{ backgroundColor: COLORS.accent, borderColor: COLORS.accentDark }}
      />
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
});