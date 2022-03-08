import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NoteModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';

import { ConfigService } from './app/Services/config/config.service';

async function bootstrap() {
  const logger = new Logger(`NOTE-SERVICE`);

  const app = await NestFactory.create(NoteModule);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: new ConfigService().get('port'),
    },
  });

  await app.startAllMicroservices();

  await app.listen(new ConfigService().get('port'));

  logger.log(`🚀 NOTE is listening...`);
}
bootstrap();
