import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from "cookie-parser";
import {Transport} from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice({
      transport : Transport.TCP,
      port: 4040,
          });

  app.use(cookieParser());

  await app.startAllMicroservices( () => console.log("All services are Up"));
  await app.listen(4040);
}
bootstrap();
