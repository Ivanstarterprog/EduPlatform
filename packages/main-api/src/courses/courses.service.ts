import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Course, CourseDocument } from "./schemas/course.schema";
import { User, UserDocument } from "../users/schemas/user.schema";

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll() {
    const cached = await this.cache.get<CourseDocument[]>("courses_all");
    if (cached) return cached;

    const courses = await this.courseModel
      .find()
      .populate("teacher", "name email")
      .exec();

    await this.cache.set("courses_all", courses, 60000);
    return courses;
  }

  async findOne(id: string) {
    const cacheKey = `course:${id}`;
    const cached = await this.cache.get<CourseDocument>(cacheKey);
    if (cached) return cached;

    const course = await this.courseModel
      .findById(id)
      .populate("teacher", "name email")
      .populate("lessons")
      .exec();
    if (!course) throw new NotFoundException("Курс не найден");

    await this.cache.set(cacheKey, course, 60000);
    return course;
  }

  async create(title: string, description: string, teacherId: string) {
    const course = new this.courseModel({
      title,
      description,
      teacher: new Types.ObjectId(teacherId),
    });
    const saved = await course.save();
    await this.cache.del("courses_all");
    return saved;
  }

  async update(
    id: string,
    body: { title?: string; description?: string },
    userId: string,
  ) {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    if (body.title !== undefined) course.title = body.title;
    if (body.description !== undefined) course.description = body.description;
    const saved = await course.save();

    await this.cache.del("courses_all");
    await this.cache.del(`course:${id}`);
    return saved;
  }

  async remove(id: string, userId: string) {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    await this.courseModel.deleteOne({ _id: id });

    await this.cache.del("courses_all");
    await this.cache.del(`course:${id}`);
    return { message: "Курс удалён" };
  }

  async enroll(id: string, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("Пользователь не найден");

    const courseId = new Types.ObjectId(id);
    if (user.enrolledCourses.some((c) => c.equals(courseId)))
      throw new ConflictException("Вы уже записаны на этот курс");

    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException("Курс не найден");

    user.enrolledCourses.push(courseId);
    course.enrolledStudentsCount += 1;

    await user.save();
    await course.save();

    await this.cache.del(`course:${id}`);
    return { message: "Вы успешно записаны на курс" };
  }
}
