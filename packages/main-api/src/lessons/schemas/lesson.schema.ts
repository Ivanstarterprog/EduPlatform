import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ default: "" })
  imageUrl!: string;

  @Prop({ enum: ["processing", "ready"], default: "processing" })
  imageStatus!: string;

  @Prop({ type: Types.ObjectId, ref: "Course", required: true })
  courseId!: Types.ObjectId;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
