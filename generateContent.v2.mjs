// generateContent.v2.mjs
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// --- CẤU HÌNH ---
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  throw new Error("Missing environment variables in .env file.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
// QUAN TRỌNG: Quay lại model ổn định với giới hạn tốt hơn
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

// HÀM MỚI: Tự động "nghỉ" để tránh lỗi 429
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Đặt thời gian nghỉ (30 giây) để an toàn với giới hạn 2 RPM
const API_CALL_DELAY = 30000; 

// --- HÀM TIỆN ÍCH ĐỂ GỌI GEMINI AN TOÀN ---
async function generateJsonFromGemini(prompt) {
  console.log("   ...Đang gửi yêu cầu đến Gemini (sẽ mất một lúc)...");
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleanedText = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Lỗi parse JSON từ Gemini:", cleanedText);
    throw new Error("Gemini did not return valid JSON.");
  }
}

// --- CÁC HÀM TẠO NỘI DUNG (ĐÃ NÂNG CẤP PROMPT) ---

async function createActivitiesForLesson(lessonId, lessonTitle, courseType) {
  console.log(`   ➡️  Đang tạo các hoạt động ĐA DẠNG cho bài học: "${lessonTitle}"`);
  
  // Prompt này là trái tim của sự thay đổi, hướng dẫn Gemini tạo ra các loại quiz khác nhau
  const activitiesPrompt = `
    Create 5 highly diverse and effective learning activities for a language lesson titled "${lessonTitle}".
    The activities must be a mix of the following types: LESSON_CONTENT, QUIZ_MCQ, FILL_IN_BLANK, SENTENCE_SCRAMBLE, SENTENCE_TRANSLATION.
    Return a single valid JSON array. Each object must have "activity_type" and "content" keys, following these exact structures:
    - LESSON_CONTENT: {"html_content": "An HTML explanation of a key grammar point or vocabulary set related to the lesson title."}
    - QUIZ_MCQ: {"title": "Multiple Choice Quiz", "question_text": "A relevant question", "options": ["A", "B", "C", "D"], "correct_answer": "A"}
    - FILL_IN_BLANK: {"sentence_parts": ["Part one of the sentence ", " part two."], "correct_answer": "missing word"}
    - SENTENCE_SCRAMBLE: {"scrambled_words": ["word1", "word2", "word3"], "correct_sentence": "word1 word2 word3"}
    - SENTENCE_TRANSLATION: {"source_sentence": "The sentence in Vietnamese to be translated.", "target_sentence": "The correct translation."}
  `;

  const activitiesData = await generateJsonFromGemini(activitiesPrompt);

  const activitiesToInsert = activitiesData.map((act, index) => ({
    lesson_id: lessonId,
    order: index + 1,
    activity_type: act.activity_type,
    content: act.content,
    xp_reward: 25,
  }));

  const { error } = await supabase.from('activities').insert(activitiesToInsert);
  if (error) throw error;
  console.log(`     ✅ Đã tạo thành công ${activitiesToInsert.length} hoạt động tương tác.`);
}

async function generateCourse(courseConfig) {
  console.log(`\n============== BẮT ĐẦU TẠO KHÓA HỌC: ${courseConfig.title} ==============`);

  const coursePrompt = `
    Design a comprehensive language course with 8 detailed lesson titles based on these requirements:
    - Course Title: "${courseConfig.title}"
    - Course Description: "${courseConfig.description}"
    - Target Level: "${courseConfig.target_level}"
    The lesson titles must be engaging, specific, and logically progressive.
    Return a single valid JSON object with a "lessons" key, which is an array of 8 objects, each with a "title" key.
  `;
  
  const courseData = await generateJsonFromGemini(coursePrompt);
  
  // --- THAY ĐỔI Ở ĐÂY ---
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: courseConfig.title,
      description: courseConfig.description,
      target_level: courseConfig.target_level,
      image_url: courseConfig.image_url,
      language: courseConfig.language, // <-- Thêm trường language vào lệnh insert
    })
    .select()
    .single();
  // -----------------------

  if (courseError) throw courseError;
  console.log(` ✅ Đã tạo khóa học: "${course.title}" (Ngôn ngữ: ${course.language})`);

  let lessonOrder = 1;
  for (const lessonInfo of courseData.lessons) {
    console.log(`\n--- Đang chuẩn bị tạo bài học ${lessonOrder}/${courseData.lessons.length}. Tạm nghỉ ${API_CALL_DELAY / 1000} giây... ---`);
    await sleep(API_CALL_DELAY);

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({ course_id: course.id, title: lessonInfo.title, order: lessonOrder++ })
      .select()
      .single();
    if (lessonError) throw lessonError;

    await createActivitiesForLesson(lesson.id, lesson.title, courseConfig.type);
  }
}

// --- HÀM main() ĐÃ ĐƯỢC CẬP NHẬT ---
async function main() {
  // Xóa các khóa học cũ để làm mới (Tùy chọn)
  console.log("Đang xóa các khóa học cũ...");
  await supabase.from('courses').delete().neq('id', 0);

  await generateCourse({
    title: "Tiếng Anh C2 Chuyên sâu: Làm chủ Ngôn ngữ",
    description: "Khóa học đỉnh cao dành cho người muốn đạt đến trình độ thông thạo như người bản xứ.",
    target_level: "C2",
    type: "C2_ENGLISH",
    language: "Tiếng Anh", // <-- THÊM TAG
    image_url: "URL_TO_A_C2_ENGLISH_IMAGE" 
  });
  
  console.log(`\n--- HOÀN TẤT KHÓA HỌC ĐẦU TIÊN. Tạm nghỉ ${API_CALL_DELAY / 1000} giây... ---`);
  await sleep(API_CALL_DELAY);

  await generateCourse({
    title: "Chinh phục HSK 4 Toàn diện",
    description: "Nắm vững 1200 từ vựng và các điểm ngữ pháp cốt lõi của HSK 4.",
    target_level: "HSK 4",
    type: "HSK_4",
    language: "Tiếng Trung", // <-- THÊM TAG
    image_url: "URL_TO_A_HSK_4_IMAGE"
  });

  console.log("\n🎉🎉🎉 HOÀN TẤT TOÀN BỘ QUÁ TRÌNH TẠO NỘI DUNG! 🎉🎉🎉");
}

main().catch(console.error);