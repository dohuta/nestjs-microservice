import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app/app.module';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';
import { noteCreateRequestSuccess } from './mocks/note-create-request-success.mock';
import { noteUpdateRequestSuccess } from './mocks/note-update-request-success.mock';

describe('Notes (e2e)', () => {
  jest.setTimeout(30000);

  let app;
  let user;
  let noteId: number;
  let userToken: string;

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

  it('/users/ (POST) - should create a user for checking notes api', (done) => {
    request(app.getHttpServer())
      .post('/users/signup')
      .send(userSignupRequestSuccess)
      .expect(201)
      .expect((res) => {
        user = res.body.data.user;
      })
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

  it('/notes (GET) - should not get notes without valid token', (done) => {
    request(app.getHttpServer())
      .get('/notes')
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/notes (POST) - should not create a note without a valid token', (done) => {
    request(app.getHttpServer())
      .post('/notes')
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/notes (POST) - should not create a note with an invalid token', (done) => {
    request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', userToken + 1)
      .send(noteCreateRequestSuccess)
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/notes (GET) - should not retrieve notes without a valid token', (done) => {
    request(app.getHttpServer())
      .get('/notes')
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/notes (GET) - should not retrieve notes with an valid token', (done) => {
    request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', userToken + 1)
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/notes (POST) - should create a note for the user with a valid token', (done) => {
    request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', userToken)
      .send(noteCreateRequestSuccess)
      .expect(201)
      .expect((res) => {
        noteId = res.body.data.note.id;
        res.body.data.note.id = 'fake_value';
        res.body.data.note.created_at = 'fake_value';
        res.body.data.note.updated_at = 'fake_value';
      })
      .expect({
        message: 'note_create_success',
        data: {
          note: {
            name: noteCreateRequestSuccess.name,
            content: noteCreateRequestSuccess.content,
            user_id: user.id,
            created_at: 'fake_value',
            updated_at: 'fake_value',
            id: 'fake_value',
          },
        },
        errors: null,
      })
      .end(done);
  });

  it('/notes (POST) - should not create a note with invalid params', (done) => {
    request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', userToken)
      .send(null)
      .expect(412)
      .expect((res) => {
        res.body.errors.name.properties = 'fake_properties';
      })
      .expect({
        message: 'note_create_precondition_failed',
        data: null,
        errors: {
          name: {
            message: 'Name can not be empty',
            name: 'ValidatorError',
            properties: 'fake_properties',
            kind: 'required',
            path: 'name',
          },
        },
      })
      .end(done);
  });

  it('/notes (GET) - should retrieve notes for a valid token', (done) => {
    request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', userToken)
      .expect(200)
      .expect((res) => {
        res.body.data.notes[0].created_at = 'fake_value';
        res.body.data.notes[0].updated_at = 'fake_value';
      })
      .expect({
        message: 'note_search_by_user_id_success',
        data: {
          notes: [
            {
              name: noteCreateRequestSuccess.name,
              content: noteCreateRequestSuccess.content,
              user_id: user.id,
              created_at: 'fake_value',
              updated_at: 'fake_value',
              id: noteId,
            },
          ],
        },
        errors: null,
      })
      .end(done);
  });

  it('/notes/{id} (PUT) - should not note with invalid token', (done) => {
    request(app.getHttpServer())
      .put(`/notes/${noteId}`)
      .send(noteUpdateRequestSuccess)
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/notes/{id} (PUT) - should update note with valid params', (done) => {
    request(app.getHttpServer())
      .put(`/notes/${noteId}`)
      .set('Authorization', userToken)
      .send(noteUpdateRequestSuccess)
      .expect(200)
      .expect((res) => {
        res.body.data.note.created_at = 'fake_value';
        res.body.data.note.updated_at = 'fake_value';
      })
      .expect({
        message: 'note_update_by_id_success',
        data: {
          note: {
            name: noteUpdateRequestSuccess.name,
            content: noteUpdateRequestSuccess.content,
            user_id: user.id,
            created_at: 'fake_value',
            updated_at: 'fake_value',
            id: noteId,
          },
        },
        errors: null,
      })
      .end(done);
  });

  it('/notes/{id} (DELETE) - should not delete note with invalid token', (done) => {
    request(app.getHttpServer())
      .delete(`/notes/${noteId}`)
      .send()
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      })
      .end(done);
  });

  it('/notes/{id} (DELETE) - should delete note with a valid token', (done) => {
    request(app.getHttpServer())
      .delete(`/notes/${noteId}`)
      .set('Authorization', userToken)
      .send()
      .expect(200)
      .expect({
        message: 'note_delete_by_id_success',
        data: null,
        errors: null,
      })
      .end(done);
  });
});
