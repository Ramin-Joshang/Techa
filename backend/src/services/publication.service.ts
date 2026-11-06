import { Types } from 'mongoose';
import { PublishedSeoMetadataSchema } from '@techa/shared';
import { CourseModel, CourseDocument } from '../models/course.model';
import { ChapterModel, ChapterDocument } from '../models/chapter.model';
import { LessonModel, LessonDocument } from '../models/lesson.model';
import { AppError, BadRequestError, NotFoundError } from '../core/errors/app-error';

export class PublicationService {
  /**
   * Publish a Course:
   * Validates course existence and enforces strict published SEO metadata.
   */
  public async publishCourse(courseId: string | Types.ObjectId): Promise<CourseDocument> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    // Validate published SEO constraints
    const seoValidation = PublishedSeoMetadataSchema.safeParse(course.seo);
    if (!seoValidation.success) {
      throw new BadRequestError(
        `Course cannot be published: Invalid SEO metadata. ${seoValidation.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    const now = new Date();
    course.status = 'published';
    course.lastPublishedAt = now;
    if (!course.publishedAt) {
      course.publishedAt = now;
    }

    await course.save();
    return course;
  }

  /**
   * Publish a Chapter:
   * Validates parent Course exists and is published.
   */
  public async publishChapter(chapterId: string | Types.ObjectId): Promise<ChapterDocument> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError(`Chapter with id ${chapterId} not found`);
    }

    const parentCourse = await CourseModel.findById(chapter.courseId);
    if (!parentCourse) {
      throw new NotFoundError(`Parent course for chapter ${chapterId} not found`);
    }

    if (parentCourse.status !== 'published') {
      throw new BadRequestError(
        `Chapter cannot be published because parent course "${parentCourse.title}" is ${parentCourse.status}`
      );
    }

    const now = new Date();
    chapter.status = 'published';
    if (!chapter.publishedAt) {
      chapter.publishedAt = now;
    }

    await chapter.save();
    return chapter;
  }

  /**
   * Publish a Lesson:
   * Enforces 5 strict conditions:
   * 1. Has at least 1 content block.
   * 2. Parent Chapter exists and is published.
   * 3. Parent Course exists and is published.
   * 4. Chapter belongs to the same course referenced by Lesson.
   * 5. Valid publication SEO metadata.
   */
  public async publishLesson(lessonId: string | Types.ObjectId): Promise<LessonDocument> {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`Lesson with id ${lessonId} not found`);
    }

    // Rule 1: At least one content block
    if (!lesson.contentBlocks || lesson.contentBlocks.length === 0) {
      throw new BadRequestError('Lesson cannot be published without at least one content block');
    }

    // Rule 2 & 4: Parent Chapter exists, is published, and belongs to course
    const chapter = await ChapterModel.findById(lesson.chapterId);
    if (!chapter) {
      throw new NotFoundError(`Parent chapter with id ${lesson.chapterId} not found`);
    }

    if (chapter.status !== 'published') {
      throw new BadRequestError(
        `Lesson cannot be published because parent chapter "${chapter.title}" is ${chapter.status}`
      );
    }

    if (chapter.courseId.toString() !== lesson.courseId.toString()) {
      throw new BadRequestError(
        `Lesson integrity error: Lesson courseId (${lesson.courseId}) does not match parent chapter courseId (${chapter.courseId})`
      );
    }

    // Rule 3: Parent Course exists and is published
    const course = await CourseModel.findById(lesson.courseId);
    if (!course) {
      throw new NotFoundError(`Parent course with id ${lesson.courseId} not found`);
    }

    if (course.status !== 'published') {
      throw new BadRequestError(
        `Lesson cannot be published because parent course "${course.title}" is ${course.status}`
      );
    }

    // Rule 5: Valid publication SEO
    const seoValidation = PublishedSeoMetadataSchema.safeParse(lesson.seo);
    if (!seoValidation.success) {
      throw new BadRequestError(
        `Lesson cannot be published: Invalid SEO metadata. ${seoValidation.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    const now = new Date();
    lesson.status = 'published';
    lesson.lastPublishedAt = now;
    if (!lesson.publishedAt) {
      lesson.publishedAt = now;
    }

    await lesson.save();
    return lesson;
  }

  /**
   * Unpublish Course
   */
  public async unpublishCourse(courseId: string | Types.ObjectId): Promise<CourseDocument> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }
    course.status = 'draft';
    await course.save();
    return course;
  }

  /**
   * Unpublish Chapter
   */
  public async unpublishChapter(chapterId: string | Types.ObjectId): Promise<ChapterDocument> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError(`Chapter with id ${chapterId} not found`);
    }
    chapter.status = 'draft';
    await chapter.save();
    return chapter;
  }

  /**
   * Unpublish Lesson
   */
  public async unpublishLesson(lessonId: string | Types.ObjectId): Promise<LessonDocument> {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`Lesson with id ${lessonId} not found`);
    }
    lesson.status = 'draft';
    await lesson.save();
    return lesson;
  }

  /**
   * Check full parent publication chain for public visibility:
   * A lesson is only publicly visible if lesson, chapter, AND course are all published.
   */
  public async isLessonPubliclyVisible(lessonId: string | Types.ObjectId): Promise<boolean> {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson || lesson.status !== 'published') {
      return false;
    }

    const chapter = await ChapterModel.findById(lesson.chapterId);
    if (!chapter || chapter.status !== 'published') {
      return false;
    }

    if (chapter.courseId.toString() !== lesson.courseId.toString()) {
      return false;
    }

    const course = await CourseModel.findById(lesson.courseId);
    if (!course || course.status !== 'published') {
      return false;
    }

    return true;
  }

  /**
   * Check parent publication chain for Chapter
   */
  public async isChapterPubliclyVisible(chapterId: string | Types.ObjectId): Promise<boolean> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter || chapter.status !== 'published') {
      return false;
    }

    const course = await CourseModel.findById(chapter.courseId);
    return !!(course && course.status === 'published');
  }

  /**
   * Check public visibility for Course
   */
  public async isCoursePubliclyVisible(courseId: string | Types.ObjectId): Promise<boolean> {
    const course = await CourseModel.findById(courseId);
    return !!(course && course.status === 'published');
  }
}

export const publicationService = new PublicationService();
