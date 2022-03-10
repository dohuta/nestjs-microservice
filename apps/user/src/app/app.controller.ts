import { Controller, HttpStatus, Inject, Logger } from '@nestjs/common';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

import { UserService } from './app.service';
import { IUser } from './interfaces/user.interface';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';
import { IUserSearchResponse } from './interfaces/user-search-response.interface';

@Controller('user')
export class UserController {
  // logger declaration
  private readonly logger = new Logger(`USER::${UserController.name}`);

  constructor(private readonly userService: UserService) {}

  @MessagePattern('user_search_by_credentials')
  public async searchUserByCredentials(searchParams: {
    email: string;
    password: string;
  }): Promise<IUserSearchResponse> {
    this.logger.log(
      `${this.searchUserByCredentials.name} called::request ${JSON.stringify(
        searchParams
      )}`
    );

    let result: IUserSearchResponse;

    if (searchParams.email && searchParams.password) {
      const user = await this.userService.searchUser({
        email: searchParams.email,
      });

      if (user && user[0]) {
        if (user[0].password == searchParams.password) {
          result = {
            status: HttpStatus.OK,
            message: 'user_search_by_credentials_success',
            user: user[0],
          };
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'user_search_by_credentials_not_match',
            user: null,
          };
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_search_by_credentials_not_found',
          user: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_found',
        user: null,
      };
    }

    this.logger.log(
      `${this.searchUserByCredentials.name} responses::result ${JSON.stringify(
        result
      )}`
    );

    return result;
  }

  @MessagePattern('user_get_by_id')
  public async getUserById(id: number): Promise<IUserSearchResponse> {
    this.logger.log(`${this.getUserById.name} called::request ${id}`);

    let result: IUserSearchResponse;

    if (id) {
      const user = await this.userService.searchUserById(id);
      if (user) {
        result = {
          status: HttpStatus.OK,
          message: 'user_get_by_id_success',
          user,
        };
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_get_by_id_not_found',
          user: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_get_by_id_bad_request',
        user: null,
      };
    }

    this.logger.log(
      `${this.getUserById.name} response::result ${JSON.stringify(result)}`
    );

    return result;
  }

  @MessagePattern('user_create')
  public async createUser(userParams: IUser): Promise<IUserCreateResponse> {
    this.logger.log(
      `${this.createUser.name} called::request ${JSON.stringify(
        JSON.stringify(userParams)
      )}`
    );

    let result: IUserCreateResponse;

    if (userParams) {
      const usersWithEmail = await this.userService.searchUser({
        email: userParams.email,
      });

      if (usersWithEmail && usersWithEmail.length > 0) {
        result = {
          status: HttpStatus.CONFLICT,
          message: 'user_create_conflict',
          user: null,
          errors: {
            email: {
              message: 'Email already exists',
              path: 'email',
            },
          },
        };
      } else {
        try {
          userParams.is_confirmed = true;
          const createdUser = await this.userService.createUser(userParams);
          delete createdUser.password;
          result = {
            status: HttpStatus.CREATED,
            message: 'user_create_success',
            user: createdUser,
            errors: null,
          };
        } catch (e) {
          result = {
            status: HttpStatus.PRECONDITION_FAILED,
            message: 'user_create_precondition_failed',
            user: null,
            errors: e.errors,
          };
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_create_bad_request',
        user: null,
        errors: null,
      };
    }

    this.logger.log(
      `${this.createUser.name} responses::result ${JSON.stringify(
        JSON.stringify(result)
      )}`
    );

    return result;
  }

  private compareEncryptedPassword(a, b) {
    return bcrypt.compare(b, a);
  }
}
