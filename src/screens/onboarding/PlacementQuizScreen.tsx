// src/screens/onboarding/PlacementQuizScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { supabase } from '../../services/supabaseClient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation'; // <-- IMPORT KIỂU TỪ FILE CHUNG

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PlacementQuiz'>;

// Định nghĩa kiểu cho một câu hỏi
type QuizQuestion = {
    question: string;
    options: string[];
    answer: string;
};

const PlacementQuizScreen = ({ route, navigation }: Props) => {
  const { targetLanguage } = route.params;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const generateQuiz = async () => {
      setIsLoading(true);
      try {
        // Chúng ta có thể tạo một Edge Function riêng để tạo quiz
        // Nhưng để đơn giản, hãy tạo một prompt tạm thời ở đây
        // LƯU Ý: Cách làm này sẽ lộ prompt, không an toàn cho production
        // Cách đúng là gọi một Edge Function `generate-placement-quiz`
        console.log(`Tạo quiz cho ngôn ngữ: ${targetLanguage}`);
        
        // GIẢ LẬP VIỆC TẠO QUIZ TỪ AI
        // Trong thực tế, bạn sẽ gọi một Edge Function ở đây
        let generatedQuestions: QuizQuestion[] = [];
        if (targetLanguage === 'Tiếng Anh') {
            generatedQuestions = [
                { question: "The book is ___ the table.", options: ["on", "in", "at"], answer: "on" },
                { question: "She ___ to the store yesterday.", options: ["go", "goes", "went"], answer: "went" },
                { question: "I have never ___ to Japan.", options: ["be", "been", "being"], answer: "been" },
                { question: "If I ___ you, I would study more.", options: ["am", "was", "were"], answer: "were" },
                { question: "The work was done ___ him.", options: ["by", "with", "from"], answer: "by" },
            ];
        } else if (targetLanguage === 'Tiếng Trung') {
            generatedQuestions = [
                { question: "我 ___ 学生。", options: ["是", "在", "有"], answer: "是" },
                { question: "你家有几 ___ 人？", options: ["个", "口", "本"], answer: "口" },
                { question: "他比我 ___。", options: ["高", "大", "好"], answer: "高" },
                { question: "我 ___ 去看电影。", options: ["想", "喜欢", "爱"], answer: "想" },
                { question: "这本书是 ___ 买的？", options: ["谁", "什么", "哪儿"], answer: "谁" },
            ];
        }
        setQuestions(generatedQuestions);

      } catch (error) {
        Alert.alert("Lỗi", "Không thể tạo bài kiểm tra, vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    generateQuiz();
  }, [targetLanguage]);

  const handleAnswer = (option: string) => {
    if (option === questions[currentIndex].answer) {
      setScore(s => s + 20);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      finishQuiz(score + (option === questions[currentIndex].answer ? 20 : 0));
    }
  };

  const finishQuiz = async (finalScore: number) => {
    setIsLoading(true);
    try {
        const { error } = await supabase.functions.invoke('generate-personalized-course', {
            body: { targetLanguage, placementScore: finalScore },
        });
        if (error) throw error;
        Alert.alert("Thành công!", "Hành trình của bạn đã được kiến tạo. Hãy bắt đầu khám phá!");
    } catch (err: any) {
        Alert.alert("Lỗi", "Không thể tạo khóa học. " + err.message);
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading || questions.length === 0) {
      return (
          <SafeAreaView style={styles.container}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Đang chuẩn bị câu hỏi trắc nghiệm...</Text>
          </SafeAreaView>
      )
  }

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Kiểm tra trình độ</Text>
      <View style={styles.card}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>
      <View>
        {currentQuestion.options.map((option) => (
          <AppButton 
            key={option} 
            title={option} 
            onPress={() => handleAnswer(option)} 
            style={{ marginBottom: SIZES.base * 2 }}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding, justifyContent: 'center' },
    title: { color: COLORS.text, fontSize: SIZES.h1, fontWeight: 'bold', textAlign: 'center', marginBottom: SIZES.padding * 2 },
    card: { backgroundColor: COLORS.card, padding: SIZES.padding, borderRadius: SIZES.radius, marginBottom: SIZES.padding * 2 },
    questionText: { color: COLORS.text, fontSize: SIZES.h2, textAlign: 'center' },
    loadingText: { color: COLORS.textSecondary, fontSize: SIZES.body, marginTop: SIZES.padding, textAlign: 'center' },
});

export default PlacementQuizScreen;