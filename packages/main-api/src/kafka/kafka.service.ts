import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;
  private connected = false;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>("KAFKA_CLIENT_ID", "main-api");
    const brokers = (this.configService.get<string>("KAFKA_BROKERS", "localhost:9092")).split(",");

    const kafka = new Kafka({ clientId, brokers });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.connected = true;
      console.log("Kafka producer подключён");
    } catch (err) {
      console.warn("Kafka недоступен, сообщения будут потеряны при первой отправке:", (err as Error).message);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
    } catch {
      // ignore
    }
  }

  async emit(topic: string, message: object) {
    try {
      if (!this.connected) {
        try {
          await this.producer.connect();
          this.connected = true;
        } catch {
          console.warn(`Kafka недоступен, сообщение в ${topic} не отправлено`);
          return;
        }
      }
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (err) {
      console.error(`Ошибка отправки в Kafka (${topic}):`, (err as Error).message);
      this.connected = false;
    }
  }
}
