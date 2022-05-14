import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Token } from '@libs/db';

@Injectable()
export class TokenService {
  // logger declaration
  private readonly logger = new Logger(`TOKEN::${TokenService.name}`);

  constructor(
    private readonly jwtService: JwtService,
    @Inject('TOKEN_REPOSITORY')
    private readonly repo: typeof Token
  ) {}

  public async createToken(userId: string): Promise<Token> {
    this.logger.log(`${this.createToken.name} called`);

    const token = this.jwtService.sign(
      {
        userId,
      },
      {
        expiresIn: 30 * 24 * 60 * 60,
      }
    );
    return this.repo.create({
      token: token,
      userId: userId,
    });
  }

  public async deleteTokenForUserId(userId: string): Promise<Boolean> {
    this.logger.log(`${this.deleteTokenForUserId.name} called`);

    const result = await this.repo.destroy({
      where: {
        userId,
      },
    });
    return !!result;
  }

  public async decodeToken(token: string): Promise<{ userId: string } | null> {
    this.logger.log(`${this.decodeToken.name} called`);

    const tokenModel = await this.repo.findOne({
      where: { token },
    });
    let result = null;

    if (tokenModel) {
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
