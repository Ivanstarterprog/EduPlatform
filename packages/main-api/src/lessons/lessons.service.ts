import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Lesson, LessonDocument } from "./schemas/lesson.schema";
import { Course, CourseDocument } from "../courses/schemas/course.schema";
import { User, UserDocument } from "../users/schemas/user.schema";

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findByCourse(courseId: string) {
    const cacheKey = `lessons:course:${courseId}`;
    const cached = await this.cache.get<LessonDocument[]>(cacheKey);
    if (cached) return cached;

    const lessons = await this.lessonModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .sort({ order: 1 })
      .exec();

    await this.cache.set(cacheKey, lessons, 60000);
    return lessons;
  }

  async findOne(id: string, userId: string) {
    const cacheKey = `lesson:${id}`;
    let lesson = await this.cache.get<LessonDocument>(cacheKey);
    if (!lesson) {
      lesson = await this.lessonModel.findById(id);
      if (!lesson) throw new NotFoundException("Урок не найден");
      await this.cache.set(cacheKey, lesson, 60000);
    }

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw new NotFoundException("Курс не найден");

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("Пользователь не найден");

    const isTeacher = course.teacher.toString() === userId;
    const isEnrolled = user.enrolledCourses.some((c) =>
      c.equals(lesson.courseId),
    );

    if (!isTeacher && !isEnrolled)
      throw new ForbiddenException("Нет доступа к уроку");

    return lesson;
  }

  async create(
    courseId: string,
    body: { title: string; content: string; order: number },
    userId: string,
  ) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    const lesson = new this.lessonModel({
      title: body.title,
      content: body.content,
      order: body.order,
      courseId: new Types.ObjectId(courseId),
    });

    await lesson.save();

    course.lessons.push(lesson._id as Types.ObjectId);
    await course.save();

    await this.cache.del(`lessons:course:${courseId}`);
    await this.cache.del(`course:${courseId}`);
    return lesson;
  }

  async update(
    id: string,
    body: { title?: string; content?: string; order?: number },
    userId: string,
  ) {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) throw new NotFoundException("Урок не найден");

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    if (body.title !== undefined) lesson.title = body.title;
    if (body.content !== undefined) lesson.content = body.content;
    if (body.order !== undefined) lesson.order = body.order;

    const saved = await lesson.save();

    await this.cache.del(`lesson:${id}`);
    await this.cache.del(`lessons:course:${lesson.courseId}`);
    return saved;
  }

  async remove(id: string, userId: string) {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) throw new NotFoundException("Урок не найден");

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    course.lessons = course.lessons.filter((l) => l.toString() !== id);
    await course.save();

    const courseId = lesson.courseId.toString();
    await this.lessonModel.deleteOne({ _id: id });

    await this.cache.del(`lesson:${id}`);
    await this.cache.del(`lessons:course:${courseId}`);
    await this.cache.del(`course:${courseId}`);
    return { message: "Урок удалён" };
  }
}
