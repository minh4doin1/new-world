// src/components/profile/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../theme';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: number | string;
  label: string;
  color: string;
};

export const StatCard = ({ icon, value, label, color }: Props) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
    marginHorizontal: SIZES.base / 2,
  },
  value: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.base,
  },
  label: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
});