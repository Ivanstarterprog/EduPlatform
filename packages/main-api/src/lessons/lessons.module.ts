import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LessonsController } from "./lessons.controller";
import { LessonsService } from "./lessons.service";
import { Lesson, LessonSchema } from "./schemas/lesson.schema";
import { Course, CourseSchema } from "../courses/schemas/course.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Image, ImageSchema } from "../images/schemas/image.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Image.name, schema: ImageSchema },
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
