import { Types } from 'mongoose';
import { LessonModel, LessonRaw } from '../../models/lesson.model';

export class LessonsRepository {
  public async findPublishedByCourseAndSlug(
    courseId: Types.ObjectId,
    slug: string
  ): Promise<LessonRaw | null> {
    return LessonModel.findOne({
      courseId,
      slug,
      status: 'published',
    }).lean<LessonRaw>();
  }

  public async findOutlineByChapters(
    courseId: Types.ObjectId,
    chapterIds: Types.ObjectId[]
  ): Promise<Array<Pick<LessonRaw, '_id' | 'chapterId' | 'title' | 'slug' | 'order' | 'readingTimeMinutes'>>> {
    if (chapterIds.length === 0) return [];

    return LessonModel.find(
      {
        courseId,
        chapterId: { $in: chapterIds },
        status: 'published',
      },
      {
        _id: 1,
        chapterId: 1,
        title: 1,
        slug: 1,
        order: 1,
        readingTimeMinutes: 1,
      }
    )
      .sort({ order: 1, _id: 1 })
      .lean();
  }

  public async findAllPublishedLessonsInCourse(
    courseId: Types.ObjectId,
    publishedChapterIds: Types.ObjectId[]
  ): Promise<Array<Pick<LessonRaw, '_id' | 'chapterId' | 'title' | 'slug' | 'order'>>> {
    if (publishedChapterIds.length === 0) return [];

    return LessonModel.find(
      {
        courseId,
        chapterId: { $in: publishedChapterIds },
        status: 'published',
      },
      {
        _id: 1,
        chapterId: 1,
        title: 1,
        slug: 1,
        order: 1,
      }
    )
      .sort({ order: 1, _id: 1 })
      .lean();
  }

  public async countTotalPublished(): Promise<number> {
    return LessonModel.countDocuments({ status: 'published' });
  }

  public async sumTotalReadingTimeMinutes(): Promise<number> {
    const agg = await LessonModel.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$readingTimeMinutes' } } },
    ]);
    return agg[0]?.total || 0;
  }
}

export const lessonsRepository = new LessonsRepository();
