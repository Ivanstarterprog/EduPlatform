import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  StreamableFile,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { join, resolve, extname } from "path";
import { createReadStream, existsSync } from "fs";
import { Image, ImageDocument } from "./schemas/image.schema";
import { Course, CourseDocument } from "../courses/schemas/course.schema";
import { Lesson, LessonDocument } from "../lessons/schemas/lesson.schema";
import { KafkaService } from "../kafka/kafka.service";

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private kafka: KafkaService,
  ) {}

  async uploadCover(courseId: string, file: Express.Multer.File, userId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    const image = await this.imageModel.create({
      filename: file.filename,
      originalPath: file.path,
      status: "processing",
      url: "",
      entityType: "course",
      entityId: new Types.ObjectId(courseId),
    });

    course.coverImage = { filename: file.filename, url: "", status: "processing" };
    await course.save();

    await this.kafka.emit("image.uploaded", {
      imageId: image._id.toString(),
      filename: file.filename,
      originalPath: file.path,
      entityType: "course",
      entityId: courseId,
    });

    return { message: "Изображение загружено, обработка запущена", imageId: image._id };
  }

  async uploadLessonImage(lessonId: string, file: Express.Multer.File, userId: string) {
    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) throw new NotFoundException("Урок не найден");

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw new NotFoundException("Курс не найден");
    if (course.teacher.toString() !== userId)
      throw new ForbiddenException("Вы не владелец курса");

    const image = await this.imageModel.create({
      filename: file.filename,
      originalPath: file.path,
      status: "processing",
      url: "",
      entityType: "lesson",
      entityId: new Types.ObjectId(lessonId),
    });

    lesson.images = lesson.images || [];
    lesson.images.push({ filename: file.filename, url: "", status: "processing" });
    await lesson.save();

    await this.kafka.emit("image.uploaded", {
      imageId: image._id.toString(),
      filename: file.filename,
      originalPath: file.path,
      entityType: "lesson",
      entityId: lessonId,
    });

    return { message: "Изображение загружено, обработка запущена", imageId: image._id };
  }

  async getImage(filename: string): Promise<StreamableFile> {
    const processedPath = join(resolve(__dirname, "..", "..", "..", ".."), "uploads", "processed", filename);
    if (!existsSync(processedPath)) {
      throw new NotFoundException("Изображение ещё не обработано или не найдено");
    }
    const ext = extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };
    const file = createReadStream(processedPath);
    return new StreamableFile(file, { type: mimeMap[ext] || "application/octet-stream" });
  }
}
