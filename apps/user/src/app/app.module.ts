import { Module } from '@nestjs/common';

import { DatabaseModule, userProviders } from '@libs/db';

import { UserController } from './app.controller';
import { UserService } from './app.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ...userProviders],
})
export class AppModule {}
