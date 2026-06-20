import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>("REDIS_URL"),
        }),
        ttl: 60000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class RedisModule {}
