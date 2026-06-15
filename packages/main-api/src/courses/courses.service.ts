import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Course, CourseDocument } from "./schemas/course.schema";
import { InjectModel as InjectUserModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../users/schemas/user.schema";

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectUserModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    return this.courseModel.find().populate("teacher", "name email").exec();
  }

  async findOne(id: string) {
    const course = await this.courseModel
      .findById(id)
      .populate("teacher", "name email")
      .populate("lessons")
      .exec();
    if (!course) throw new NotFoundException("Курс не найден");
    return course;
  }

  async create(title: string, description: string, teacherId: string) {
    const course = new this.courseModel({
      title,
      description,
      teacher: new Types.ObjectId(teacherId),
    });
    return course.save();
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
    return course.save();
  }

  async remove(id: string, userId: string) {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    await this.courseModel.deleteOne({ _id: id });
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

    return { message: "Вы успешно записаны на курс" };
  }
}
