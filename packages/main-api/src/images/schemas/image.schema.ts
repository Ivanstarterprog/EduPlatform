import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ImageDocument = HydratedDocument<Image>;

@Schema({ timestamps: true })
export class Image {
  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  originalPath!: string;

  @Prop({ enum: ["processing", "ready"], default: "processing" })
  status!: string;

  @Prop({ default: "" })
  url!: string;

  @Prop({ enum: ["course", "lesson"], required: true })
  entityType!: string;

  @Prop({ type: Types.ObjectId, required: true })
  entityId!: Types.ObjectId;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
