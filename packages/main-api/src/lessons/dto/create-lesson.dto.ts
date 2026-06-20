import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  order!: number;
}
