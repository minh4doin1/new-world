import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { COLORS, SIZES } from '../theme';
import { AppButton } from '../components/AppButton';
import { FillInBlankActivity } from '../components/activities/FillInBlankActivity';
import { HomeStackScreenProps } from '../types/navigation';
import { Tables, Json } from '../types/database.types';
import { FillInBlankContent } from '../types/activities.types';

type Activity = Tables<'activities'>;
type Props = HomeStackScreenProps<'LessonSession'>;

// HÀM KIỂM TRA KIỂU (TYPE GUARD)
// Hàm này sẽ kiểm tra xem một đối tượng có cấu trúc giống FillInBlankContent hay không
function isFillInBlankContent(content: Json): content is FillInBlankContent {
  // Ép kiểu `content` thành một đối tượng có thể có các thuộc tính chúng ta cần
  const obj = content as any;
  return (
    obj &&
    Array.isArray(obj.sentence_parts) &&
    obj.sentence_parts.length === 2 &&
    typeof obj.correct_answer === 'string'
  );
}

const LessonSessionScreen = ({ route, navigation }: Props) => {
  const { lessonId, lessonTitle } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'IDLE' | 'CORRECT' | 'INCORRECT'>('IDLE');

  useEffect(() => {
    navigation.setOptions({ title: lessonTitle });
    // ... logic fetchActivities không đổi
  }, [lessonId, lessonTitle, navigation]);

  const handleCheck = useCallback(() => {
    if (activities.length === 0) return;

    const currentActivity = activities[currentIndex];
    const content = currentActivity.content;

    // SỬ DỤNG TYPE GUARD Ở ĐÂY
    if (isFillInBlankContent(content)) {
      const isCorrect = userAnswer.trim().toLowerCase() === content.correct_answer.toLowerCase();
      setFeedback(isCorrect ? 'CORRECT' : 'INCORRECT');
    } else {
      // Mặc định cho qua các hoạt động không phải là dạng quiz
      setFeedback('CORRECT');
    }
  }, [activities, currentIndex, userAnswer]);

  const handleContinue = useCallback(() => {
    // ... logic không đổi
  }, [currentIndex, activities.length, navigation]);

  const renderActivity = () => {
    if (isLoading || !activities[currentIndex]) {
      return null;
    }
    const currentActivity = activities[currentIndex];
    const content = currentActivity.content;

    switch (currentActivity.activity_type) {
      case 'FILL_IN_BLANK':
        // SỬ DỤNG TYPE GUARD Ở ĐÂY ĐỂ TRUYỀN PROPS AN TOÀN
        if (isFillInBlankContent(content)) {
          return (
            <FillInBlankActivity
              data={content} // TypeScript bây giờ biết `content` là `FillInBlankContent`
              userAnswer={userAnswer}
              onAnswerChange={setUserAnswer}
            />
          );
        }
        return <Text style={styles.defaultText}>Lỗi dữ liệu cho hoạt động này.</Text>;

      default:
        return (
          <Text style={styles.defaultText}>
            Hoạt động "{currentActivity.activity_type}" sắp ra mắt!
          </Text>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ color: COLORS.text, marginTop: SIZES.base }}>Đang tải các vì sao...</Text>
      </View>
    );
  }

  if (activities.length === 0) {
      return (
         <View style={[styles.container, styles.center]}>
            <Text style={{ color: COLORS.text }}>Bài học này chưa có nội dung.</Text>
         </View>
      )
  }

  const progress = (currentIndex + 1) / activities.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh tiến trình */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {/* Phần nội dung hoạt động */}
      <View style={styles.activityContainer}>{renderActivity()}</View>

      {/* Phần chân trang (nút bấm và feedback) */}
      <View style={styles.footer}>
        {feedback !== 'IDLE' && (
          <View style={[styles.feedbackBanner, feedback === 'CORRECT' ? styles.correctBanner : styles.incorrectBanner]}>
            <Text style={styles.feedbackText}>
              {feedback === 'CORRECT' ? 'Chính xác!' : 'Chưa đúng, hãy thử lại!'}
            </Text>
          </View>
        )}
        <AppButton
          title={feedback === 'IDLE' ? "Kiểm tra" : "Tiếp tục"}
          onPress={feedback === 'IDLE' ? handleCheck : handleContinue}
          variant={feedback === 'CORRECT' ? "secondary" : "primary"}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 10,
    backgroundColor: COLORS.card,
    borderRadius: 5,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.base,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 5,
  },
  activityContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  defaultText: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    textAlign: 'center',
  },
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  feedbackBanner: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    alignItems: 'center',
  },
  correctBanner: {
    backgroundColor: COLORS.success,
  },
  incorrectBanner: {
    backgroundColor: COLORS.danger,
  },
  feedbackText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.h3,
  },
});

export default LessonSessionScreen;