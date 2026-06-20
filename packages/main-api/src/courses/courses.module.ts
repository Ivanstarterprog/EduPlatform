import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { Course, CourseSchema } from "./schemas/course.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Lesson, LessonSchema } from "../lessons/schemas/lesson.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
