import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { TokenController } from './app.controller';
import { TokenService } from './app.service';
import { JwtConfigService } from './Services/config/jwt-config.service';
import { Note, Token, User } from 'libs/database/src/model/entities';

const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      entities: [Note, Token, User],
    }),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
