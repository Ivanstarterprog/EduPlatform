import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { LessonsService } from "./lessons.service";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../roles/roles.decorator";
import { User } from "../users/decorators/user.decorator";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";

@Controller()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get("courses/:courseId/lessons")
  findByCourse(@Param("courseId") courseId: string) {
    return this.lessonsService.findByCourse(courseId);
  }

  @Post("courses/:courseId/lessons")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  create(@Param("courseId") courseId: string, @Body() dto: CreateLessonDto, @User("userId") userId: string) {
    return this.lessonsService.create(courseId, dto, userId);
  }

  @Get("lessons/:id")
  @UseGuards(AuthGuard("jwt"))
  findOne(@Param("id") id: string, @User("userId") userId: string) {
    return this.lessonsService.findOne(id, userId);
  }

  @Patch("lessons/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  update(@Param("id") id: string, @Body() dto: UpdateLessonDto, @User("userId") userId: string) {
    return this.lessonsService.update(id, dto, userId);
  }

  @Delete("lessons/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  remove(@Param("id") id: string, @User("userId") userId: string) {
    return this.lessonsService.remove(id, userId);
  }
}
