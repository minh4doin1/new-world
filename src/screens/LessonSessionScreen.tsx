// src/screens/LessonSessionScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { COLORS, SIZES } from '../theme';
import { AppButton } from '../components/AppButton';
import { HomeStackScreenProps } from '../types/navigation';
import { Tables, Json } from '../types/database.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import các component hoạt động
import { FillInBlankActivity } from '../components/activities/FillInBlankActivity';
import { LessonContentActivity } from '../components/activities/LessonContentActivity';
import { QuizMcqActivity } from '../components/activities/QuizMcqActivity';
import { SentenceScrambleActivity } from '../components/activities/SentenceScrambleActivity';
// import { PronunciationActivity } from '../components/activities/PronunciationActivity';
import { PronunciationActivity } from '../components/activities/PronunciationActivity.web';

// Import các kiểu dữ liệu
import { FillInBlankContent, LessonContent, QuizMcqContent, SentenceScrambleContent, PronunciationContent } from '../types/activities.types';

type Activity = Tables<'activities'>;
type Props = HomeStackScreenProps<'LessonSession'>;

// --- CÁC HÀM TYPE GUARD ĐÃ ĐƯỢC NÂNG CẤP ---
function isLessonContent(content: Json): content is LessonContent {
  return !!(content as any)?.html_content;
}
function isQuizMcqContent(content: Json): content is QuizMcqContent {
  const obj = content as any;
  // SỬA LỖI: Chấp nhận cả "question" và "question_text"
  return !!((obj?.question_text || obj?.question) && Array.isArray(obj.options) && obj.correct_answer);
}
function isSentenceScrambleContent(content: Json): content is SentenceScrambleContent {
  const obj = content as any;
  return !!(Array.isArray(obj.scrambled_words) && obj.correct_sentence);
}
function isFillInBlankContent(content: Json): content is FillInBlankContent {
  const obj = content as any;
  // SỬA LỖI: Chấp nhận cả cấu trúc "sentence_template" và "sentence_parts"
  return (
    obj &&
    (typeof obj.sentence_template === 'string' || (Array.isArray(obj.sentence_parts) && obj.sentence_parts.length === 2)) &&
    typeof obj.correct_answer === 'string'
  );
}
function isPronunciationContent(content: Json): content is PronunciationContent {
    return !!(content as any)?.text_to_pronounce;
}


const LessonSessionScreen = ({ route, navigation }: Props) => {
  const { lessonId, lessonTitle, allLessons, onComplete } = route.params;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | string[] | null>(null);
  const [feedback, setFeedback] = useState<'IDLE' | 'CORRECT' | 'INCORRECT'>('IDLE');
    const currentActivity = activities[currentIndex];
  const hint = (currentActivity?.content as any)?.hint;

  const showHint = () => {
      if (hint) {
          Alert.alert("Gợi ý ✨", hint);
      }
  };

  useEffect(() => {
    navigation.setOptions({ title: lessonTitle });
    const fetchActivities = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('activities').select('*').eq('lesson_id', lessonId).order('order');
      if (error) {
        Alert.alert("Lỗi", "Không thể tải các hoạt động của bài học.");
      } else if (data) {
        setActivities(data);
      }
      setIsLoading(false);
    };
    fetchActivities();
  }, [lessonId, lessonTitle, navigation]);

  const handleCheck = useCallback(() => {
    if (!activities[currentIndex]) return;
    const currentActivity = activities[currentIndex];
    const content = currentActivity.content;
    let isCorrect = false;

    switch (currentActivity.activity_type) {
      case 'LESSON_CONTENT':
      case 'PRONUNCIATION':
        isCorrect = true;
        break;
      case 'QUIZ_MCQ':
        if (isQuizMcqContent(content)) {
          isCorrect = userAnswer === content.correct_answer;
        }
        break;
      case 'SENTENCE_SCRAMBLE':
        // SỬA LỖI: Logic kiểm tra mạnh mẽ hơn
        if (isSentenceScrambleContent(content) && Array.isArray(userAnswer)) {
          // 1. Loại bỏ dấu câu khỏi câu trả lời của người dùng và ghép lại
          const userAnswerString = userAnswer.filter(word => !['.', '。', '?', '？', '!', '！'].includes(word)).join('');
          // 2. Loại bỏ dấu câu và khoảng trắng khỏi câu trả lời đúng
          const correctAnswerString = content.correct_sentence.replace(/[\s.。,?!？！]/g, '');
          // 3. So sánh
          isCorrect = userAnswerString === correctAnswerString;
        }
        break;
      case 'FILL_IN_BLANK':
        if (isFillInBlankContent(content)) {
          isCorrect = (userAnswer as string || "").trim().toLowerCase() === content.correct_answer.toLowerCase();
        }
        break;
      default:
        isCorrect = true;
    }
    
    setFeedback(isCorrect ? 'CORRECT' : 'INCORRECT');
  }, [activities, currentIndex, userAnswer]);

  const handleContinue = useCallback(async () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer(null);
      setFeedback('IDLE');
    } else {
      setIsLoading(true);
      try {
        await supabase.functions.invoke('complete-lesson', { body: { lesson_id: lessonId } });
        onComplete();
        const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
        const nextLesson = allLessons[currentLessonIndex + 1];
        if (nextLesson) {
          Alert.alert("Hoàn thành!", "Bạn có muốn tiếp tục đến vì sao tiếp theo không?", [
            { text: "Để sau", onPress: () => navigation.goBack(), style: "cancel" },
            { text: "Tiếp tục", onPress: () => navigation.replace('LessonSession', { ...route.params, lessonId: nextLesson.id, lessonTitle: nextLesson.title }) },
          ]);
        } else {
          Alert.alert("Chúc mừng!", "Bạn đã hoàn thành toàn bộ kỹ năng này!", [{ text: "Tuyệt vời!", onPress: () => navigation.goBack() }]);
        }
      } catch (err: any) {
        Alert.alert("Lỗi", "Không thể hoàn thành bài học: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentIndex, activities.length, navigation, lessonId, allLessons, onComplete, route.params]);

  const renderActivity = () => {
    if (!activities[currentIndex]) return null;
    const currentActivity = activities[currentIndex];
    const content = currentActivity.content;

    switch (currentActivity.activity_type) {
      case 'LESSON_CONTENT':
        if (isLessonContent(content)) return <LessonContentActivity data={content} />;
        break;
      case 'QUIZ_MCQ':
        if (isQuizMcqContent(content)) {
          // SỬA LỖI: Truyền đúng key `question` hoặc `question_text`
          const questionText = (content as any).question || content.question_text;
          return <QuizMcqActivity data={{ ...content, question_text: questionText }} selectedOption={userAnswer as string} onSelectOption={setUserAnswer} />;
        }
        break;
      case 'SENTENCE_SCRAMBLE':
        if (isSentenceScrambleContent(content)) return <SentenceScrambleActivity data={content} currentAnswer={userAnswer as string[] || []} onWordPress={(word, isFromBank) => {
          const current = (userAnswer as string[] || []);
          if (isFromBank) setUserAnswer([...current, word]);
          else {
            const index = current.indexOf(word);
            if (index > -1) {
              const newAnswer = [...current];
              newAnswer.splice(index, 1);
              setUserAnswer(newAnswer);
            }
          }
        }} />;
        break;
      case 'FILL_IN_BLANK':
        if (isFillInBlankContent(content)) return <FillInBlankActivity data={content} userAnswer={userAnswer as string} onAnswerChange={setUserAnswer} />;
        break;
      case 'PRONUNCIATION':
        if (isPronunciationContent(content)) return <PronunciationActivity data={content} navigation={navigation} />;
        break;
      default:
        return <Text style={styles.defaultText}>Hoạt động "{currentActivity.activity_type}" sắp ra mắt!</Text>;
    }
    return <Text style={styles.defaultText}>Lỗi tải dữ liệu hoạt động.</Text>;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Đang tải các vì sao...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoading && activities.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.defaultText}>Vì sao này chưa có nội dung để khám phá!</Text>
        <AppButton title="Quay lại" onPress={() => navigation.goBack()} style={{ marginTop: 20, width: '60%' }} />
      </SafeAreaView>
    );
  }

  const progress = (currentIndex + 1) / activities.length;
  const isGatewayActivity = ['PRONUNCIATION', 'LESSON_CONTENT'].includes(activities[currentIndex]?.activity_type);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        {hint && feedback === 'IDLE' && (
            <TouchableOpacity onPress={showHint} style={styles.hintButton}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={COLORS.warning} />
            </TouchableOpacity>
        )}
      </View>

      <View style={styles.activityContainer}>{renderActivity()}</View>

      <View style={styles.footer}>
        {feedback !== 'IDLE' && (
          <View style={[styles.feedbackBanner, feedback === 'CORRECT' ? styles.correctBanner : styles.incorrectBanner]}>
            <Text style={styles.feedbackText}>
              {feedback === 'CORRECT' ? 'Chính xác!' : 'Chưa đúng, hãy thử lại!'}
            </Text>
          </View>
        )}
        <AppButton
          title={isGatewayActivity ? "Tiếp tục" : (feedback === 'IDLE' ? "Kiểm tra" : "Tiếp tục")}
          onPress={isGatewayActivity ? handleContinue : (feedback === 'IDLE' ? handleCheck : handleContinue)}
          style={{ backgroundColor: COLORS.accent, borderColor: COLORS.accentDark }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  loadingText: { color: COLORS.textSecondary, marginTop: SIZES.base, fontSize: SIZES.body },
  progressContainer: { height: 10, backgroundColor: COLORS.border, borderRadius: 5, marginHorizontal: SIZES.padding, marginTop: SIZES.base, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 5 },
  activityContainer: { flex: 1, padding: SIZES.padding },
  defaultText: { color: COLORS.text, fontSize: SIZES.h3, textAlign: 'center' },
  footer: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.card },
  feedbackBanner: { padding: SIZES.padding, borderRadius: SIZES.radius, marginBottom: SIZES.padding, alignItems: 'center' },
  correctBanner: { backgroundColor: COLORS.primaryLight },
  incorrectBanner: { backgroundColor: '#FEE2E2' },
  feedbackText: { color: COLORS.primaryDark, fontWeight: 'bold', fontSize: SIZES.h3 },
    hintButton: {
    marginLeft: SIZES.base,
    padding: 4,
  },
});

export default LessonSessionScreen;