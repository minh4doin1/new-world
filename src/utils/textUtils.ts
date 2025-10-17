// src/utils/textUtils.ts
import { BilingualText } from '../types/common.types';

/**
 * Trích xuất chuỗi văn bản phù hợp để hiển thị từ một đối tượng BilingualText.
 * Ưu tiên ngôn ngữ gốc (en/zh), sau đó là pinyin, cuối cùng là tiếng Việt.
 * @param titleObj - Đối tượng title từ CSDL (kiểu jsonb).
 * @param preferredLang - Ngôn ngữ ưu tiên ('en', 'zh').
 * @returns Chuỗi văn bản để hiển thị.
 */
export const getDisplayText = (titleObj: BilingualText | any, preferredLang: 'en' | 'zh' | string): string => {
  if (!titleObj || typeof titleObj !== 'object') {
    return titleObj || ''; // Trả về chính nó nếu không phải object (để tương thích ngược)
  }
  
  if (preferredLang === 'en' && titleObj.en) return titleObj.en;
  if (preferredLang === 'zh' && titleObj.zh) return titleObj.zh;
  
  // Fallback
  return titleObj.vi || 'Không có tiêu đề';
};

/**
 * Lấy tiêu đề chính và phụ đề (nếu có).
 * @param titleObj - Đối tượng title.
 * @param targetLanguage - Ngôn ngữ mục tiêu của khóa học.
 * @returns Một object chứa { main: string, sub?: string }
 */
export const getDisplayTitleParts = (titleObj: BilingualText | any, targetLanguage: string) => {
    if (!titleObj || typeof titleObj !== 'object') {
        return { main: titleObj || '' };
    }

    if (targetLanguage.toLowerCase().includes('anh')) { // Tiếng Anh
        return { main: titleObj.en, sub: titleObj.vi };
    }
    if (targetLanguage.toLowerCase().includes('trung')) { // Tiếng Trung
        return { main: titleObj.zh, sub: titleObj.pinyin || titleObj.vi };
    }
    // Mặc định
    return { main: titleObj.vi };
}