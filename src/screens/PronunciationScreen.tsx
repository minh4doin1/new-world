// src/screens/PronunciationScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
// FIX 1: Import the singleton instance AND the necessary types/enums
import audioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import { WaveFile } from 'wavefile';

import { PronunciationScreenProps } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { AppButton } from '../components/AppButton';
import { COLORS, SIZES } from '../theme';

// --- CÁC KIỂU DỮ LIỆU VÀ HẰNG SỐ ---
const REQUIRED_SAMPLE_RATE = 16000;

type PronunciationFeedback = {
  overall_score: number;
  feedback_summary: string;
  word_analysis: {
    word: string;
    score: number;
    comment: string;
  }[];
};

// --- COMPONENT CHÍNH ---
const PronunciationScreen = ({ route }: PronunciationScreenProps) => {
  const { originalText } = route.params;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState('Nhấn để bắt đầu ghi âm');
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  
  const geminiSessionRef = useRef<any | null>(null);

  useEffect(() => {
    return () => {
      if (geminiSessionRef.current) {
        geminiSessionRef.current.close();
      }
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const onStartRecord = async () => {
    try {
      setFeedback(null);
      setStatusText('Đang ghi âm...');
      
      const path = Platform.OS === 'android' ? undefined : 'pronunciation.m4a';

      // FIX 2: Create a correctly typed AudioSet object
      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
        // FIX 3: Use the correct property name `audioSamplingRate`
        audioSamplingRate: REQUIRED_SAMPLE_RATE,
      };
      
      await audioRecorderPlayer.startRecorder(path, audioSet);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setStatusText('Lỗi, không thể ghi âm.');
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm. Vui lòng kiểm tra quyền truy cập micro.');
    }
  };

  const onStopRecord = async () => {
    try {
      const audioFilePath = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      setStatusText('Đã ghi âm xong. Đang xử lý...');
      await handleGetFeedback(audioFilePath);
    } catch (err) {
      console.error('Failed to stop recording', err);
      setStatusText('Lỗi, không thể dừng ghi âm.');
    }
  };

  const handleGetFeedback = async (audioFilePath: string) => {
    setIsLoading(true);
    
    try {
      setStatusText('Đang lấy quyền truy cập...');
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('generate-gemini-token');
      if (tokenError) throw new Error(`Cannot get Gemini token: ${tokenError.message}`);
      
      const ai = new GoogleGenerativeAI(tokenData.token);

      const model = "gemini-2.5-flash-native-audio-preview-09-2025";
      const prompt = `You are an expert English pronunciation coach. Analyze the user's pronunciation in the provided audio. The user was trying to say: "${originalText}". Provide feedback in a structured JSON format with keys: "overall_score", "feedback_summary", "word_analysis". Do not include any text outside the JSON object.`;
      
      const config = { systemInstruction: prompt };

      setStatusText('Đang chuẩn bị dữ liệu âm thanh...');
      const response = await fetch(audioFilePath);
      const audioBlob = await response.blob();
      const buffer = await audioBlob.arrayBuffer();

      const wav = new WaveFile();
      wav.fromBuffer(new Uint8Array(buffer));
      wav.toSampleRate(REQUIRED_SAMPLE_RATE);
      wav.toBitDepth("16");
      const base64Audio = wav.toBase64();

      setStatusText('AI đang phân tích...');
      const responseQueue: any[] = [];
      
      const session = await (ai as any).live.connect({
        model: model,
        config: config,
        callbacks: {
          onmessage: (message: any) => responseQueue.push(message),
          onerror: (e: any) => { throw new Error(`Gemini Session Error: ${e.message}`); },
        },
      });
      geminiSessionRef.current = session;

      session.sendRealtimeInput({
        audio: { data: base64Audio, mimeType: `audio/pcm;rate=${REQUIRED_SAMPLE_RATE}` }
      });

      let turnComplete = false;
      let fullResponseText = "";
      while (!turnComplete) {
        const message = responseQueue.shift();
        if (message) {
          if (message.serverContent?.turnComplete) {
            turnComplete = true;
          }
          if (message.serverContent?.content?.parts?.[0]?.text) {
            fullResponseText += message.serverContent.content.parts[0].text;
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      
      session.close();
      geminiSessionRef.current = null;
      
      const jsonString = fullResponseText.replace(/```json\n?|```/g, '').trim();
      const feedbackJson = JSON.parse(jsonString);
      setFeedback(feedbackJson);
      setStatusText('Đã có kết quả!');

    } catch (err: any) {
      console.error(err);
      Alert.alert('Lỗi Phân tích', err.message || 'Đã có lỗi xảy ra.');
      setStatusText('Gặp lỗi, hãy thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.promptTitle}>Hãy đọc câu sau:</Text>
        <Text style={styles.originalText}>{originalText}</Text>
      </View>

      <AppButton
        title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
        onPress={isRecording ? onStopRecord : onStartRecord}
        variant={isRecording ? 'danger' : 'primary'}
        loading={isLoading}
        disabled={isLoading}
      />
      <Text style={styles.statusText}>{statusText}</Text>

      {feedback && (
        <View style={[styles.card, styles.resultsCard]}>
          <Text style={styles.resultTitle}>Kết quả Phân tích</Text>
          <View style={styles.summaryContainer}>
            <Text style={[styles.overallScore, { color: getScoreColor(feedback.overall_score) }]}>
              {feedback.overall_score}/100
            </Text>
            <Text style={styles.feedbackSummary}>{feedback.feedback_summary}</Text>
          </View>
          
          <View style={styles.wordAnalysisContainer}>
            {feedback.word_analysis.map((word, index) => (
              <View key={index} style={styles.wordChip}>
                <Text style={styles.wordText}>{word.word}</Text>
                <Text style={[styles.wordScore, { color: getScoreColor(word.score) }]}>{word.score}</Text>
                <Text style={styles.wordComment}>{word.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  statusText: {
    marginTop: SIZES.base,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  resultsCard: {
    marginTop: SIZES.padding,
  },
  resultTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.padding,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: SIZES.base,
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  feedbackSummary: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
  wordAnalysisContainer: {},
  wordChip: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius / 2,
    padding: SIZES.base,
    marginBottom: SIZES.base,
  },
  wordText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  wordScore: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  wordComment: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default PronunciationScreen;