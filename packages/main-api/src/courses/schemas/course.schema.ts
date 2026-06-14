import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  teacher!: Types.ObjectId;

  @Prop({ default: "" })
  coverImageUrl!: string;

  @Prop({ enum: ["processing", "ready"], default: "processing" })
  coverImageStatus!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Lesson" }], default: [] })
  lessons!: Types.ObjectId[];

  @Prop({ default: 0 })
  enrolledStudentsCount!: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
