import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';

import { AppModule } from './app.module';
import { UserController } from './app.controller';
import { IUser } from './interfaces/user.interface';

describe('User microservice', () => {
  jest.setTimeout(30000);

  let controller: UserController;

  beforeAll(async () => {
    // connect to db
    // use this mongo connection to verify result
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    // clean up db after testing
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
    // close connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    controller = moduleFixture.get<UserController>(UserController);

    // clean up db bf every unit test
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  it('should create a valid user', async () => {
    const requestData = {
      email: 'test@test.com',
      password: 'test111',
    };
    const result = await controller.createUser(requestData);

    expect(result.status).toBe(201);
    expect(result.message).toBe('user_create_success');
    expect(result.user).toBeTruthy();
    expect(result.user.id).toBeTruthy();
  });
});
