import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type LessonDocument = HydratedDocument<Lesson>;

class LessonImage {
  @Prop()
  filename?: string;

  @Prop()
  url?: string;

  @Prop({ enum: ["processing", "ready"] })
  status?: string;
}

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ type: [LessonImage], default: [] })
  images?: LessonImage[];

  @Prop({ type: Types.ObjectId, ref: "Course", required: true })
  courseId!: Types.ObjectId;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
