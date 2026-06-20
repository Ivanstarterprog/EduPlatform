import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ImagesController } from "./images.controller";
import { ImagesService } from "./images.service";
import { Image, ImageSchema } from "./schemas/image.schema";
import { Course, CourseSchema } from "../courses/schemas/course.schema";
import { Lesson, LessonSchema } from "../lessons/schemas/lesson.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Image.name, schema: ImageSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
