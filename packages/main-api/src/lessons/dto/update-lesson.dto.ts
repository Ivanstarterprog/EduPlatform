import { IsOptional, IsString, IsNumber } from "class-validator";

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
