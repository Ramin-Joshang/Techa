import React from 'react';
import StandaloneSandboxRunner from '../../../components/docs/content/StandaloneSandboxRunner';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'اجرای زنده و تمام‌صفحه کد | پلتفرم آموزشی تکا',
  description: 'محیط تعاملی تمام‌صفحه برای ویرایش، اجرا و مشاهده خروجی مثال‌های دروس تکا.',
  robots: 'noindex, nofollow',
};

interface SandboxPreviewPageProps {
  searchParams: Promise<{
    course?: string;
    lesson?: string;
    block?: string;
    draft?: string;
    mode?: string;
  }>;
}

export default async function SandboxPreviewPage({ searchParams }: SandboxPreviewPageProps) {
  const params = await searchParams;
  const mode =
    params?.mode === 'preview' || params?.mode === 'code' || params?.mode === 'split'
      ? params.mode
      : 'split';

  return (
    <StandaloneSandboxRunner
      courseSlug={params?.course}
      lessonSlug={params?.lesson}
      blockId={params?.block}
      draftId={params?.draft}
      initialMode={mode}
    />
  );
}
