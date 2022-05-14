import { Module } from '@nestjs/common';

import { DatabaseModule, noteProviders } from '@libs/db';

import { NoteController } from './app.controller';
import { NoteService } from './app.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NoteController],
  providers: [NoteService, ...noteProviders],
})
export class NoteModule {}
