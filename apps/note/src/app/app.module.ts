import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { NoteController } from './app.controller';
import { NoteService } from './app.service';
import { Note, Token, User } from 'libs/database/src/model/entities';

const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      entities: [Note, Token, User],
    }),
    TypeOrmModule.forFeature([Note]),
  ],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
