// src/components/CourseSection.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { COLORS, SIZES } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LessonNode } from './LessonNode';
import { BilingualText } from '../types/common.types';
import { getDisplayTitleParts } from '../utils/textUtils';

export type LessonData = {
  id: number;
  title: BilingualText;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
  is_test: boolean;
};

type CourseSectionProps = {
  courseTitle: BilingualText;
  unitTitle: BilingualText;
  lessons: LessonData[];
  onLessonPress: (lesson: LessonData) => void;
  targetLanguage: string;
};

export const CourseSection = ({ courseTitle, unitTitle, lessons, onLessonPress, targetLanguage }: CourseSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { main: displayUnitTitle, sub: displayUnitSubtitle } = getDisplayTitleParts(unitTitle, targetLanguage);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setIsCollapsed(!isCollapsed)} activeOpacity={0.8}>
        <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{displayUnitTitle}</Text>
            {displayUnitSubtitle && <Text style={styles.headerSubtitle}>{displayUnitSubtitle}</Text>}
        </View>
        <MaterialCommunityIcons 
          name={isCollapsed ? 'chevron-down' : 'chevron-up'} 
          size={24} 
          color={COLORS.textSecondary} 
        />
      </TouchableOpacity>

      <Collapsible collapsed={isCollapsed} duration={300}>
        <View style={styles.pathContainer}>
          {lessons.map((lesson, index) => {
            const alignment = index % 4 < 2 ? 'flex-start' : 'flex-end';
            return (
              // SỬA LỖI: Đảm bảo key là duy nhất tuyệt đối
              <View key={`${lesson.id}-${index}`} style={[styles.nodeWrapper, { alignItems: alignment }]}>
                <LessonNode
                  status={lesson.status}
                  is_test={lesson.is_test}
                  onPress={() => onLessonPress(lesson)}
                />
              </View>
            );
          })}
        </View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
  },
  pathContainer: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 1.5,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nodeWrapper: {
    minHeight: 180,
    justifyContent: 'center',
  },
});