// src/screens/onboarding/LanguageSelectScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, SIZES } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation'; // <-- IMPORT KIỂU TỪ FILE CHUNG


type Props = NativeStackScreenProps<OnboardingStackParamList, 'LanguageSelect'>;
type Language = {
    id: string;
    name: string;
    flag: string;
}

const LANGUAGES = [
  { id: 'en', name: 'Tiếng Anh', flag: '🇬🇧' },
  { id: 'zh', name: 'Tiếng Trung', flag: '🇨🇳' },
  { id: 'ja', name: 'Tiếng Nhật', flag: '🇯🇵' },
  { id: 'ko', name: 'Tiếng Hàn', flag: '🇰🇷' },
];

const LanguageSelectScreen = ({ navigation }: any) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Định nghĩa kiểu cho `item`
  const renderItem = ({ item }: { item: Language }) => {
    const isSelected = selectedLanguage === item.name;
    return (
      <TouchableOpacity 
        style={[styles.card, isSelected && styles.cardSelected]} 
        onPress={() => setSelectedLanguage(item.name)}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={styles.languageName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bạn muốn học ngôn ngữ nào?</Text>
      <FlatList
        data={LANGUAGES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <View style={styles.footer}>
        <AppButton 
          title="Tiếp tục" 
          onPress={() => {
            if (selectedLanguage) {
              navigation.navigate('PlacementQuiz', { targetLanguage: selectedLanguage });
            }
          }}
          disabled={!selectedLanguage}
          style={{ backgroundColor: COLORS.accent, borderColor: COLORS.accentDark }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding },
    title: { color: COLORS.text, fontSize: SIZES.h1, fontWeight: 'bold', textAlign: 'center', marginBottom: SIZES.padding },
    card: {
        backgroundColor: COLORS.card,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginBottom: SIZES.base * 2,
    },
    cardSelected: {
        borderColor: COLORS.accent,
        backgroundColor: COLORS.primaryLight,
    },
    flag: { fontSize: 30, marginRight: SIZES.padding },
    languageName: { color: COLORS.text, fontSize: SIZES.h3, fontWeight: 'bold' },
    footer: { paddingBottom: SIZES.padding },
});

export default LanguageSelectScreen;