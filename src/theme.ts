// src/theme.ts

export const COLORS = {
  // Bảng màu "Bình minh Nhiệt đới"
  primary: '#14B8A6',      // Xanh mòng két
  primaryDark: '#0F766E',   // Xanh đậm hơn
  primaryLight: '#D1FAE5',  // Nền xanh rất nhạt

  accent: '#FF7A5A',       // Cam san hô
  accentDark: '#E65B3E',   // Cam đậm hơn

  // Màu văn bản
  text: '#334155',         // Xám đậm
  textSecondary: '#64748B', // Xám nhạt hơn
  white: '#FFFFFF',

  // Màu nền và các thành phần UI
  background: '#F8F5F2',   // Trắng ngà
  card: '#FFFFFF',         // Thẻ trắng tinh
  border: '#E2E8F0',       // Viền xám nhạt
  
  disabled: '#E2E8F0',
  disabledBorder: '#CBD5E1',

  success: '#34D399',
  danger: '#EF4444',
  warning: '#FBBF24',
  infoLight: '#FEF3C7', // Vàng chanh nhẹ
  info: '#F59E0B',
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