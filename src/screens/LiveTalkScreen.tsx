// src/screens/LiveTalkScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LiveTalkScreenProps } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { COLORS, SHADOWS, SIZES } from '../theme';

// Định nghĩa kiểu cho một tin nhắn và lịch sử chat
type Message = { role: 'user' | 'model'; parts: { text: string }[] };
type ChatHistory = Message[];

const LiveTalkScreen = ({ route }: LiveTalkScreenProps) => {
  const { scenario, initialPrompt } = route.params;
  const [history, setHistory] = useState<ChatHistory>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Tin nhắn chào mừng từ AI
    setHistory([{ role: 'model', parts: [{ text: initialPrompt }] }]);
  }, [initialPrompt]);

  const handleSendMessage = useCallback(async () => {
    if (userInput.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: userInput.trim() }] };
    const updatedHistory = [...history, userMessage];

    setHistory(updatedHistory);
    setUserInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('live-talk', {
        body: { history: updatedHistory, scenario },
      });
      if (error) throw error;

      const aiMessage: Message = { role: 'model', parts: [{ text: data.reply }] };
      setHistory(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: Message = { role: 'model', parts: [{ text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." }] };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, history, scenario]);

return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={history}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.modelBubble]}>
            <Text style={item.role === 'user' ? styles.userText : styles.modelText}>{item.parts[0].text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
        inverted // Bắt đầu từ cuối danh sách
      />
      {isLoading && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Nói gì đó..."
          placeholderTextColor={COLORS.textSecondary}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={isLoading}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messageList: { padding: SIZES.padding },
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20, // Bo tròn nhiều hơn cho tin nhắn
    marginBottom: SIZES.base,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    ...SHADOWS.light,
  },
  userText: { color: COLORS.white, fontSize: SIZES.body },
  modelText: { color: COLORS.text, fontSize: SIZES.body },
  loader: { marginVertical: SIZES.base },
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.base,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    fontSize: SIZES.body,
  },
  sendButton: {
    marginLeft: SIZES.base,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
});

export default LiveTalkScreen;
