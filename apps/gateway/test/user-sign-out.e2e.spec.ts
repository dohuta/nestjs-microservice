import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app/app.module';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';

describe('Users Sign Out (e2e)', () => {
  jest.setTimeout(30000);

  let app;
  let userToken;

  afterAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
    // close connection
    await mongoose.connection.close();
    await app.close()
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/ (POST) - should create a valid user', (done) => {
    request(app.getHttpServer())
      .post('/users/signup')
      .send(userSignupRequestSuccess)
      .expect(201)
      .end(done);
  });

  it('/users/login (POST) - should create a token for valid credentials', (done) => {
    request(app.getHttpServer())
      .post('/users/login')
      .send(userSignupRequestSuccess)
      .expect(201)
      .expect((res) => {
        userToken = res.body.data.token;
      })
      .end(done);
  });

  it('/users/ (GET) - should retrieve user by a valid token', (done) => {
    request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', userToken)
      .send()
      .expect(200)
      .end(done);
  });

  it('/users/logout (POST) - should destroy token for user', (done) => {
    request(app.getHttpServer())
      .put('/users/logout')
      .set('Authorization', userToken)
      .expect(200)
      .expect({
        message: 'token_destroy_success',
        errors: null,
        data: null,
      })
      .end(done);
  });

  it('/users/ (GET) - should not retrieve user by a destroyed token', (done) => {
    request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', userToken)
      .send()
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });
});
