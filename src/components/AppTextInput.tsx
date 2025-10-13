// src/components/AppTextInput.tsx
import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SIZES } from '../theme';

export const AppTextInput = (props: TextInputProps) => {
  return <TextInput style={styles.input} placeholderTextColor={COLORS.textSecondary} {...props} />;
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    fontSize: 16,
    color: COLORS.text,
  },
});