// src/components/AppButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, SIZES } from '../theme';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
};

export const AppButton = ({ title, onPress, loading = false, variant = 'primary', disabled = false, style }: AppButtonProps) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    (loading || disabled) && styles.disabled,
    style, // Cho phép tùy chỉnh style từ bên ngoài
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={loading || disabled} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomWidth: 5, // <-- MA THUẬT NẰM Ở ĐÂY! Tạo độ dày cho button
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark, // <-- Viền dưới có màu tối hơn
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  danger: {
    backgroundColor: COLORS.danger,
    borderColor: '#C63A3A',
  },
  text: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Chữ in hoa
  },
  primaryText: { color: COLORS.white },
  secondaryText: { color: COLORS.text },
  dangerText: { color: COLORS.white },
  disabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabledBorder,
  },
});