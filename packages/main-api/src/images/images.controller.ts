import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join, resolve } from "path";
import { ImagesService } from "./images.service";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../roles/roles.decorator";
import { User } from "../users/decorators/user.decorator";

@Controller()
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Post("courses/:id/cover")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: join(resolve(__dirname, "..", "..", "..", ".."), "uploads", "original"),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadCover(
    @Param("id") courseId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @User("userId") userId: string,
  ) {
    return this.imagesService.uploadCover(courseId, file, userId);
  }

  @Post("lessons/:id/images")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("teacher")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: join(resolve(__dirname, "..", "..", "..", ".."), "uploads", "original"),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadLessonImage(
    @Param("id") lessonId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @User("userId") userId: string,
  ) {
    return this.imagesService.uploadLessonImage(lessonId, file, userId);
  }

  @Get("images/:filename")
  getImage(@Param("filename") filename: string) {
    return this.imagesService.getImage(filename);
  }
}
