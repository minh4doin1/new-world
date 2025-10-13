// src/types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- ĐỊNH NGHĨA CÁC STACK VÀ THAM SỐ CỦA CHÚNG ---

// Luồng chính của ứng dụng (sau khi đăng nhập)
export type AppStackParamList = {
  CoursesList: undefined;
  CourseDetail: { courseId: number; courseTitle: string };
  LessonDetail: { lessonId: number; lessonTitle: string }; // MÀN HÌNH MỚI
  Profile: undefined;
  Quiz: { activityId: number; quizTitle: string };
};

// Luồng xác thực (trước khi đăng nhập)
export type AuthStackParamList = {
  Auth: undefined;
  SignIn: undefined;
  SignUp: undefined;
};


// --- ĐỊNH NGHĨA KIỂU PROPS CỤ THỂ CHO TỪNG MÀN HÌNH ---
// Đây là phần đã được sửa lỗi và bổ sung

// Props cho các màn hình trong App Stack
export type CoursesListScreenProps = NativeStackScreenProps<AppStackParamList, 'CoursesList'>;
export type CourseDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'CourseDetail'>;
export type ProfileScreenProps = NativeStackScreenProps<AppStackParamList, 'Profile'>;

// Props cho các màn hình trong Auth Stack
export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;

export type LessonDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'LessonDetail'>;
export type QuizScreenProps = NativeStackScreenProps<AppStackParamList, 'Quiz'>;