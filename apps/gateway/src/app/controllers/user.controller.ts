import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Req,
  Inject,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

import {
  BaseResponse,
  FindUserResponse,
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
} from '@libs/dtos';
import { Authorization } from '../decorators/authorization.decorator';
import { IAuthorizedRequest } from '../../interfaces/ICommon';
import { ApiBaseResponse } from '../decorators/baseResponse.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  // logger declaration
  private readonly logger = new Logger(`GATEWAY::${UsersController.name}`);

  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy
  ) {}

  @Get()
  @Authorization(true)
  @ApiBaseResponse({ model: FindUserResponse, dataType: 'array' })
  public async getUserByToken(
    @Req() request: IAuthorizedRequest
  ): Promise<BaseResponse<FindUserResponse[]>> {
    this.logger.log(
      `${this.getUserByToken.name} called::user id${request.user.id}`
    );

    const userInfo = request.user;

    const response: BaseResponse<FindUserResponse[]> = await firstValueFrom(
      this.userServiceClient.send('user_get_by_id', userInfo.id)
    );

    this.logger.log(
      `${this.getUserByToken.name} responses::user id${request.user.id}::user ${response.status}`
    );
    return response;
  }

  @Post('/signup')
  @ApiBaseResponse({ dataType: 'string' })
  public async createUser(
    @Body() userRequest: SignUpPayload
  ): Promise<BaseResponse<String>> {
    this.logger.log(
      `${this.createUser.name} called::request ${JSON.stringify(userRequest)}`
    );

    const createUserResponse: BaseResponse<SignUpResponse> =
      await firstValueFrom(
        this.userServiceClient.send('user_create', userRequest)
      );
    if (createUserResponse.status !== HttpStatus.CREATED) {
      return {
        status: createUserResponse.status,
        message: createUserResponse.message,
        data:
          typeof createUserResponse.data === 'string'
            ? createUserResponse.data
            : null,
      };
    }

    const createTokenResponse: BaseResponse<String> = await firstValueFrom(
      this.tokenServiceClient.send('token_create', {
        userId: createUserResponse.data.id,
      })
    );

    this.logger.log(
      `${this.createUser.name} responses::created ${createTokenResponse.status}`
    );

    return createTokenResponse;
  }

  @Post('/login')
  @ApiBaseResponse({ model: SignUpResponse, dataType: 'object' })
  public async loginUser(
    @Body() loginRequest: SignInPayload
  ): Promise<BaseResponse<SignInResponse>> {
    this.logger.log(
      `${this.loginUser.name} called::request ${JSON.stringify(loginRequest)}`
    );

    const getUserResponse: BaseResponse<FindUserResponse> =
      await firstValueFrom(
        this.userServiceClient.send('user_search_by_email', loginRequest)
      );

    if (getUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: getUserResponse.message,
          data: getUserResponse.data,
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    const createTokenResponse: BaseResponse<string> =
      await firstValueFrom(
        this.tokenServiceClient.send('token_create', {
          userId: getUserResponse.data.id,
        })
      );

    this.logger.log(
      `${this.loginUser.name} responses::auth ${createTokenResponse.status}`
    );

    return {
      status: HttpStatus.OK,
      message: createTokenResponse.message,
      data: {
        token: createTokenResponse.data,
      },
    };
  }

  @Put('/logout')
  @Authorization(true)
  @ApiBaseResponse({ dataType: 'boolean' })
  public async logoutUser(
    @Req() request: IAuthorizedRequest
  ): Promise<BaseResponse<Boolean>> {
    this.logger.log(
      `${this.logoutUser.name} called::user id${request.user.id}`
    );
    const userInfo = request.user;

    const destroyTokenResponse: BaseResponse<Boolean> = await firstValueFrom(
      this.tokenServiceClient.send('token_destroy', {
        userId: userInfo.id,
      })
    );

    if (destroyTokenResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: destroyTokenResponse.message,
          data: false,
        },
        destroyTokenResponse.status
      );
    }

    this.logger.log(
      `${this.logoutUser.name} responses::destroy auth ${destroyTokenResponse.status}`
    );
    return {
      status: HttpStatus.OK,
      message: destroyTokenResponse.message,
      data: true,
    };
  }
}
