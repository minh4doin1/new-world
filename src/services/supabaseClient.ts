// src/services/supabaseClient.ts

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- 1. IMPORT AsyncStorage

// Lấy thông tin từ biến môi trường
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your .env file.");
}

// <-- 2. TẠO MỘT ADAPTER LƯU TRỮ
// Supabase client yêu cầu một đối tượng có các phương thức getItem, setItem, removeItem.
// Chúng ta tạo một object "phiên dịch" các lệnh này sang AsyncStorage.
const AsyncStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// <-- 3. CUNG CẤP ADAPTER KHI KHỞI TẠO CLIENT
// Chúng ta truyền vào một object options, chỉ định storage adapter tùy chỉnh.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter, // Sử dụng bộ nhớ bền bỉ của thiết bị
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Rất quan trọng cho mobile, tắt tính năng detect session trên URL
  },
});