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
  Param,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

import { Authorization } from '../decorators/authorization.decorator';
import { IAuthorizedRequest } from '../interfaces/common/authorized-request.interface';
import { IServiceUserCreateResponse } from '../interfaces/user/service-user-create-response.interface';
import { IServiceUserSearchResponse } from '../interfaces/user/service-user-search-response.interface';
import { IServiveTokenCreateResponse } from '../interfaces/token/service-token-create-response.interface';
import { IServiceTokenDestroyResponse } from '../interfaces/token/service-token-destroy-response.interface';
import { IServiceUserGetByIdResponse } from '../interfaces/user/service-user-get-by-id-response.interface';

import { GetUserByTokenResponseDto } from '../interfaces/user/dto/get-user-by-token-response.dto';
import { CreateUserDto } from '../interfaces/user/dto/create-user.dto';
import { CreateUserResponseDto } from '../interfaces/user/dto/create-user-response.dto';
import { LoginUserDto } from '../interfaces/user/dto/login-user.dto';
import { LoginUserResponseDto } from '../interfaces/user/dto/login-user-response.dto';
import { LogoutUserResponseDto } from '../interfaces/user/dto/logout-user-response.dto';

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
  @ApiOkResponse({
    type: GetUserByTokenResponseDto,
  })
  public async getUserByToken(
    @Req() request: IAuthorizedRequest
  ): Promise<GetUserByTokenResponseDto> {
    this.logger.log(
      `${this.getUserByToken.name} called::user id${request.user.id}`
    );

    const userInfo = request.user;

    const userResponse: IServiceUserGetByIdResponse = await firstValueFrom(
      this.userServiceClient.send('user_get_by_id', userInfo.id)
    );

    this.logger.log(
      `${this.getUserByToken.name} responses::user id${request.user.id}::user ${userResponse.status}`
    );
    return {
      message: userResponse.message,
      data: {
        user: userResponse.user,
      },
      errors: null,
    };
  }

  @Post('/signup')
  @ApiCreatedResponse({
    type: CreateUserResponseDto,
  })
  public async createUser(
    @Body() userRequest: CreateUserDto
  ): Promise<CreateUserResponseDto> {
    this.logger.log(
      `${this.createUser.name} called::request ${JSON.stringify(userRequest)}`
    );

    const createUserResponse: IServiceUserCreateResponse = await firstValueFrom(
      this.userServiceClient.send('user_create', userRequest)
    );
    if (createUserResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createUserResponse.message,
          data: null,
          errors: createUserResponse.errors,
        },
        createUserResponse.status
      );
    }

    const createTokenResponse: IServiveTokenCreateResponse =
      await firstValueFrom(
        this.tokenServiceClient.send('token_create', {
          userId: createUserResponse.user.id,
        })
      );

    this.logger.log(
      `${this.createUser.name} responses::created ${createTokenResponse.status}`
    );

    return {
      message: createUserResponse.message,
      data: {
        user: createUserResponse.user,
        token: createTokenResponse.token,
      },
      errors: null,
    };
  }

  @Post('/login')
  @ApiCreatedResponse({
    type: LoginUserResponseDto,
  })
  public async loginUser(
    @Body() loginRequest: LoginUserDto
  ): Promise<LoginUserResponseDto> {
    this.logger.log(
      `${this.loginUser.name} called::request ${JSON.stringify(loginRequest)}`
    );

    const getUserResponse: IServiceUserSearchResponse = await firstValueFrom(
      this.userServiceClient.send('user_search_by_credentials', loginRequest)
    );

    if (getUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: getUserResponse.message,
          data: null,
          errors: null,
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    const createTokenResponse: IServiveTokenCreateResponse =
      await firstValueFrom(
        this.tokenServiceClient.send('token_create', {
          userId: getUserResponse.user.id,
        })
      );

    this.logger.log(
      `${this.loginUser.name} responses::auth ${createTokenResponse.status}`
    );

    return {
      message: createTokenResponse.message,
      data: {
        token: createTokenResponse.token,
      },
      errors: null,
    };
  }

  @Put('/logout')
  @Authorization(true)
  @ApiCreatedResponse({
    type: LogoutUserResponseDto,
  })
  public async logoutUser(
    @Req() request: IAuthorizedRequest
  ): Promise<LogoutUserResponseDto> {
    this.logger.log(
      `${this.logoutUser.name} called::user id${request.user.id}`
    );
    const userInfo = request.user;

    const destroyTokenResponse: IServiceTokenDestroyResponse =
      await firstValueFrom(
        this.tokenServiceClient.send('token_destroy', {
          userId: userInfo.id,
        })
      );

    if (destroyTokenResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: destroyTokenResponse.message,
          data: null,
          errors: destroyTokenResponse.errors,
        },
        destroyTokenResponse.status
      );
    }

    this.logger.log(
      `${this.logoutUser.name} responses::destroy auth ${destroyTokenResponse.status}`
    );
    return {
      message: destroyTokenResponse.message,
      errors: null,
      data: null,
    };
  }
}
