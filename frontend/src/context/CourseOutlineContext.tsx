'use client';

import React, { createContext, useContext } from 'react';
import { CourseOutlinePublicDto } from '@techa/shared';

interface CourseOutlineContextValue {
  outline: CourseOutlinePublicDto | null;
  courseSlug: string;
}

const CourseOutlineContext = createContext<CourseOutlineContextValue>({
  outline: null,
  courseSlug: '',
});

export function CourseOutlineProvider({
  children,
  outline,
  courseSlug,
}: {
  children: React.ReactNode;
  outline: CourseOutlinePublicDto | null;
  courseSlug: string;
}) {
  return (
    <CourseOutlineContext.Provider value={{ outline, courseSlug }}>
      {children}
    </CourseOutlineContext.Provider>
  );
}

export function useCourseOutline() {
  return useContext(CourseOutlineContext);
}
