import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Main API запущен на порту ${port}`);
}
bootstrap().catch((err) => {
  console.error("❌ Ошибка запуска сервера", err);
  process.exit(1);
});
