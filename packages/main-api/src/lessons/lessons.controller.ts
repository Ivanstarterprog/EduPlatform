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
  create(
    @Param("courseId") courseId: string,
    @Body() body: { title: string; content: string; order: number },
    @User("userId") userId: string,
  ) {
    return this.lessonsService.create(courseId, body, userId);
  }

  @Get("lessons/:id")
  @UseGuards(AuthGuard("jwt"))
  findOne(@Param("id") id: string, @User("userId") userId: string) {
    return this.lessonsService.findOne(id, userId);
  }

  @Patch("lessons/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  update(
    @Param("id") id: string,
    @Body() body: { title?: string; content?: string; order?: number },
    @User("userId") userId: string,
  ) {
    return this.lessonsService.update(id, body, userId);
  }

  @Delete("lessons/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  remove(@Param("id") id: string, @User("userId") userId: string) {
    return this.lessonsService.remove(id, userId);
  }
}
