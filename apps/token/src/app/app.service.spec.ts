import { Test, TestingModule } from '@nestjs/testing';

import { TokenService } from './app.service';
import { TokenModule } from './app.module';

describe('TOKEN SERVICE', () => {
  jest.setTimeout(30000);

  let service: TokenService;

  beforeAll(async () => {});

  afterAll(async () => {});

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TokenModule],
    }).compile();

    service = moduleFixture.get<TokenService>(TokenService);
  });

  describe('create token', () => {
    it('[happi case] should create token successfully', async () => {
      const result = await service.createToken(2);
      expect(result.user.id).toBe(2);
      expect(result.token).toBeTruthy();
    });
  });
});
