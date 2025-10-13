// generateContent.mjs
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
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

// --- HÀM TIỆN ÍCH ĐỂ GỌI GEMINI AN TOÀN ---
async function generateJsonFromGemini(prompt) {
  console.log("   ...Đang gửi yêu cầu đến Gemini...");
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Kỹ thuật dọn dẹp JSON để đảm bảo Gemini trả về đúng định dạng
  const cleanedText = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Lỗi parse JSON từ Gemini:", cleanedText);
    throw new Error("Gemini did not return valid JSON.");
  }
}

// --- CÁC HÀM TẠO NỘI DUNG ---

async function createActivitiesForLesson(lessonId, lessonTitle, courseType) {
  console.log(`   ➡️ Đang tạo hoạt động cho bài học: "${lessonTitle}"`);
  
  let activitiesPrompt;
  if (courseType === 'TOEIC') {
    activitiesPrompt = `
      Create 4 diverse activities for an English TOEIC preparation lesson titled "${lessonTitle}".
      The activities must be of these types: LESSON_CONTENT, PRONUNCIATION, QUIZ, CONVERSATION.
      Return a single valid JSON array. Each object must have "activity_type" and "content" keys.
      - LESSON_CONTENT: "content" is { "html_content": "A short, useful grammar explanation or vocabulary list in HTML format." }.
      - PRONUNCIATION: "content" is { "text": "A tricky English sentence common in TOEIC." }.
      - QUIZ: "content" is { "title": "Mini-Test", "questions": [ { "question_text": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A" } ] }. Create 2 questions.
      - CONVERSATION: "content" is { "scenario": "A business-related scenario.", "initial_prompt": "The first line from the AI to start the conversation." }.
    `;
  } else { // HSK
    activitiesPrompt = `
      Create 4 diverse activities for a Chinese HSK preparation lesson titled "${lessonTitle}".
      The activities must be of these types: LESSON_CONTENT, PRONUNCIATION, QUIZ, CONVERSATION.
      Return a single valid JSON array. Each object must have "activity_type" and "content" keys.
      - LESSON_CONTENT: "content" is { "html_content": "HTML content explaining a Chinese grammar point or new words with Pinyin and meaning." }.
      - PRONUNCIATION: "content" is { "text": "A Chinese sentence with challenging tones to practice." }.
      - QUIZ: "content" is { "title": "Character Practice", "questions": [ { "question_text": "What is the pinyin for '你好'?", "options": ["nǐ hǎo", "wǒ hǎo"], "correct_answer": "nǐ hǎo" } ] }. Create 2 questions.
      - CONVERSATION: "content" is { "scenario": "A daily life scenario in China.", "initial_prompt": "The first line from the AI in Chinese to start the conversation." }.
    `;
  }

  const activitiesData = await generateJsonFromGemini(activitiesPrompt);

  const activitiesToInsert = activitiesData.map((act, index) => ({
    lesson_id: lessonId,
    order: index + 1,
    activity_type: act.activity_type,
    content: act.content,
    xp_reward: 15, // Tăng XP reward
  }));

  const { error } = await supabase.from('activities').insert(activitiesToInsert);
  if (error) throw error;
  console.log(`     ✅ Đã tạo ${activitiesToInsert.length} hoạt động.`);
}

async function generateCourse(courseConfig) {
  console.log(`\n============== BẮT ĐẦU TẠO KHÓA HỌC: ${courseConfig.title} ==============`);

  const coursePrompt = `
    Design a language course based on these details:
    - Title: "${courseConfig.title}"
    - Description: "${courseConfig.description}"
    - Target Level: "${courseConfig.target_level}"
    - Number of lessons: 3
    Provide a list of 3 creative and engaging lesson titles.
    Return a single valid JSON object with a "lessons" key, which is an array of objects, each with a "title" key.
  `;
  
  const courseData = await generateJsonFromGemini(coursePrompt);
  
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: courseConfig.title,
      description: courseConfig.description,
      target_level: courseConfig.target_level,
      image_url: courseConfig.image_url
    })
    .select()
    .single();

  if (courseError) throw courseError;
  console.log(` ✅ Đã tạo khóa học: "${course.title}" (ID: ${course.id})`);

  let lessonOrder = 1;
  for (const lessonInfo of courseData.lessons) {
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({ course_id: course.id, title: lessonInfo.title, order: lessonOrder++ })
      .select()
      .single();
    if (lessonError) throw lessonError;

    await createActivitiesForLesson(lesson.id, lesson.title, courseConfig.type);
  }
}

// --- HÀM CHẠY CHÍNH ---
async function main() {
  await generateCourse({
    title: "TOEIC Cơ bản: Chinh phục 500+",
    description: "Xây dựng nền tảng vững chắc cho kỳ thi TOEIC, tập trung vào từ vựng và ngữ pháp cốt lõi.",
    target_level: "A2-B1",
    type: "TOEIC",
    image_url: "URL_TO_A_TOEIC_IMAGE" // Thay bằng link ảnh thật
  });

  await generateCourse({
    title: "Giao tiếp HSK 2: Chào bạn!",
    description: "Tự tin giao tiếp các chủ đề hàng ngày bằng tiếng Trung và nắm vững từ vựng HSK 2.",
    target_level: "HSK 2",
    type: "HSK",
    image_url: "URL_TO_A_HSK_IMAGE" // Thay bằng link ảnh thật
  });

  console.log("\n🎉🎉🎉 HOÀN TẤT TOÀN BỘ QUÁ TRÌNH TẠO NỘI DUNG! 🎉🎉🎉");
}

main().catch(console.error);