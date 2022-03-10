import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TokenService } from './app.service';
import { ITokenResponse } from './interfaces/token-response.interface';
import { ITokenDataResponse } from './interfaces/token-data-response.interface';
import { ITokenDestroyResponse } from './interfaces/token-destroy-response.interface';

@Controller('token')
export class TokenController {
  // logger declaration
  private readonly logger = new Logger(`TOKEN::${TokenController.name}`);

  constructor(private readonly tokenService: TokenService) {}

  @MessagePattern('token_create')
  public async createToken(data: { userId: number }): Promise<ITokenResponse> {
    this.logger.log(
      `${this.createToken.name} called::request ${JSON.stringify(data)}`
    );
    let result: ITokenResponse;
    if (data && data.userId) {
      try {
        const createResult = await this.tokenService.createToken(data.userId);
        result = {
          status: HttpStatus.CREATED,
          message: 'token_create_success',
          token: createResult.token,
        };
      } catch (e) {
        result = {
          status: HttpStatus.BAD_REQUEST,
          message: 'token_create_bad_request',
          token: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'token_create_bad_request',
        token: null,
      };
    }

    this.logger.log(
      `${this.createToken.name} responses::result ${JSON.stringify(result)}`
    );
    return result;
  }

  @MessagePattern('token_destroy')
  public async destroyToken(data: {
    userId: number;
  }): Promise<ITokenDestroyResponse> {
    this.logger.log(
      `${this.destroyToken.name} called::request ${JSON.stringify(data)}`
    );
    return {
      status: data && data.userId ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message:
        data && data.userId
          ? (await this.tokenService.deleteTokenForUserId(data.userId)) &&
            'token_destroy_success'
          : 'token_destroy_bad_request',
      errors: null,
    };
  }

  @MessagePattern('token_decode')
  public async decodeToken(data: {
    token: string;
  }): Promise<ITokenDataResponse> {
    this.logger.log(
      `${this.decodeToken.name} called::request ${JSON.stringify(data)}`
    );
    const tokenData = await this.tokenService.decodeToken(data.token);
    return {
      status: tokenData ? HttpStatus.OK : HttpStatus.UNAUTHORIZED,
      message: tokenData ? 'token_decode_success' : 'token_decode_unauthorized',
      data: tokenData,
    };
  }
}
