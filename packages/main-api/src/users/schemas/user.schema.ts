import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: String, enum: ["student", "teacher"], default: "student" })
  role!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Course" }], default: [] })
  enrolledCourses!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
