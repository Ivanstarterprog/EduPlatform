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
import { CoursesService } from "./courses.service";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../roles/roles.decorator";
import { User } from "../users/decorators/user.decorator";

@Controller("courses")
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  create(
    @Body() body: { title: string; description: string },
    @User("userId") userId: string,
  ) {
    return this.coursesService.create(body.title, body.description, userId);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  update(
    @Param("id") id: string,
    @Body() body: { title?: string; description?: string },
    @User("userId") userId: string,
  ) {
    return this.coursesService.update(id, body, userId);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  remove(@Param("id") id: string, @User("userId") userId: string) {
    return this.coursesService.remove(id, userId);
  }

  @Post(":id/enroll")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("student")
  enroll(@Param("id") id: string, @User("userId") userId: string) {
    return this.coursesService.enroll(id, userId);
  }
}
