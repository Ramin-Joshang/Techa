import { Types } from 'mongoose';
import { CourseModel, CourseRaw } from '../../models/course.model';
import { CourseListQuery } from '@techa/shared';
import { escapeRegex } from '../../core/utils/regex';

export interface FindCoursesResult {
  courses: CourseRaw[];
  total: number;
}

export class CoursesRepository {
  public async findPublished(query: CourseListQuery): Promise<FindCoursesResult> {
    const filter: Record<string, any> = { status: 'published' };

    if (query.level) {
      filter.level = query.level;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.q) {
      const sanitized = escapeRegex(query.q.trim());
      const regex = new RegExp(sanitized, 'i');
      filter.$or = [
        { title: { $regex: regex } },
        { summary: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    let sortOption: Record<string, 1 | -1> = { order: 1, _id: 1 };
    if (query.sort === 'title') {
      sortOption = { title: 1, _id: 1 };
    } else if (query.sort === 'recentlyUpdated') {
      sortOption = { updatedAt: -1, _id: 1 };
    }

    const [total, courses] = await Promise.all([
      CourseModel.countDocuments(filter),
      CourseModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean<CourseRaw[]>(),
    ]);

    return {
      courses: courses || [],
      total: total || 0,
    };
  }

  public async findPublishedBySlug(slug: string): Promise<CourseRaw | null> {
    return CourseModel.findOne({ slug, status: 'published' }).lean<CourseRaw>();
  }

  public async findPublishedById(id: Types.ObjectId | string): Promise<CourseRaw | null> {
    const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
    return CourseModel.findOne({ _id: objectId, status: 'published' }).lean<CourseRaw>();
  }

  public async getFeaturedPublished(limit = 6): Promise<CourseRaw[]> {
    return CourseModel.find({ status: 'published' })
      .sort({ order: 1, _id: 1 })
      .limit(limit)
      .lean<CourseRaw[]>();
  }

  public async countPublished(): Promise<number> {
    return CourseModel.countDocuments({ status: 'published' });
  }
}

export const coursesRepository = new CoursesRepository();
