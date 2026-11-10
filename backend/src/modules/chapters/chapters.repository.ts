import { Types } from 'mongoose';
import { ChapterModel, ChapterRaw } from '../../models/chapter.model';

export class ChaptersRepository {
  public async findPublishedByCourseId(courseId: Types.ObjectId): Promise<ChapterRaw[]> {
    return ChapterModel.find({
      courseId,
      status: 'published',
    })
      .sort({ order: 1, _id: 1 })
      .lean<ChapterRaw[]>();
  }

  public async findPublishedByIdAndCourseId(
    chapterId: Types.ObjectId | string,
    courseId: Types.ObjectId | string
  ): Promise<ChapterRaw | null> {
    const chId = typeof chapterId === 'string' ? new Types.ObjectId(chapterId) : chapterId;
    const cId = typeof courseId === 'string' ? new Types.ObjectId(courseId) : courseId;

    return ChapterModel.findOne({
      _id: chId,
      courseId: cId,
      status: 'published',
    }).lean<ChapterRaw>();
  }

  public async countPublishedByCourseId(courseId: Types.ObjectId): Promise<number> {
    return ChapterModel.countDocuments({
      courseId,
      status: 'published',
    });
  }

  public async countTotalPublished(): Promise<number> {
    return ChapterModel.countDocuments({ status: 'published' });
  }
}

export const chaptersRepository = new ChaptersRepository();
