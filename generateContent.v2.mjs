import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// --- CẤU HÌNH ---
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  throw new Error("Vui lòng kiểm tra lại các biến môi trường trong file .env.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const API_CALL_DELAY = 15000; // 15 giây

/**
 * Hàm gọi Gemini an toàn, tối ưu cho việc trả về JSON.
 * @param {string} prompt - Câu lệnh prompt để gửi.
 * @param {string} agentName - Tên của "AI Agent" để logging.
 * @returns {Promise<any>} - Dữ liệu JSON đã được parse.
 */
async function generateJsonFromGemini(prompt, agentName) {
  console.log(`    >> [${agentName}] Đang gửi yêu cầu đến Gemini...`);
  await sleep(API_CALL_DELAY);

  for (let i = 0; i < 5; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (!jsonMatch) throw new Error("Phản hồi không chứa JSON hợp lệ.");
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error(`       ❌ Lỗi từ [${agentName}] (lần ${i + 1}): ${e.message}. Đang thử lại...`);
      if (i < 1) await sleep(API_CALL_DELAY * 2);
      else throw e;
    }
  }
}

/**
 * Giai đoạn 3.1: AI Content Creator - Tạo activities cho một bài học thông thường.
 */
async function generateLessonActivities(lesson, context) {
  console.log(`      >> [Content Creator] Đang tạo activities cho Lesson: "${lesson.title.vi}"`);
  const prompt = `
    You are a Master Language Teacher creating engaging activities for Vietnamese speakers learning ${context.language}.
    Generate exactly 5 activities for the lesson: "${lesson.title.vi}".
    Learning Goal: "${lesson.goal}".
    This lesson is part of the unit "${context.unit_title.vi}" in the course "${context.course_title.vi}".

    Your ENTIRE response MUST be a single, valid JSON array of 5 activity objects. Do not add any text outside the JSON array.

    ACTIVITY REQUIREMENTS:
    1.  FIRST activity MUST be 'LESSON_CONTENT'. The "html_content" must be a DETAILED, FUN, and INTERESTING explanation in Vietnamese. Use <h2>, <p>, <ul>, <li>, <strong>. Include practical examples in ${context.language} (with Vietnamese translation), cultural notes, common mistakes, and maybe a small dialogue.
    2.  The other 4 activities MUST be a mix of 'QUIZ_MCQ', 'FILL_IN_BLANK', 'SENTENCE_SCRAMBLE'.
    3.  ALL content within these 4 activities must be in the target language (${context.language}). For Chinese, include pinyin.
    4.  CRITICAL: Every activity MUST include a "hint" key in its "content" object. The hint must be a short, helpful tip in Vietnamese.
  `;
  try {
    const activitiesData = await generateJsonFromGemini(prompt, 'Content Creator');
    const activitiesToInsert = activitiesData.map((act, index) => ({
      lesson_id: lesson.id, order: index + 1, activity_type: act.activity_type, content: act.content,
    }));
    await supabase.from('activities').insert(activitiesToInsert);
    console.log(`         ✅ Đã tạo ${activitiesToInsert.length} activities.`);
  } catch (e) {
    console.error(`         ❌ Lỗi nghiêm trọng khi tạo activities cho Lesson ID ${lesson.id}. Bỏ qua.`, e.message);
  }
}

/**
 * Giai đoạn 3.2: AI Examiner - Tạo activities cho một bài TEST.
 */
async function generateUnitTestActivities(testLesson, context) {
  console.log(`      >> [Examiner] Đang soạn đề thi cho Unit Test: "${testLesson.title.vi}"`);
  const prompt = `
    You are an AI Examiner, creating a comprehensive test for Vietnamese speakers learning ${context.language}.
    This test is for the end of the unit: "${context.unit_title.vi}".
    This unit covered these topics: ${context.lesson_goals.map(g => `"${g}"`).join(', ')}.

    Generate exactly 8 challenging test activities covering ALL the topics above.
    The response MUST be a single, valid JSON array of 8 activity objects. Do not add comments or markdown.
    The activities must be a mix of 'QUIZ_MCQ', 'FILL_IN_BLANK', 'SENTENCE_SCRAMBLE', 'SENTENCE_TRANSLATION'.
    Every activity MUST have a "hint" in Vietnamese.
    For Chinese, include pinyin in all questions and answers.
  `;
  try {
    const activitiesData = await generateJsonFromGemini(prompt, 'Examiner');
    const activitiesToInsert = activitiesData.map((act, index) => ({
      lesson_id: testLesson.id, order: index + 1, activity_type: act.activity_type, content: act.content, xp_reward: 25,
    }));
    await supabase.from('activities').insert(activitiesToInsert);
    console.log(`         ✅ Đã tạo ${activitiesToInsert.length} câu hỏi cho bài test.`);
  } catch (e) {
    console.error(`         ❌ Lỗi nghiêm trọng khi tạo bài test cho Lesson ID ${testLesson.id}. Bỏ qua.`, e.message);
  }
}

/**
 * Giai đoạn 2: AI Unit Planner - Lên kế hoạch chi tiết cho một Unit.
 */
async function generateUnitContent(unitData, course, unitOrder) {
  const { data: unit, error: unitError } = await supabase
    .from('units').insert({ course_id: course.id, title: unitData.unit_title, order: unitOrder }).select().single();
  if (unitError) { console.error(`   ❌ Lỗi tạo Unit DB record: ${unitError.message}`); return; }
  console.log(`\n  -> [Unit Planner] Lên kế hoạch cho Unit ${unitOrder}: "${unit.title.vi}" (ID: ${unit.id})`);

  const prompt = `
    You are a CEFR Curriculum Designer for Vietnamese learners.
    Your task is to create a detailed lesson plan for a single unit within a ${course.title.vi} course.
    The unit is titled: "${unit.title.vi}".

    The response MUST be a single, valid JSON object with a "skills" key.
    Each skill must contain "lessons". All titles must be BILINGUAL and CONCISE.
    Structure:
    {
      "skills": [
        {
          "skill_title": { ${course.target_language === 'Tiếng Anh' ? '"en": "...", "vi": "..."' : '"zh": "...", "pinyin": "...", "vi": "..."'} },
          "skill_icon": "...",
          "lessons": [
            { "lesson_title": { /* Bilingual */ }, "goal": "A short learning goal in Vietnamese." }
          ]
        }
      ]
    }
    Generate ${learningPathConfigs.find(c=>c.language===course.target_language).num_skills_per_unit} skills.
    Each skill should have ${learningPathConfigs.find(c=>c.language===course.target_language).num_lessons_per_skill} lessons.
  `;

  try {
    const unitPlan = await generateJsonFromGemini(prompt, 'Unit Planner');
    let lessonGoalsForTest = [];
    
    let skillOrder = 1;
    for (const skillData of unitPlan.skills) {
      const { data: skill, error: skillError } = await supabase
        .from('skills').insert({ unit_id: unit.id, title: skillData.skill_title, icon_name: skillData.skill_icon, order: skillOrder++ }).select().single();
      if (skillError) { console.error(`     ❌ Lỗi tạo Skill DB record: ${skillError.message}`); continue; }
      console.log(`    -> Đang xử lý Skill: "${skill.title.vi}"`);

      let lessonOrder = 1;
      for (const lessonData of skillData.lessons) {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons').insert({ skill_id: skill.id, title: lessonData.lesson_title, order: lessonOrder++ }).select().single();
        if (lessonError) { console.error(`       ❌ Lỗi tạo Lesson DB record: ${lessonError.message}`); continue; }
        
        lessonGoalsForTest.push(lessonData.goal);
        await generateLessonActivities({ ...lesson, ...lessonData }, { course_title: course.title, unit_title: unit.title, language: course.target_language });
      }
    }
    
    // TẠO BÀI TEST CUỐI UNIT
    console.log(`    -> Chuẩn bị tạo Unit Test...`);
    const testTitle = course.target_language === 'Tiếng Anh'
        ? { en: `Unit ${unitOrder} Test`, vi: `Bài kiểm tra Unit ${unitOrder}` }
        : { zh: `第${unitOrder}单元测验`, pinyin: `Dì ${unitOrder} dānyuán cèyàn`, vi: `Bài kiểm tra Unit ${unitOrder}` };
        
    const { data: testLesson, error: testError } = await supabase
      .from('lessons').insert({ skill_id: unitPlan.skills[unitPlan.skills.length - 1].db_id, title: testTitle, order: 99, is_test: true }).select().single();
    if (testError) throw new Error(testError.message);
    
    await generateUnitTestActivities(testLesson, {
      course_title: course.title, unit_title: unit.title, language: course.target_language, lesson_goals: lessonGoalsForTest
    });

  } catch (e) {
    console.error(`   ❌ Lỗi nghiêm trọng khi lập kế hoạch cho Unit ID ${unit.id}. Bỏ qua Unit này.`, e.message);
  }
}

/**
 * Giai đoạn 1: AI Architect - Lên kế hoạch tổng thể cho một Khóa học.
 */
async function generateCourse(config) {
  console.log(`\n============== [ARCHITECT] BẮT ĐẦU THIẾT KẾ KHÓA HỌC: ${config.language} (${config.target_level}) ==============`);
  
  const courseTitle = config.language === 'Tiếng Anh'
    ? { en: `English Path: ${config.target_level}`, vi: `Hành trình Tiếng Anh: ${config.target_level}` }
    : { zh: `汉语之路: ${config.target_level}`, pinyin: `Hànyǔ zhī lù: ${config.target_level}`, vi: `Con đường Hán ngữ: ${config.target_level}` };

  const { data: course, error: courseError } = await supabase
    .from('courses').insert({ title: courseTitle, target_language: config.language, description: { vi: `Khóa học ${config.language} toàn diện từ ${config.start_level} đến ${config.target_level}` } }).select().single();
  if (courseError) throw new Error(`Lỗi tạo Course: ${courseError.message}`);
  console.log(`> [Architect] Đã tạo Course "${course.title.vi}" (ID: ${course.id})`);

  const prompt = `
    You are an AI Language Course Architect for Vietnamese learners.
    Design the high-level structure for a "${config.language}" course, taking learners from ${config.start_level} to ${config.target_level}.
    Your task is to generate a list of unit titles. Each title should represent a clear step in the learning journey.

    The response MUST be a single, valid JSON object with a "units" key, containing an array of ${config.num_units} objects.
    All "unit_title" fields must be BILINGUAL and CONCISE.

    Example Structure:
    {
      "units": [
        { "unit_title": { ${config.language === 'Tiếng Anh' ? '"en": "...", "vi": "..."' : '"zh": "...", "pinyin": "...", "vi": "..."'} } }
      ]
    }
  `;

  try {
    const coursePlan = await generateJsonFromGemini(prompt, 'Architect');
    console.log(`> [Architect] Đã nhận được kế hoạch cho ${coursePlan.units.length} units.`);
    
    let unitOrder = 1;
    for (const unitData of coursePlan.units) {
      await generateUnitContent(unitData, course, unitOrder++);
    }
    // TODO: Tạo bài test lớn cuối khóa học
  } catch(e) {
    console.error(`❌ Lỗi nghiêm trọng khi thiết kế Course ${course.id}. Dừng khóa học này.`, e.message);
  }
}


// --- CẤU HÌNH CÁC LỘ TRÌNH HỌC ---
const learningPathConfigs = [
  {
    language: "Tiếng Anh",
    start_level: "A2",
    target_level: "B1",
    num_units: 5,
    num_skills_per_unit: 2, // 2 kỹ năng chính
    num_lessons_per_skill: 5, // 5 bài học nhỏ cho mỗi kỹ năng -> 10 bài học/unit
  },
  {
    language: "Tiếng Trung",
    start_level: "HSK 3",
    target_level: "HSK 4",
    num_units: 6,
    num_skills_per_unit: 2,
    num_lessons_per_skill: 5,
  },
];

async function main() {
  console.log("BẮT ĐẦU QUY TRÌNH KIẾN TẠO NỘI DUNG V3. VIỆC NÀY SẼ RẤT, RẤT LÂU...");
  
  console.log(">> Đang xóa tất cả dữ liệu học tập cũ để tạo mới...");
  await supabase.from('user_lesson_mastery').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('activities').delete().neq('id', 0);
  await supabase.from('lessons').delete().neq('id', 0);
  await supabase.from('skills').delete().neq('id', 0);
  await supabase.from('units').delete().neq('id', 0);
  await supabase.from('courses').delete().neq('id', 0);
  console.log("   ✅ Đã xóa dữ liệu cũ.");

  for (const config of learningPathConfigs) {
    await generateCourse(config);
  }
  
  console.log("\n🎉🎉🎉 HOÀN TẤT! Toàn bộ nội dung học tập đã được kiến tạo. 🎉🎉🎉");
}

main().catch(console.error);