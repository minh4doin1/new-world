// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';

import CoursesListScreen from '../screens/CoursesListScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Import màn hình mới
import { Button } from 'react-native';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import QuizScreen from '../screens/QuizScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
    <Stack.Screen
      name="CoursesList"
      component={CoursesListScreen}
      options={({ navigation }) => ({
        title: 'Các khóa học',
        headerRight: () => (
          <Button onPress={() => navigation.navigate('Profile')} title="👤" />
        ),
      })}
    />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={({ route }) => ({ title: route.params.courseTitle })}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Tài khoản' }}
      />
            <Stack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={({ route }) => ({ title: route.params.lessonTitle })}
      />
            <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={({ route }) => ({ title: route.params.quizTitle })}
      />
    </Stack.Navigator>
  );
};