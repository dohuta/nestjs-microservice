import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { TokenSchema } from './schemas/token.schema';
import { TokenController } from './app.controller';
import { TokenService } from './app.service';
import { MongoConfigService } from './Services/config/mongo-config.service';
import { JwtConfigService } from './Services/config/jwt-config.service';

describe('TOKEN SERVICE', () => {
  jest.setTimeout(30000);

  let service: TokenService;

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

    service = app.get<TokenService>(TokenService);
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
      const result = await service.createToken('test');
      expect(result.user_id).toBe('test');
      expect(result.token).toBeTruthy();
    });
  });
});
