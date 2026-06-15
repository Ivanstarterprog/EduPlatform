import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CourseDocument = HydratedDocument<Course>;

class CoverImage {
  @Prop()
  filename?: string;

  @Prop()
  url?: string;

  @Prop({ enum: ["processing", "ready"] })
  status?: string;
}

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  teacher!: Types.ObjectId;

  @Prop({ type: CoverImage, default: null })
  coverImage?: CoverImage | null;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Lesson" }], default: [] })
  lessons!: Types.ObjectId[];

  @Prop({ default: 0 })
  enrolledStudentsCount!: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
