import { Types } from 'mongoose';
import { CourseModel } from '../../models/course.model';
import { ChapterModel } from '../../models/chapter.model';
import { LessonModel } from '../../models/lesson.model';
import { SitePageModel } from '../../models/site-page.model';
import { courseStatsService } from '../../services/course-stats.service';
import { logger } from '../../core/logger/logger';
import { SEED_HOMEPAGE, SEED_ALL_13_BLOCKS } from './public.seed';

export async function seedDatabase(force = false): Promise<void> {
  const existingCourses = await CourseModel.countDocuments();
  if (existingCourses > 0 && !force) {
    logger.info(`[Seeder] Database already contains ${existingCourses} courses. Skipping seed.`);
    return;
  }

  if (force) {
    logger.warn('[Seeder] Force flag provided. Clearing existing collections...');
    await Promise.all([
      SitePageModel.deleteMany({}),
      CourseModel.deleteMany({}),
      ChapterModel.deleteMany({}),
      LessonModel.deleteMany({}),
    ]);
  }

  logger.info('[Seeder] Starting MongoDB seeding for TECHA 2.0...');

  // 1. Seed SitePage (Homepage)
  await SitePageModel.findOneAndUpdate(
    { pageKey: 'home' },
    {
      pageKey: 'home',
      title: SEED_HOMEPAGE.title,
      heroSection: SEED_HOMEPAGE.heroSection,
      features: SEED_HOMEPAGE.features,
      seo: SEED_HOMEPAGE.seo,
    },
    { upsert: true, new: true }
  );
  logger.info('[Seeder] Seeded site_pages collection (home page).');

  // 2. Define ObjectIds for relational consistency
  const course1Id = new Types.ObjectId('672f10000000000000000001');
  const course2Id = new Types.ObjectId('672f10000000000000000002');
  const course3Id = new Types.ObjectId('672f10000000000000000003');

  const chapter1Id = new Types.ObjectId('672f20000000000000000001');
  const chapter2Id = new Types.ObjectId('672f20000000000000000002');
  const chapter3Id = new Types.ObjectId('672f20000000000000000003');

  // 3. Create Courses
  await CourseModel.create([
    {
      _id: course1Id,
      slug: 'react-foundations',
      title: 'آموزش جامع ری‌اکت ۱۹ و مهندسی فرانت‌اند وب',
      summary:
        'یادگیری عمیق و پروژه محور ری‌اکت ۱۹، هوک‌ها، کامپوننت‌های سرور، مدیریت فرم‌ها و معماری استاندارد فرانت‌اند.',
      description:
        'این دوره به صورت جامع از پایه‌ای‌ترین مفاهیم معماری کامپوننت تا پیشرفته‌ترین قابلیت‌های React 19 از جمله Server Components، Actions، هوک‌های useActionState و useOptimistic را همراه با پروژه‌های واقعی پوشش می‌دهد.',
      level: 'beginner',
      icon: { kind: 'system', name: 'code-2' },
      coverStorageKey: 'courses/react/cover.webp',
      tags: ['react', 'nextjs', 'frontend', 'javascript', 'typescript'],
      prerequisites: ['آشنایی مقدماتی با HTML و CSS', 'مفاهیم پایه جاوااسکریپت مدرن ES6+'],
      targetAudience: [
        'دانشجویان و علاقه‌مندان به برنامه‌نویسی وب',
        'توسعه‌دهندگان فرانت‌اند خواهان ارتقا به React 19',
      ],
      order: 1,
      status: 'published',
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
      publishedAt: new Date(),
    },
    {
      _id: course2Id,
      slug: 'nodejs-express-architecture',
      title: 'معماری بک‌اند با Node.js 24 و Express 5',
      summary:
        'طراحی APIهای مقیاس‌پذیر RESTful، احراز هویت، اعتبارسنجی با Zod، پایگاه‌داده MongoDB و استقرار پایدار تحت PM2.',
      description:
        'در این دوره مهندسی بک‌اند با نسخه‌های پایدار Node.js 24 LTS و Express 5 از اصول معماری تمیز، مدیریت فرآیندها، هندلینگ خطاها، امنیت هدرها و اتصال به دیتابیس MongoDB Atlas را به طور عملی می‌آموزید.',
      level: 'intermediate',
      icon: { kind: 'system', name: 'server' },
      coverStorageKey: 'courses/nodejs/cover.webp',
      tags: ['nodejs', 'express', 'backend', 'mongodb', 'rest-api'],
      prerequisites: ['تسلط به زبان JavaScript و مبانی Async/Await'],
      targetAudience: ['توسعه‌دهندگان فرانت‌اند خواهان ورود به فول‌استک', 'مهندسان بک‌اند'],
      order: 2,
      status: 'published',
      stats: {
        totalChapters: 2,
        totalLessons: 4,
        estimatedReadingTimeMinutes: 55,
      },
      seo: {
        metaTitle: 'معماری بک‌اند با Node.js 24 و Express 5 | تکا',
        metaDescription: 'دوره جامع طراحی و استقرار سرویس‌های بک‌اند با Node 24 و Express 5.',
      },
      publishedAt: new Date(),
    },
    {
      _id: course3Id,
      slug: 'advanced-typescript',
      title: 'تایپ‌اسکریپت پیشرفته و الگوهای طراحی وب',
      summary:
        'تسلط بر سیستم تایپینگ پیشرفته، Generics، Conditional Types، ساخت کتابخانه‌ها و یکپارچه‌سازی با Zod.',
      description:
        'دوره تخصصی تایپ‌اسکریپت برای برنامه‌نویسانی که می‌خواهند کدهایی ایمن، مقیاس‌پذیر و خودتوصیف در پروژه‌های تیمی بزرگ بنویسند.',
      level: 'advanced',
      icon: { kind: 'system', name: 'file-code-2' },
      coverStorageKey: 'courses/typescript/cover.webp',
      tags: ['typescript', 'architecture', 'clean-code'],
      prerequisites: ['تجربه برنامه‌نویسی با JavaScript مدرن'],
      targetAudience: ['توسعه‌دهندگان ارشد و طراحان سیستم'],
      order: 3,
      status: 'published',
      stats: {
        totalChapters: 2,
        totalLessons: 4,
        estimatedReadingTimeMinutes: 45,
      },
      seo: {
        metaTitle: 'تایپ‌اسکریپت پیشرفته و الگوهای طراحی وب | تکا',
        metaDescription: 'آموزش پیشرفته TypeScript، Generics و سیستم تایپینگ در تکا.',
      },
      publishedAt: new Date(),
    },
  ]);
  logger.info('[Seeder] Seeded courses collection (3 published courses).');

  // 4. Create Chapters for React Course
  await ChapterModel.create([
    {
      _id: chapter1Id,
      courseId: course1Id,
      title: 'فصل اول: آشنایی با اکوسیستم React 19 و معماری مدرن',
      slug: 'intro-to-react-19',
      summary: 'مفاهیم پایه، تاریخچه، مزایای نسخه ۱۹ و شروع کار با کامپوننت‌ها',
      order: 1,
      status: 'published',
      publishedAt: new Date(),
    },
    {
      _id: chapter2Id,
      courseId: course1Id,
      title: 'فصل دوم: مدیریت وضعیت و هوک‌های اساسی',
      slug: 'state-and-hooks',
      summary: 'بررسی هوک‌های پرکاربرد و مکانیزم‌های واکنشی در React 19',
      order: 2,
      status: 'published',
      publishedAt: new Date(),
    },
    {
      _id: chapter3Id,
      courseId: course1Id,
      title: 'فصل سوم: رندرینگ سرور و استقرار در وب',
      slug: 'server-and-performance',
      summary: 'معماری Server Components و آمادگی برای استقرار تولیدی',
      order: 3,
      status: 'published',
      publishedAt: new Date(),
    },
  ]);
  logger.info('[Seeder] Seeded chapters collection.');

  // 5. Create Lessons with complete 13 content blocks
  await LessonModel.create([
    {
      _id: new Types.ObjectId('672f30000000000000000001'),
      courseId: course1Id,
      chapterId: chapter1Id,
      title: 'مقدمه و شروع سریع با ری‌اکت ۱۹',
      slug: 'getting-started-with-react-19',
      order: 1,
      readingTimeMinutes: 12,
      contentSchemaVersion: 1,
      contentBlocks: SEED_ALL_13_BLOCKS,
      status: 'published',
      seo: {
        metaTitle: 'مقدمه و شروع سریع با ری‌اکت ۱۹ | مستندات تکا',
        metaDescription:
          'بررسی جامع امکانات نوین ری‌اکت ۱۹، ساختار کامپوننت‌ها و ۱۳ بلوک محتوایی آموزشی.',
      },
      publishedAt: new Date(),
    },
    {
      _id: new Types.ObjectId('672f30000000000000000002'),
      courseId: course1Id,
      chapterId: chapter1Id,
      title: 'ساختار کامپوننت‌ها و اصول JSX',
      slug: 'jsx-and-components',
      order: 2,
      readingTimeMinutes: 10,
      contentSchemaVersion: 1,
      contentBlocks: [
        {
          id: 'blk_heading_201',
          version: 1,
          type: 'heading',
          data: { level: 2, text: 'اصول ساختار کامپوننت در ری‌اکت' },
        },
        {
          id: 'blk_parag_202',
          version: 1,
          type: 'paragraph',
          data: {
            text: 'کامپوننت‌ها بلوک‌های سازنده هر برنامه ری‌اکت هستند. با استفاده از ساختار ماژولار می‌توانید واسط کاربری پیچیده را به قطعات کوچک، مستقل و قابل استفاده مجدد تقسیم کنید.',
          },
        },
        {
          id: 'blk_callout_203',
          version: 1,
          type: 'callout',
          data: {
            type: 'tip',
            title: 'قانون نام‌گذاری کامپوننت‌ها',
            text: 'نام تمام کامپوننت‌های ری‌اکت باید با حرف بزرگ انگلیسی (PascalCase) شروع شود تا با تگ‌های پیش‌فرض HTML اشتباه گرفته نشود.',
          },
        },
        {
          id: 'blk_code_204',
          version: 1,
          type: 'codeBlock',
          data: {
            language: 'typescript',
            title: 'Button.tsx',
            showLineNumbers: true,
            code: `interface ButtonProps {\n  label: string;\n  onClick: () => void;\n}\n\nexport function Button({ label, onClick }: ButtonProps) {\n  return (\n    <button onClick={onClick} className="px-4 py-2 bg-emerald-500 rounded font-bold">\n      {label}\n    </button>\n  );\n}`,
          },
        },
      ],
      status: 'published',
      seo: {
        metaTitle: 'ساختار کامپوننت‌ها و اصول JSX | مستندات تکا',
        metaDescription: 'یادگیری تعریف کامپوننت‌ها، نحوه ارسال Props و قوانین نوشتاری JSX.',
      },
      publishedAt: new Date(),
    },
    {
      _id: new Types.ObjectId('672f30000000000000000003'),
      courseId: course1Id,
      chapterId: chapter2Id,
      title: 'آشنایی با useState و چرخه حیات',
      slug: 'usestate-and-lifecycle',
      order: 1,
      readingTimeMinutes: 14,
      contentSchemaVersion: 1,
      contentBlocks: [
        {
          id: 'blk_heading_301',
          version: 1,
          type: 'heading',
          data: { level: 2, text: 'مدیریت وضعیت محلی با useState' },
        },
        {
          id: 'blk_parag_302',
          version: 1,
          type: 'paragraph',
          data: {
            text: 'هوک useState به کامپوننت‌های تابعی اجازه می‌دهد وضعیت محلی خود را حفظ کرده و در صورت تغییر، رندر مجدد واسط کاربری را با سرعت بالا کلید بزنند.',
          },
        },
      ],
      status: 'published',
      seo: {
        metaTitle: 'آشنایی با useState و چرخه حیات | مستندات تکا',
        metaDescription: 'مدیریت وضعیت محلی و متغیرهای واکنش‌پذیر در ری‌اکت ۱۹.',
      },
      publishedAt: new Date(),
    },
    {
      _id: new Types.ObjectId('672f30000000000000000004'),
      courseId: course1Id,
      chapterId: chapter2Id,
      title: 'هوک‌های نوین React 19: اکشن‌ها و useOptimistic',
      slug: 'react-19-actions-and-use',
      order: 2,
      readingTimeMinutes: 15,
      contentSchemaVersion: 1,
      contentBlocks: [
        {
          id: 'blk_heading_401',
          version: 1,
          type: 'heading',
          data: { level: 2, text: 'بهینه‌سازی رابط کاربری با useOptimistic' },
        },
        {
          id: 'blk_parag_402',
          version: 1,
          type: 'paragraph',
          data: {
            text: 'هوک useOptimistic تجربه کاربری بسیار روان‌تری ایجاد می‌کند و بدون انتظار برای پاسخ سرور، واسط را بلافاصله به‌روزرسانی می‌نماید.',
          },
        },
      ],
      status: 'published',
      seo: {
        metaTitle: 'هوک‌های نوین React 19 | مستندات تکا',
        metaDescription: 'بررسی هوک‌های کاربردی useActionState و useOptimistic در نسخه ۱۹.',
      },
      publishedAt: new Date(),
    },
    {
      _id: new Types.ObjectId('672f30000000000000000005'),
      courseId: course1Id,
      chapterId: chapter3Id,
      title: 'رندرینگ سمت سرور و Server Components',
      slug: 'server-components',
      order: 1,
      readingTimeMinutes: 12,
      contentSchemaVersion: 1,
      contentBlocks: [
        {
          id: 'blk_heading_501',
          version: 1,
          type: 'heading',
          data: { level: 2, text: 'معماری React Server Components (RSC)' },
        },
        {
          id: 'blk_parag_502',
          version: 1,
          type: 'paragraph',
          data: {
            text: 'کامپوننت‌های سرور ری‌اکت کدهای کلاینت را تا حد چشمگیری سبک کرده و دسترسی مستقیم به داده‌ها و پایگاه داده را ممکن می‌سازند.',
          },
        },
      ],
      status: 'published',
      seo: {
        metaTitle: 'رندرینگ سمت سرور و Server Components | تکا',
        metaDescription: 'مفاهیم و شیوه استفاده از RSC در پروژه‌های مدرن وب.',
      },
      publishedAt: new Date(),
    },
    {
      _id: new Types.ObjectId('672f30000000000000000006'),
      courseId: course1Id,
      chapterId: chapter3Id,
      title: 'بهینه‌سازی کارایی و استقرار استاندارد',
      slug: 'production-deployment',
      order: 2,
      readingTimeMinutes: 12,
      contentSchemaVersion: 1,
      contentBlocks: [
        {
          id: 'blk_heading_601',
          version: 1,
          type: 'heading',
          data: { level: 2, text: 'آماده‌سازی پروژه برای انتشار نهایی' },
        },
        {
          id: 'blk_parag_602',
          version: 1,
          type: 'paragraph',
          data: {
            text: 'بررسی تنظیمات بیلد، کشینگ، مدیریت فرآیندها با PM2 و امنیت هدرهای HTTP در استقرار محیط پروداکشن.',
          },
        },
      ],
      status: 'published',
      seo: {
        metaTitle: 'بهینه‌سازی کارایی و استقرار استاندارد | تکا',
        metaDescription: 'راهنمای گام‌به‌گام استقرار و بهینه‌سازی پروژه‌های ری‌اکت و نکست‌جی‌اس.',
      },
      publishedAt: new Date(),
    },
  ]);
  logger.info('[Seeder] Seeded lessons collection (including test lesson with 13 blocks).');

  // 6. Recalculate statistics for all courses
  await Promise.all([
    courseStatsService.recalculateCourseStats(course1Id),
    courseStatsService.recalculateCourseStats(course2Id),
    courseStatsService.recalculateCourseStats(course3Id),
  ]);
  logger.info('[Seeder] Course statistics recalculated and synchronized.');
  logger.info('[Seeder] MongoDB Database Seeding Completed Successfully! ✅');
}
