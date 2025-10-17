// src/components/activities/LessonContentActivity.tsx
import React from 'react';
import { ScrollView, useWindowDimensions, StyleSheet } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { COLORS, SIZES } from '../../theme';

type Props = {
  data: {
    html_content: string;
  };
};

// Định nghĩa style cho các thẻ HTML
const tagsStyles = {
  body: {
    color: COLORS.text,
    fontSize: SIZES.body * 1.2,
    lineHeight: SIZES.body * 1.8,
  },
  h1: {
    color: COLORS.primary,
    fontSize: SIZES.h1,
    marginBottom: SIZES.base,
  },
  h2: {
    color: COLORS.text,
    fontSize: SIZES.h2,
    marginBottom: SIZES.base,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: SIZES.base,
  },
  p: {
    marginBottom: SIZES.padding / 2,
  },
  strong: {
    color: COLORS.accent,
    fontWeight: 'bold' as const,
  },
  ul: {
    marginBottom: SIZES.padding / 2,
  },
  li: {
    marginBottom: SIZES.base,
  },
  code: {
    backgroundColor: COLORS.card,
    color: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius / 2,
  }
};

export const LessonContentActivity = ({ data }: Props) => {
  const { width } = useWindowDimensions();
  const source = {
    html: data.html_content || '<p>Nội dung không có sẵn.</p>',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RenderHTML
        contentWidth={width - SIZES.padding * 2} // Trừ đi padding của màn hình cha
        source={source}
        tagsStyles={tagsStyles}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: SIZES.padding, // Thêm padding dưới để không bị che
    }
})