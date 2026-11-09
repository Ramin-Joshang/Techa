import {
  CoursePublicDto,
  CourseOutlinePublicDto,
  LessonPublicDto,
  SitePagePublicDto,
  ContentBlock,
} from '@techa/shared';

export const SEED_HOMEPAGE: SitePagePublicDto = {
  pageKey: 'home',
  title: 'پلتفرم آموزشی و کارآموزی تکا | TECHA',
  heroSection: {
    title: 'پلتفرم آموزشی و کارآموزی تکا',
    subtitle:
      'مجموعه‌ای در بدنه دانشگاه، با هدف توانمندسازی دانشجویان و علاقه‌مندان برای ورود به بازار کار و توسعه تخصصی سامانه‌های وب بر پایه استانداردهای مدرن.',
    primaryCta: {
      label: 'مشاهده کاتالوگ دوره‌ها',
      url: '/courses',
    },
  },
  features: [
    {
      title: '۱۳ بلوک محتوایی ساختاریافته',
      description: 'ارائه کامل درس‌ها با کدهای تفکیک شده، جداول مقایسه‌ای و تمارین عملی.',
      icon: 'code-2',
    },
    {
      title: 'پشته فناوری روز دنیا',
      description: 'آموزش کامپایل شده بر پایه استانداردهای مدرن وب، ری‌اکت ۱۹ و ابزارهای نوین.',
      icon: 'cpu',
    },
    {
      title: 'پشتوانه دانشگاهی و آکادمیک',
      description: 'طراحی شده در بدنه دانشگاه برای ارائه عمیق‌ترین مفاهیم مهندسی نرم‌افزار.',
      icon: 'graduation-cap',
    },
  ],
  seo: {
    metaTitle: 'پلتفرم آموزشی و کارآموزی تکا | TECHA',
    metaDescription: 'آموزش جامع و پروژه محور برنامه‌نویسی وب فرانت‌اند و بک‌اند به زبان فارسی.',
  },
};

export const SEED_COURSES: CoursePublicDto[] = [
  {
    id: '672f10000000000000000001',
    slug: 'react-foundations',
    title: 'آموزش جامع ری‌اکت ۱۹ و مهندسی فرانت‌اند وب',
    summary:
      'یادگیری عمیق و پروژه محور ری‌اکت ۱۹، هوک‌ها، کامپوننت‌های سرور، مدیریت فرم‌ها و معماری استاندارد فرانت‌اند.',
    description:
      'این دوره به صورت جامع از پایه‌ای‌ترین مفاهیم معماری کامپوننت تا پیشرفته‌ترین قابلیت‌های React 19 از جمله Server Components، Actions، هوک‌های useActionState و useOptimistic را همراه با پروژه‌های واقعی پوشش می‌دهد.',
    level: 'beginner',
    icon: { kind: 'system', name: 'lucide:code-2' },
    coverStorageKey: 'courses/react/cover.webp',
    tags: ['react', 'nextjs', 'frontend', 'javascript', 'typescript'],
    prerequisites: ['آشنایی مقدماتی با HTML و CSS', 'مفاهیم پایه جاوااسکریپت مدرن ES6+'],
    targetAudience: [
      'دانشجویان و علاقه‌مندان به برنامه‌نویسی وب',
      'توسعه‌دهندگان فرانت‌اند خواهان ارتقا به React 19',
    ],
    order: 1,
    stats: {
      totalChapters: 3,
      totalLessons: 6,
      estimatedReadingTimeMinutes: 75,
    },
    seo: {
      metaTitle: 'آموزش جامع ری‌اکت ۱۹ و مهندسی فرانت‌اند وب | تکا',
      metaDescription:
        'یادگیری عمیق و پروژه محور ری‌اکت ۱۹، هوک‌ها، کامپوننت‌های سرور و مدیریت فرم‌ها در تکا.',
    },
    publishedAt: new Date().toISOString(),
  },
  {
    id: '672f10000000000000000002',
    slug: 'nodejs-express-architecture',
    title: 'معماری بک‌اند با Node.js 24 و Express 5',
    summary:
      'طراحی APIهای مقیاس‌پذیر RESTful، احراز هویت، اعتبارسنجی با Zod، پایگاه‌داده MongoDB و استقرار پایدار تحت PM2.',
    description:
      'در این دوره مهندسی بک‌اند با نسخه‌های پایدار Node.js 24 LTS و Express 5 از اصول معماری تمیز، مدیریت فرآیندها، هندلینگ خطاها، امنیت هدرها و اتصال به دیتابیس MongoDB Atlas را به طور عملی می‌آموزید.',
    level: 'intermediate',
    icon: { kind: 'system', name: 'lucide:server' },
    coverStorageKey: 'courses/nodejs/cover.webp',
    tags: ['nodejs', 'express', 'backend', 'mongodb', 'rest-api'],
    prerequisites: ['تسلط به زبان JavaScript و مبانی Async/Await'],
    targetAudience: ['توسعه‌دهندگان فرانت‌اند خواهان ورود به فول‌استک', 'مهندسان بک‌اند'],
    order: 2,
    stats: {
      totalChapters: 4,
      totalLessons: 8,
      estimatedReadingTimeMinutes: 90,
    },
    seo: {
      metaTitle: 'معماری بک‌اند با Node.js 24 و Express 5 | تکا',
      metaDescription: 'دوره جامع طراحی و استقرار سرویس‌های بک‌اند با Node 24 و Express 5.',
    },
    publishedAt: new Date().toISOString(),
  },
  {
    id: '672f10000000000000000003',
    slug: 'advanced-typescript',
    title: 'تایپ‌اسکریپت پیشرفته و الگوهای طراحی وب',
    summary:
      'تسلط بر سیستم تایپینگ پیشرفته، Generics، Conditional Types، ساخت کتابخانه‌ها و یکپارچه‌سازی با Zod.',
    description:
      'دوره تخصصی تایپ‌اسکریپت برای برنامه‌نویسانی که می‌خواهند کدهایی ایمن، مقیاس‌پذیر و خودتوصیف در پروژه‌های تیمی بزرگ بنویسند.',
    level: 'advanced',
    icon: { kind: 'system', name: 'lucide:file-code-2' },
    coverStorageKey: 'courses/typescript/cover.webp',
    tags: ['typescript', 'architecture', 'clean-code'],
    prerequisites: ['تجربه برنامه‌نویسی با JavaScript مدرن'],
    targetAudience: ['توسعه‌دهندگان ارشد و طراحان سیستم'],
    order: 3,
    stats: {
      totalChapters: 3,
      totalLessons: 6,
      estimatedReadingTimeMinutes: 60,
    },
    seo: {
      metaTitle: 'تایپ‌اسکریپت پیشرفته و الگوهای طراحی وب | تکا',
      metaDescription: 'آموزش پیشرفته TypeScript، Generics و سیستم تایپینگ در تکا.',
    },
    publishedAt: new Date().toISOString(),
  },
];

export const SEED_OUTLINES: Record<string, CourseOutlinePublicDto> = {
  'react-foundations': {
    course: {
      id: '672f10000000000000000001',
      slug: 'react-foundations',
      title: 'آموزش جامع ری‌اکت ۱۹ و مهندسی فرانت‌اند وب',
      stats: {
        totalChapters: 3,
        totalLessons: 6,
        estimatedReadingTimeMinutes: 75,
      },
    },
    chapters: [
      {
        id: '672f20000000000000000001',
        title: 'فصل اول: آشنایی با اکوسیستم React 19 و معماری مدرن',
        slug: 'intro-to-react-19',
        summary: 'مفاهیم پایه، تاریخچه، مزایای نسخه ۱۹ و شروع کار با کامپوننت‌ها',
        order: 1,
        lessons: [
          {
            id: '672f30000000000000000001',
            title: 'مقدمه و شروع سریع با ری‌اکت ۱۹',
            slug: 'getting-started-with-react-19',
            order: 1,
            readingTimeMinutes: 12,
          },
          {
            id: '672f30000000000000000002',
            title: 'ساختار کامپوننت‌ها و اصول JSX',
            slug: 'jsx-and-components',
            order: 2,
            readingTimeMinutes: 10,
          },
        ],
      },
      {
        id: '672f20000000000000000002',
        title: 'فصل دوم: مدیریت وضعیت و هوک‌های اساسی',
        slug: 'state-and-hooks',
        summary: 'بررسی هوک‌های پرکاربرد و مکانیزم‌های واکنشی در React 19',
        order: 2,
        lessons: [
          {
            id: '672f30000000000000000003',
            title: 'آشنایی با useState و چرخه حیات',
            slug: 'usestate-and-lifecycle',
            order: 1,
            readingTimeMinutes: 14,
          },
          {
            id: '672f30000000000000000004',
            title: 'هوک‌های نوین React 19: اکشن‌ها و useOptimistic',
            slug: 'react-19-actions-and-use',
            order: 2,
            readingTimeMinutes: 15,
          },
        ],
      },
      {
        id: '672f20000000000000000003',
        title: 'فصل سوم: رندرینگ سرور و استقرار در وب',
        slug: 'server-and-performance',
        summary: 'معماری Server Components و آمادگی برای استقرار تولیدی',
        order: 3,
        lessons: [
          {
            id: '672f30000000000000000005',
            title: 'رندرینگ سمت سرور و Server Components',
            slug: 'server-components',
            order: 1,
            readingTimeMinutes: 12,
          },
          {
            id: '672f30000000000000000006',
            title: 'بهینه‌سازی کارایی و استقرار استاندارد',
            slug: 'production-deployment',
            order: 2,
            readingTimeMinutes: 12,
          },
        ],
      },
    ],
  },
};

// All 13 verified content blocks for the test lesson
export const SEED_ALL_13_BLOCKS: ContentBlock[] = [
  // 1. Heading Block
  {
    id: 'blk_heading_101',
    version: 1,
    type: 'heading',
    data: {
      level: 2,
      text: '۱. مقدمه و نگاهی به اکوسیستم نوین React 19',
    },
  },
  // 2. Paragraph Block
  {
    id: 'blk_parag_102',
    version: 1,
    type: 'paragraph',
    data: {
      text: 'ری‌اکت ۱۹ یکی از مهم‌ترین جهش‌های تاریخ این کتابخانه محبوب است. با معرفی رسمی کامپوننت‌های سمت سرور (RSC)، پشتیبانی بومی از اکشن‌ها، بهبودهای چشم‌گیر در کامپایلر و حذف نیاز به مموایزیشن دستی (useMemo و useCallback)، توسعه وب وارد عصر جدیدی از سرعت و سادگی شده است.',
    },
  },
  // 3. Callout Block (Tip)
  {
    id: 'blk_callout_103',
    version: 1,
    type: 'callout',
    data: {
      type: 'tip',
      title: 'قابلیت برجسته نسخه ۱۹',
      text: 'کامپایلر جدید ری‌اکت به صورت خودکار رندرهای مجدد غیرضروری را مدیریت کرده و عملکرد برنامه را بدون نیاز به کدهای تکراری ارتقا می‌دهد.',
    },
  },
  // 4. Rich Text Block
  {
    id: 'blk_richtext_104',
    version: 1,
    type: 'richText',
    data: {
      spans: [
        { text: 'در این درس، ما با نحوه تعریف یک ' },
        { text: 'Server Action', bold: true },
        { text: ' و مدیریت وضعیت فرم با استفاده از هوک جدید ' },
        { text: 'useActionState', bold: true, code: true },
        { text: ' آشنا می‌شویم. برای اطلاعات تکمیلی می‌توانید به ' },
        {
          text: 'مستندات رسمی ری‌اکت',
          underline: true,
          link: { url: 'https://react.dev', openInNewTab: true },
        },
        { text: ' مراجعه فرمایید.' },
      ],
    },
  },
  // 5. Code Block (TypeScript)
  {
    id: 'blk_code_105',
    version: 1,
    type: 'codeBlock',
    data: {
      language: 'typescript',
      title: 'UserGreeting.tsx — نمونه کامپوننت React 19',
      showLineNumbers: true,
      code: `import React, { useActionState } from 'react';

// Server Action definition
async function updateProfile(previousState: { count: number }, formData: FormData) {
  const username = formData.get('username') as string;
  return { count: previousState.count + 1, message: \`خوش آمدید \${username}!\` };
}

export function UserGreeting() {
  const [state, formAction, isPending] = useActionState(updateProfile, { count: 0, message: '' });

  return (
    <form action={formAction} className="space-y-4 p-4 bg-slate-900 rounded-xl text-white">
      <input name="username" placeholder="نام کاربری..." required className="p-2 rounded bg-slate-800" />
      <button type="submit" disabled={isPending} className="px-4 py-2 bg-emerald-500 rounded font-bold">
        {isPending ? 'در حال ثبت...' : 'ثبت نام'}
      </button>
      {state.message && <p className="text-emerald-400 font-medium">{state.message}</p>}
    </form>
  );
}`,
    },
  },
  // 6. Quote Block
  {
    id: 'blk_quote_106',
    version: 1,
    type: 'quote',
    data: {
      text: 'ری‌اکت همواره در پی آن بوده که مرز میان کلاینت و سرور را به روان‌ترین و امن‌ترین شکل ممکن یکپارچه سازد.',
      author: 'تیم معماری هسته ری‌اکت',
      citationUrl: 'https://react.dev/blog/2024/04/25/react-19',
    },
  },
  // 7. Table Block
  {
    id: 'blk_table_107',
    version: 1,
    type: 'table',
    data: {
      headers: ['قابلیت', 'در React 18', 'در React 19'],
      rows: [
        ['مدیریت فرم‌ها', 'استفاده از هوک‌های دستی و کتابخانه‌های جانبی', 'پشتیبانی بومی از Actions و useActionState'],
        ['بهینه‌سازی رندر', 'نیاز به useMemo و useCallback دستی', 'کامپایلر هوشمند خودکار بدون نیاز به یادآوری دستی'],
        ['کامپوننت سرور', 'پشتیبانی آزمایشی در فریم‌ورک‌ها', 'معماری استاندارد و یکپارچه در سطح فاندیشن'],
        ['متادیتای صفحه', 'نیاز به react-helmet یا کامپوننت خارجی', 'پشتیبانی مستقیم از تگ‌های <title> و <meta>'],
      ],
    },
  },
  // 8. List Block
  {
    id: 'blk_list_108',
    version: 1,
    type: 'list',
    data: {
      format: 'ordered',
      items: [
        'نصب نسخه پایدار Node.js 24 LTS و ابزار مدیریت پکیج npm.',
        'ایجاد پروژه با استفاده از اسکلت رسمی Next.js 16 یا Vite با پشتیبانی React 19.',
        'پیکربندی تایپ‌اسکریپت ۵.۷ برای تحلیل دقیق نوع داده‌ها و قراردادهای Zod.',
        'آغاز توسعه کامپوننت‌ها با بهره‌گیری از هوک‌های نوین و کامپایلر بهینه.',
      ],
    },
  },
  // 9. Divider Block
  {
    id: 'blk_divider_109',
    version: 1,
    type: 'divider',
    data: {},
  },
  // 10. Image Block
  {
    id: 'blk_image_110',
    version: 1,
    type: 'image',
    data: {
      storageKey: 'images/React.jpg',
      altText: 'معماری و کامپوننت‌های مدرن ری‌اکت',
      caption: 'تصویر ۱: نمایی از چرخه رندرینگ و اکوسیستم یکپارچه ری‌اکت در وب مدرن.',
      width: 800,
      height: 450,
    },
  },
  // 11. Video Block
  {
    id: 'blk_video_111',
    version: 1,
    type: 'video',
    data: {
      storageKey: 'media/react-19-overview.mp4',
      caption: 'ویدیو آموزشی: بررسی اجمالی امکانات و نوآوری‌های کلیدی در نسخه ۱۹',
      durationSeconds: 320,
    },
  },
  // 12. Downloadable File Block
  {
    id: 'blk_file_112',
    version: 1,
    type: 'downloadableFile',
    data: {
      storageKey: 'downloads/react-19-starter-template.zip',
      title: 'سورس‌کد اولیه و قالب آماده React 19 Starter Project',
      description: 'پروژه استارتر شامل پیکربندی کامل TypeScript، Tailwind CSS و کامپوننت‌های نمونه.',
      sizeBytes: 2450000,
    },
  },
  // 13. Interactive Example Block
  {
    id: 'blk_interactive_113',
    version: 1,
    type: 'interactiveExample',
    data: {
      environment: 'react',
      preset: 'preset-react-19-v1',
      title: 'میز کار زنده: کامپوننت شمارنده واکنشی',
      description: 'کد زیر را ویرایش کنید تا تغییرات را به صورت زنده در پیش‌نمایش مشاهده نمایید.',
      files: [
        {
          path: 'App.tsx',
          language: 'typescript',
          entryPoint: true,
          readOnly: false,
          content: `import React, { useState } from 'react';

export default function CounterApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl text-white text-center space-y-4">
      <h3 className="text-lg font-bold text-emerald-400">شمارنده زنده ری‌اکت ۱۹</h3>
      <p className="text-3xl font-black font-mono">{count}</p>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold"
        >
          افزایش (+)
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium"
        >
          ریست
        </button>
      </div>
    </div>
  );
}`,
        },
      ],
    },
  },
];

export const SEED_LESSON_DETAIL: LessonPublicDto = {
  id: '672f30000000000000000001',
  courseId: '672f10000000000000000001',
  chapterId: '672f20000000000000000001',
  title: 'مقدمه و شروع سریع با ری‌اکت ۱۹',
  slug: 'getting-started-with-react-19',
  order: 1,
  readingTimeMinutes: 12,
  contentSchemaVersion: 1,
  contentBlocks: SEED_ALL_13_BLOCKS,
  seo: {
    metaTitle: 'مقدمه و شروع سریع با ری‌اکت ۱۹ | مستندات تکا',
    metaDescription: 'بررسی جامع امکانات نوین ری‌اکت ۱۹، ساختار کامپوننت‌ها و ۱۳ بلوک محتوایی آموزشی.',
  },
  publishedAt: new Date().toISOString(),
};
