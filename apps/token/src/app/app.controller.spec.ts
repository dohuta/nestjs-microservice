import { Test, TestingModule } from '@nestjs/testing';

import { TokenModule } from './app.module';
import { TokenController } from './app.controller';

describe('TOKEN CONTROLLER', () => {
  jest.setTimeout(30000);

  let controller: TokenController;

  beforeAll(async () => {});

  afterAll(async () => {});

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TokenModule],
    }).compile();

    controller = moduleFixture.get<TokenController>(TokenController);
  });

  describe('create token', () => {
    it('[happi case] should create token successfully', async () => {
      const result = await controller.createToken({ userId: "c3e1f1e1-4b22-47f1-89ce-ff410b9234b2" });

      expect(result.message).toBe('token_create_success');
      expect(result.data).toBeTruthy();
    });
  });
});
