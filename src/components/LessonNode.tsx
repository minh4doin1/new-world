// src/components/LessonNode.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, PressableStateCallbackType } from 'react-native'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';

export type NodeStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

type LessonNodeProps = {
  title: string;
  status: NodeStatus;
  onPress: () => void;
  // Thêm các icon khác cho các loại bài học đặc biệt
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export const LessonNode = ({ title, status, onPress, iconName = 'star-circle' }: LessonNodeProps) => {
  const isLocked = status === 'LOCKED';
  const isActive = status === 'ACTIVE';

  const NodeIcon = () => {
    if (isLocked) return <MaterialCommunityIcons name="lock" size={32} color={COLORS.disabledBorder} />;
    if (status === 'COMPLETED') return <MaterialCommunityIcons name="check-bold" size={32} color={COLORS.primary} />;
    return <MaterialCommunityIcons name={iconName} size={32} color={COLORS.white} />;
  };

const pressableStyle = ({ pressed }: PressableStateCallbackType) => [
    styles.nodeContainer,
    styles[status],
    pressed && isActive && styles.nodePressed,
  ];

  return (
    <Pressable style={pressableStyle} onPress={onPress} disabled={isLocked}>
      <NodeIcon />
      {isActive && (
        <View style={styles.startButton}>
          <Text style={styles.startButtonText}>BẮT ĐẦU</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  nodeContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 5,
  },
  LOCKED: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabledBorder,
  },
  ACTIVE: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  COMPLETED: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  nodePressed: {
    transform: [{ scale: 0.95 }],
  },
  startButton: {
    position: 'absolute',
    bottom: -25,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderColor: COLORS.border,
    borderWidth: 2,
  },
  startButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.caption,
  },
});