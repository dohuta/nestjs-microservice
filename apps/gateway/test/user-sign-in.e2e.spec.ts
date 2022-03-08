import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app/app.module';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';
import {
  userLoginRequestFailWrongPw,
  userLoginRequestFailWrongEmail,
} from './mocks/user-login-request-fail.mock';

describe('Users Sign In (e2e)', () => {
  jest.setTimeout(30000);

  let app;

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

  it('/users/login (POST) - should not create a token for invalid email', (done) => {
    request(app.getHttpServer())
      .post('/users/login')
      .send(userLoginRequestFailWrongEmail)
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_found',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/users/login (POST) - should not create a token for invalid password', (done) => {
    request(app.getHttpServer())
      .post('/users/login')
      .send(userLoginRequestFailWrongPw)
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_match',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/users/login (POST) - should not create a token for empty body', (done) => {
    request(app.getHttpServer())
      .post('/users/login')
      .send()
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_found',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/users/login (POST) - should not create a token for string value in body', (done) => {
    request(app.getHttpServer())
      .post('/users/login')
      .send(userSignupRequestSuccess.email)
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_found',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/users/login (POST) - should create a token for valid credentials', (done) => {
    request(app.getHttpServer())
      .post('/users/login')
      .send(userSignupRequestSuccess)
      .expect(201)
      .expect((res) => {
        res.body.data.token = 'fake_value';
      })
      .expect({
        message: 'token_create_success',
        data: {
          token: 'fake_value',
        },
        errors: null,
      })
      .end(done);
  });
});
