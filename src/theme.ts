// src/theme.ts

export const COLORS = {
  primary: '#6B4EFF',     // Tím thiên hà
  primaryLight: 'rgba(107, 78, 255, 0.1)', // Nền tím mờ
  primaryDark: '#4AA802',   // Xanh lá đậm hơn cho hiệu ứng 3D của button
  success: '#58CC02',
  
  secondary: '#1CB0F6',     // Xanh dương cho thông tin, link
  
  danger: '#FF4B4B',        // Đỏ cho lỗi hoặc hành động nguy hiểm
  warning: '#FFC800',      // Vàng cho cảnh báo
  
  // Màu văn bản
  text: '#4B4B4B',          // Xám đen, dễ đọc hơn màu đen tuyền
  textSecondary: '#AFAFAF',  // Xám nhạt cho văn bản phụ
    accent: '#FFC83D',      // Vàng/Cam của các vì sao (cho nút quan trọng)
  accentDark: '#E6A100',  
  
  // Màu nền và các thành phần UI
  card: '#112240', 
  background: '#FFFFFF',    // Nền trắng tinh khôi
  white: '#FFFFFF',
  border: '#E5E5E5',       // Viền xám rất nhạt
  disabled: '#CDCDCD',      // Màu cho trạng thái vô hiệu hóa
  disabledBorder: '#AFAFAF',
};

export const SIZES = {
  base: 8,
  padding: 24, // Tăng padding để giao diện "thở" nhiều hơn
  radius: 16,  // Bo góc nhiều hơn để tạo cảm giác mềm mại
  
  // Cỡ chữ
  h1: 32,
  h2: 24,
  h3: 18,
  body: 16,
  caption: 14,
};

export const SHADOWS = {
  // Shadow nhẹ nhàng cho các thẻ
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Shadow mạnh hơn cho các yếu tố nổi bật
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Chúng ta sẽ thêm Font sau, hiện tại dùng font hệ thống
export const FONTS = {
    // h1: { fontFamily: 'Your-Bold-Font', fontSize: SIZES.h1, lineHeight: 36 },
    // body: { fontFamily: 'Your-Regular-Font', fontSize: SIZES.body, lineHeight: 22 },
};