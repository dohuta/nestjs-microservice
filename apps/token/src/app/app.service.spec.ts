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
      const result = await service.createToken(
        'c3e1f1e1-4b22-47f1-89ce-ff410b9234b2'
      );
      expect(result.id).toBeTruthy();
    });
  });
});
