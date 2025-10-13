// src/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Lấy thông tin từ biến môi trường thay vì viết thẳng vào code
const supabaseUrl = 'https://njoupvixuhtljokkzwnc.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb3Vwdml4dWh0bGpva2t6d25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjczNjAsImV4cCI6MjA3NTg0MzM2MH0.sSy-BhE7uHSKVMDAwKgvWmCxNMSTg78xSC1688a8nTU";

// Kiểm tra để đảm bảo các biến đã được thiết lập
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);