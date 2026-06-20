import { IsEmail, IsString, MinLength, IsOptional, IsIn } from "class-validator";

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(["student", "teacher"])
  role?: string;
}
