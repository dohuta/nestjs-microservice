import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule, tokenProviders } from '@libs/db';

import { TokenController } from './app.controller';
import { TokenService } from './app.service';
import { JwtConfigService } from './Services/config/jwt-config.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService, ...tokenProviders],
})
export class TokenModule {}
