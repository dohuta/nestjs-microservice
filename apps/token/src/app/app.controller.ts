import { Controller, HttpStatus, Logger, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { TokenService } from './app.service';
import { BaseResponse, TokenDecodedPayload } from '@libs/dtos';
import { Token } from '@libs/db';

@Controller('token')
export class TokenController {
  // logger declaration
  private readonly logger = new Logger(`TOKEN::${TokenController.name}`);

  constructor(private readonly tokenService: TokenService) {}

  @MessagePattern('token_create')
  public async createToken(data: {
    userId: string;
  }): Promise<BaseResponse<string>> {
    this.logger.log(
      `${this.createToken.name} called::request ${JSON.stringify(data)}`
    );
    let result: BaseResponse<string>;
    if (data && data.userId) {
      try {
        const createResult = await this.tokenService.createToken(data.userId);
        result = {
          status: HttpStatus.CREATED,
          message: 'token_create_success',
          data: createResult.token,
        };
      } catch (e) {
        result = {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'token_create_bad_request',
          data: e.message || '',
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'token_create_bad_request',
        data: 'Vui lòng cung cấp user id',
      };
    }

    this.logger.log(
      `${this.createToken.name} responses::result ${JSON.stringify(result)}`
    );
    return result;
  }

  @MessagePattern('token_destroy')
  public async destroyToken(data: {
    userId: string;
  }): Promise<BaseResponse<Boolean>> {
    this.logger.log(
      `${this.destroyToken.name} called::request ${JSON.stringify(data)}`
    );
    const result = await this.tokenService.deleteTokenForUserId(data.userId);
    return {
      status: data && data.userId ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message:
        data && data.userId && result
          ? 'token_destroy_success'
          : 'token_destroy_bad_request',
      data: result || false,
    };
  }

  @MessagePattern('token_decode')
  public async decodeToken(data: {
    token: string;
  }): Promise<BaseResponse<TokenDecodedPayload>> {
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
