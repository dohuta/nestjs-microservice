import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Token } from 'libs/database/src/model/entities';
import { IToken } from './interfaces/token.interface';

@Injectable()
export class TokenService {
  // logger declaration
  private readonly logger = new Logger(`TOKEN::${TokenService.name}`);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>
  ) {}

  public createToken(userId: number): Promise<Token> {
    this.logger.log(`${this.createToken.name} called`);

    const token = this.jwtService.sign(
      {
        userId,
      },
      {
        expiresIn: 30 * 24 * 60 * 60,
      }
    );

    return this.tokenRepository.save({
      token,
      user: {
        id: userId,
      },
    });
  }

  public async deleteTokenForUserId(
    userId: number
  ): Promise<Token | undefined> {
    this.logger.log(`${this.deleteTokenForUserId.name} called`);

    const token = await this.tokenRepository.find({
      where: { user: { id: userId } },
    });
    const result = await this.tokenRepository.remove(token);
    return result && result.length ? result[0] : undefined;
  }

  public async decodeToken(token: string) {
    this.logger.log(`${this.decodeToken.name} called`);

    const tokenModel = await this.tokenRepository.find({
      where: { token },
    });
    let result = null;

    if (tokenModel && tokenModel[0]) {
      try {
        const tokenData = this.jwtService.decode(tokenModel[0].token) as {
          exp: number;
          userId: any;
        };
        if (!tokenData || tokenData.exp <= Math.floor(+new Date() / 1000)) {
          result = null;
        } else {
          result = {
            userId: tokenData.userId,
          };
        }
      } catch (e) {
        result = null;
      }
    }
    return result;
  }
}
