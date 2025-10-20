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
import { PronunciationActivity } from '../components/activities/PronunciationActivity';

// Import các kiểu dữ liệu đã được cập nhật
import { FillInBlankContent, LessonContent, QuizMcqContent, SentenceScrambleContent, PronunciationContent, McqOption } from '../types/activities.types';

type Activity = Tables<'activities'>;
type Props = HomeStackScreenProps<'LessonSession'>;

// --- CÁC HÀM TYPE GUARD ĐÃ SỬA LỖI ---
function isLessonContent(content: Json): content is LessonContent {
  return typeof (content as LessonContent)?.html_content === 'string';
}

function isQuizMcqContent(content: Json): content is QuizMcqContent {
  const obj = content as QuizMcqContent;
  const hasQuestion = !!(obj.question_text || obj.question);
  const hasOptions = Array.isArray(obj.options);
  const hasCorrectAnswer = typeof obj.correct_answer === 'string' || (hasOptions && obj.options.some(opt => (opt as McqOption).is_correct === true));
  return hasQuestion && hasOptions && hasCorrectAnswer;
}

function isSentenceScrambleContent(content: Json): content is SentenceScrambleContent {
  const obj = content as SentenceScrambleContent;
  return !!((Array.isArray(obj.scrambled_words) || typeof obj.scrambled_sentence === 'string') && obj.correct_sentence);
}

function isFillInBlankContent(content: Json): content is FillInBlankContent {
  const obj = content as FillInBlankContent;
  return !!((typeof obj.sentence_template === 'string' || Array.isArray(obj.sentence_parts)) && typeof obj.correct_answer === 'string');
}

function isPronunciationContent(content: Json): content is PronunciationContent {
  return typeof (content as PronunciationContent)?.text_to_pronounce === 'string';
}


const LessonSessionScreen = ({ route, navigation }: Props) => {
  const { lessonId, lessonTitle, allLessons, onComplete } = route.params;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | string[] | null>(null);
  const [feedback, setFeedback] = useState<'IDLE' | 'CORRECT' | 'INCORRECT'>('IDLE');

  useEffect(() => {
    navigation.setOptions({ title: lessonTitle });
    const fetchActivities = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('activities').select('*').eq('lesson_id', lessonId).order('order');
      if (error) {
        Alert.alert("Lỗi", "Không thể tải các hoạt động của bài học.");
      } else {
        setActivities(data || []);
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
          const correctAnswer = content.correct_answer || (content.options.find(opt => (opt as McqOption).is_correct === true) as McqOption)?.text;
          isCorrect = userAnswer === correctAnswer;
        }
        break;
      case 'SENTENCE_SCRAMBLE':
        if (isSentenceScrambleContent(content) && Array.isArray(userAnswer)) {
          const userAnswerString = userAnswer.join('').replace(/[\s.。,?!？！]/g, '');
          const correctAnswerString = content.correct_sentence.replace(/[\s.。,?!？！]/g, '');
          isCorrect = userAnswerString.toLowerCase() === correctAnswerString.toLowerCase();
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
          const standardizedContent = {
            question_text: content.question || content.question_text || '',
            options: content.options.map(opt => typeof opt === 'string' ? opt : opt.text),
          };
          return <QuizMcqActivity data={standardizedContent} selectedOption={userAnswer as string} onSelectOption={setUserAnswer} />;
        }
        break;
      case 'SENTENCE_SCRAMBLE':
        if (isSentenceScrambleContent(content)) {
            const standardizedContent = {
                scrambled_words: Array.isArray(content.scrambled_words) ? content.scrambled_words : (content.scrambled_sentence || '').split(' '),
                correct_sentence: content.correct_sentence
            };
            return <SentenceScrambleActivity data={standardizedContent} currentAnswer={userAnswer as string[] || []} onWordPress={(word, isFromBank) => {
                const current = (userAnswer as string[] || []);
                if (isFromBank) {
                    setUserAnswer([...current, word]);
                } else {
                  // Allow removing a word by clicking on it in the answer area
                  const indexToRemove = current.indexOf(word);
                  if (indexToRemove > -1) {
                      const newAnswer = [...current];
                      newAnswer.splice(indexToRemove, 1);
                      setUserAnswer(newAnswer);
                  }
                }
            }} />;
        }
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
  const currentActivity = activities[currentIndex];
  const hint = (currentActivity?.content as any)?.hint;
  const showHint = () => { if (hint) { Alert.alert("Gợi ý ✨", hint); } };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
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
          title={['PRONUNCIATION', 'LESSON_CONTENT'].includes(activities[currentIndex]?.activity_type) ? "Tiếp tục" : (feedback === 'IDLE' ? "Kiểm tra" : "Tiếp tục")}
          onPress={['PRONUNCIATION', 'LESSON_CONTENT'].includes(activities[currentIndex]?.activity_type) ? handleContinue : (feedback === 'IDLE' ? handleCheck : handleContinue)}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.base,
  },
  progressContainer: { 
    flex: 1,
    height: 10, 
    backgroundColor: COLORS.border, 
    borderRadius: 5, 
    overflow: 'hidden' 
  },
  progressBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 5 },
  hintButton: {
    marginLeft: SIZES.base,
    padding: 4,
  },
  activityContainer: { flex: 1, padding: SIZES.padding },
  defaultText: { color: COLORS.text, fontSize: SIZES.h3, textAlign: 'center' },
  footer: { padding: SIZES.padding, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.card },
  feedbackBanner: { padding: SIZES.padding, borderRadius: SIZES.radius, marginBottom: SIZES.padding, alignItems: 'center' },
  correctBanner: { backgroundColor: COLORS.primaryLight },
  incorrectBanner: { backgroundColor: '#FEE2E2' },
  feedbackText: { color: COLORS.primaryDark, fontWeight: 'bold', fontSize: SIZES.h3 },
});

export default LessonSessionScreen;