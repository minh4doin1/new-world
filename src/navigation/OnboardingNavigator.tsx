// src/navigation/OnboardingNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types/navigation'; // <-- IMPORT KIỂU TỪ FILE CHUNG

// Import các màn hình
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import LanguageSelectScreen from '../screens/onboarding/LanguageSelectScreen';
import PlacementQuizScreen from '../screens/onboarding/PlacementQuizScreen';

// "NỐI" STACK VỚI PARAMLIST
const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Bây giờ TypeScript sẽ không còn báo lỗi ở đây nữa */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="PlacementQuiz" component={PlacementQuizScreen} />
    </Stack.Navigator>
  );
};