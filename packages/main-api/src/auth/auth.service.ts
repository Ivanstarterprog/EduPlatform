import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "../users/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string, role: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException("Почта уже существует");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: role === "teacher" ? "teacher" : "student",
    });
    await user.save();
    return { message: "Юзер успешно зарегался" };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user)
      throw new UnauthorizedException("Такого пользователя не существует!");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException(
        "Неправильный пароль! Такой пароль у пользователя ...",
      );

    const payload = { sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token, role: user.role };
  }
}
