// src/types/navigation.ts
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- ĐỊNH NGHĨA CÁC STACK VÀ THAM SỐ CỦA CHÚNG ---

// Luồng chính của ứng dụng (sau khi đăng nhập)
export type AppStackParamList = {
  CoursesList: undefined;
  CourseDetail: { courseId: number; courseTitle: string };
  LessonDetail: { lessonId: number; lessonTitle: string };
  Profile: undefined;
  Quiz: { activityId: number; quizTitle: string };
  LiveTalk: { activityId: number; scenario: string; initialPrompt: string }; // Màn hình Live Talk
  Pronunciation: { activityId: number; originalText: string };
  LessonSession: { lessonId: number; lessonTitle: string };
  Home: undefined;
};

// Luồng xác thực (trước khi đăng nhập)
export type AuthStackParamList = {
  Auth: undefined;
  SignIn: undefined;
  SignUp: undefined;
};
export type AppTabParamList = {
    HomeStack: undefined;
    Profile: undefined;
}
export type OnboardingStackParamList = {
  Welcome: undefined;
  LanguageSelect: undefined;
  PlacementQuiz: { targetLanguage: string };
};

// --- ĐỊNH NGHĨA KIỂU PROPS CỤ THỂ CHO TỪNG MÀN HÌNH ---
// Đây là phần đã được sửa lỗi và bổ sung

// Props cho các màn hình trong App Stack
export type CoursesListScreenProps = NativeStackScreenProps<AppStackParamList, 'CoursesList'>;
export type CourseDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'CourseDetail'>;
export type ProfileScreenProps = NativeStackScreenProps<AppStackParamList, 'Profile'>;
export type LessonDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'LessonDetail'>;
export type QuizScreenProps = NativeStackScreenProps<AppStackParamList, 'Quiz'>;
export type LiveTalkScreenProps = NativeStackScreenProps<AppStackParamList, 'LiveTalk'>;
export type PronunciationScreenProps = NativeStackScreenProps<AppStackParamList, 'Pronunciation'>;
export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> = 
  NativeStackScreenProps<OnboardingStackParamList, T>;
export type HomeStackScreenProps<T extends keyof AppStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamList, T>,
    BottomTabScreenProps<AppTabParamList>
  >;

// Props cho các màn hình trong Auth Stack
export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;

