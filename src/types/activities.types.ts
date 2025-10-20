// src/types/activities.types.ts

// Định nghĩa cấu trúc cho content của hoạt động FILL_IN_BLANK
export type FillInBlankContent = {
  sentence_parts: [string, string]; // Một mảng có đúng 2 phần tử string
  correct_answer: string;
  sentence_template?: string;
};
export type LessonContent = {
  html_content: string;
};

export type QuizMcqContent = {
  question?: string;
  question_text?: string;
  options: (string | McqOption)[];
  correct_answer?: string;
};
export type McqOption = {
  text: string;
  is_correct: boolean;
};
export type PronunciationContent = {
  text_to_pronounce: string;
};
export type SentenceScrambleContent = {
  scrambled_words?: string[];
  scrambled_sentence?: string; // Thêm trường này
  correct_sentence: string;
};

// Bạn có thể thêm các kiểu khác ở đây trong tương lai
// export type McqContent = {
//   question_text: string;
//   options: string[];
//   correct_answer: string;
// };

// Chúng ta cũng có thể tạo một kiểu chung cho tất cả các loại content
// Tạm thời comment dòng này lại để sửa lỗi
// export type ActivityContent = FillInBlankContent | McqContent;