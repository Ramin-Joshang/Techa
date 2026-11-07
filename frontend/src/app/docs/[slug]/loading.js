import React from 'react';
import DocTitleSkeleton from '../../../components/courses/course/CourseTitleSkeleton';
import DocDescriptionSkeleton from '../../../components/docs/doc/DocDescriptionSkeleton';

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <DocTitleSkeleton />
      <div className="h-10 bg-gray-200 rounded-xl w-64" />
      <DocDescriptionSkeleton />
    </div>
  );
}
