// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppStackParamList } from '../types/navigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

// Import các màn hình
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import LiveTalkScreen from '../screens/LiveTalkScreen';
import PronunciationScreen from '../screens/PronunciationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AppStackParamList>();

// Tạo một Stack riêng cho luồng Home -> Lesson -> Activity
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{  headerTintColor: COLORS.primary }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen} 
        options={({ route }) => ({ 
          title: route.params.lessonTitle,
          headerStyle: { backgroundColor: COLORS.background }, // Thêm style cho đồng bộ
          headerShadowVisible: false, // Bỏ đường gạch chân dưới header
        })} 
      />
      <Stack.Screen name="Quiz" component={QuizScreen} options={({ route }) => ({ title: route.params.quizTitle, headerShadowVisible: false })}  />
      <Stack.Screen name="LiveTalk" component={LiveTalkScreen} options={{ title: 'Luyện Giao tiếp' , headerShadowVisible: false}} />
      <Stack.Screen name="Pronunciation" component={PronunciationScreen} options={{ title: 'Luyện Phát âm', headerShadowVisible: false }} />
    </Stack.Navigator>
  );
};

// Đây là Navigator chính của ứng dụng
export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;
          if (route.name === 'HomeStack') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'account-circle';
          } else {
            iconName = 'help-circle'; // Thêm một trường hợp mặc định để đảm bảo iconName không bao giờ undefined
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: 'Học' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
};