// src/screens/PronunciationScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { PronunciationScreenProps } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { AppButton } from '../components/AppButton';
import { COLORS, SHADOWS, SIZES } from '../theme';

const PronunciationScreen = ({ route }: PronunciationScreenProps) => {
  const { originalText, activityId } = route.params;
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setRecognizedText(text);
        getFeedbackFromAI(text);
      }
      setIsRecording(false);
    };
    const onSpeechError = (e: any) => {
      console.error(e);
      setIsRecording(false);
    };
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const getFeedbackFromAI = async (recognized: string) => {
    setIsLoading(true);
    setFeedback('');
    try {
      const { data, error } = await supabase.functions.invoke('pronunciation-feedback-gemini', {
        body: { original_text: originalText, recognized_text: recognized },
      });
      if (error) throw error;
      setFeedback(data.feedback_from_ai);
      // (Tùy chọn) Gọi function complete-activity ở đây nếu điểm số tốt
    } catch (e) {
      Alert.alert("Lỗi", "Không thể nhận phản hồi từ AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      await Voice.stop();
      setIsRecording(false);
    } else {
      setRecognizedText('');
      setFeedback('');
      try {
        await Voice.start('en-US'); // Hoặc mã ngôn ngữ khác
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.promptTitle}>Hãy đọc câu sau:</Text>
        <Text style={styles.originalText}>{originalText}</Text>
      </View>
      <AppButton
        title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
        onPress={handleRecord}
        variant={isRecording ? 'danger' : 'primary'}
      />
      {(isLoading || recognizedText || feedback) && (
        <View style={[styles.card, styles.resultsCard]}>
          {isLoading && <ActivityIndicator size="large" />}
          {recognizedText && <Text style={styles.resultTitle}>Tôi nghe được: "{recognizedText}"</Text>}
          {feedback && <Text style={styles.feedbackText}>{feedback}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    alignItems: 'center',
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
  micContainer: {
    alignItems: 'center',
    marginVertical: SIZES.padding * 2,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  micIcon: {
    fontSize: 30,
  },
  micLabel: {
    marginTop: SIZES.base,
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  resultsCard: {
    marginTop: SIZES.padding,
  },
  resultTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  recognizedText: {
    fontSize: SIZES.body,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  feedbackCard: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: SIZES.body * 1.5,
  },
});
export default PronunciationScreen;