import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigService } from './Services/config/config.service';
import { IUser } from './interfaces/user.interface';
import { IUserLink } from './interfaces/user-link.interface';

@Injectable()
export class UserService {
  // logger declaration
  private readonly logger = new Logger(`USER::${UserService.name}`);

  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('UserLink') private readonly userLinkModel: Model<IUserLink>,
    private readonly configService: ConfigService
  ) {}

  public async searchUser(params: { email: string }): Promise<IUser[]> {
    this.logger.log(`${this.searchUser.name} called`);
    return this.userModel.find(params).exec();
  }

  public async searchUserById(id: string): Promise<IUser> {
    this.logger.log(`${this.searchUserById.name} called`);
    return this.userModel.findById(id).exec();
  }

  public async createUser(user: IUser): Promise<IUser> {
    this.logger.log(`${this.createUser.name} called`);
    const userModel = new this.userModel(user);
    return await userModel.save();
  }

  public async createUserLink(id: string): Promise<IUserLink> {
    this.logger.log(`${this.createUserLink.name} called`);
    const userLinkModel = new this.userLinkModel({
      user_id: id,
    });
    return await userLinkModel.save();
  }

  public async getUserLink(link: string): Promise<IUserLink[]> {
    this.logger.log(`${this.getUserLink.name} called`);
    return this.userLinkModel.find({ link, is_used: false }).exec();
  }

  public async updateUserLinkById(
    id: string,
    linkParams: { is_used: boolean }
  ): Promise<IUserLink> {
    this.logger.log(`${this.updateUserLinkById.name} called`);
    const updated = await this.userLinkModel.updateOne({ _id: id }, linkParams);
    return this.userLinkModel.findById(id).exec();
  }

  public getConfirmationLink(link: string): string {
    this.logger.log(`${this.getConfirmationLink.name} called`);
    return `${this.configService.get('baseUri')}:${this.configService.get(
      'gatewayPort'
    )}/users/confirm/${link}`;
  }
}
