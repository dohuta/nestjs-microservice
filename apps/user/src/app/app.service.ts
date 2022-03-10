import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './../../../../libs/database/src/model/entities/User';
import { ConfigService } from './Services/config/config.service';
import { IUser } from './interfaces/user.interface';
import { IUserLink } from './interfaces/user-link.interface';

@Injectable()
export class UserService {
  // logger declaration
  private readonly logger = new Logger(`USER::${UserService.name}`);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async searchUser(params: { email: string }): Promise<User[]> {
    this.logger.log(`${this.searchUser.name} called`);
    return this.usersRepository.find(params);
  }

  public async searchUserById(id: number): Promise<User> {
    this.logger.log(`${this.searchUserById.name} called`);
    return this.usersRepository.findOne(id);
  }

  public async createUser(user: IUser): Promise<User> {
    this.logger.log(`${this.createUser.name} called`);
    const u = new User();
    u.email = user.email;
    u.password = user.password;
    u.isConfirmed = true;
    return this.usersRepository.save(u);
  }
}
