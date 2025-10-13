// src/components/AppTextInput.tsx
import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';
import { COLORS, SIZES } from '../theme';

type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const AppTextInput = ({ label, error, ...props }: AppTextInputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={COLORS.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.base * 2,
    width: '100%',
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#F7F7F7', // Màu nền hơi xám
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: SIZES.caption,
    color: COLORS.danger,
    marginTop: SIZES.base,
  },
});