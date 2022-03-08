import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { TokenSchema } from './schemas/token.schema';
import { TokenController } from './app.controller';
import { TokenService } from './app.service';
import { MongoConfigService } from './Services/config/mongo-config.service';
import { JwtConfigService } from './Services/config/jwt-config.service';

describe('TOKEN CONTROLLER', () => {
  jest.setTimeout(30000);

  let controller: TokenController;

  beforeAll(async () => {
    // connect to db
    // use this mongo connection to verify result
    await mongoose.connect(process.env.MONGO_URI);

    const app = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          useClass: JwtConfigService,
        }),
        MongooseModule.forRootAsync({
          useClass: MongoConfigService,
        }),
        MongooseModule.forFeature([
          {
            name: 'Token',
            schema: TokenSchema,
          },
        ]),
      ],
      controllers: [TokenController],
      providers: [TokenService],
    }).compile();
    controller = app.get<TokenController>(TokenController);
  });

  afterAll(async () => {
    // cleanup env
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
    // close connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropCollection('tokens');
  });

  describe('create token', () => {
    it('[happi case] should create token successfully', async () => {
      const result = await controller.createToken({ userId: 'test' });

      expect(result.message).toBe('token_create_success');
      expect(result.token).toBeTruthy();
    });
  });
});
