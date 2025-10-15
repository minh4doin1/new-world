// src/screens/onboarding/WelcomeScreen.tsx
import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation'; // <-- IMPORT KIỂU TỪ FILE CHUNG

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: any) => { // Sử dụng Props
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="rocket-launch" size={100} color={COLORS.accent} />
        <Text style={styles.title}>Chào mừng Nhà du hành!</Text>
        <Text style={styles.subtitle}>
          Hãy cùng bắt đầu hành trình khám phá vũ trụ ngôn ngữ. Bước đầu tiên, hãy chọn một hành tinh để hạ cánh.
        </Text>
      </View>
      <View style={styles.footer}>
        <AppButton 
          title="Bắt đầu thôi!" 
          onPress={() => navigation.navigate('LanguageSelect')} 
          style={{ backgroundColor: COLORS.accent, borderColor: COLORS.accentDark }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: SIZES.padding,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        textAlign: 'center',
        marginTop: SIZES.base,
        lineHeight: SIZES.body * 1.5,
    },
    footer: {
        paddingBottom: SIZES.padding,
    }
});

export default WelcomeScreen;