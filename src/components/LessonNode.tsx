// src/components/LessonNode.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, PressableStateCallbackType } from 'react-native'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';

export type NodeStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

type LessonNodeProps = {
  status: NodeStatus;
  onPress: () => void;
  is_test?: boolean; // <-- THÊM PROP is_test
};

export const LessonNode = ({ status, onPress, is_test = false }: LessonNodeProps) => {
  const isLocked = status === 'LOCKED';
  const isActive = status === 'ACTIVE';

  const NodeIcon = () => {
    if (isLocked) return <MaterialCommunityIcons name="lock" size={32} color={COLORS.disabledBorder} />;
    if (status === 'COMPLETED') return <MaterialCommunityIcons name="check-bold" size={32} color={COLORS.primary} />;
    // SỬA ĐỔI: Nếu là bài test, hiển thị icon cúp
    if (is_test) return <MaterialCommunityIcons name="trophy-variant" size={32} color={COLORS.white} />;
    return <MaterialCommunityIcons name="star-circle" size={32} color={COLORS.white} />;
  };

  const pressableStyle = ({ pressed }: PressableStateCallbackType) => [
    styles.nodeContainer,
    styles[status],
    // SỬA ĐỔI: Bài test có thể có màu khác
    isActive && is_test && styles.ACTIVE_TEST,
    pressed && isActive && styles.nodePressed,
  ];

  return (
    <Pressable style={pressableStyle} onPress={onPress} disabled={isLocked}>
      <NodeIcon />
      {isActive && (
        <View style={styles.startButton}>
          {/* SỬA ĐỔI: Thay đổi văn bản cho bài test */}
          <Text style={styles.startButtonText}>{is_test ? "LÀM BÀI" : "BẮT ĐẦU"}</Text>
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
  // THÊM STYLE MỚI cho bài test
  ACTIVE_TEST: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
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