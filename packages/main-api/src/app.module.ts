import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { CoursesModule } from "./courses/courses.module";
import { LessonsModule } from "./lessons/lessons.module";
import { RedisModule } from "./redis/redis.module";
import { KafkaModule } from "./kafka/kafka.module";
import { ImagesModule } from "./images/images.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    KafkaModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    ImagesModule,
  ],
})
export class AppModule {}
