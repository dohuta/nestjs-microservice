import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TokenModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';

import { ConfigService } from './app/Services/config/config.service';

async function bootstrap() {
  const logger = new Logger(`TOKEN-SERVICE`);

  const app = await NestFactory.create(TokenModule);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: new ConfigService().get('port'),
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices();

  await app.listen(new ConfigService().get('port'));

  logger.log(`🚀 TOKEN is listening...`);
}
bootstrap();
