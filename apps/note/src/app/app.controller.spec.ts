import { INote } from './../../../gateway/src/app/interfaces/note/note.interface';
import { NoteSchema } from './schemas/note.schema';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';

import { NoteController } from './app.controller';
import { NoteService } from './app.service';
import { MongoConfigService } from './Services/config/mongo-config.service';
import * as mongoose from 'mongoose';

describe('NoteController', () => {
  jest.setTimeout(30000);

  let controller: NoteController;
  let noteId;

  beforeAll(async () => {
    // connect to db
    // use this mongo connection to verify result
    await mongoose.connect(process.env.MONGO_URI);

    const app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useClass: MongoConfigService,
        }),
        MongooseModule.forFeature([
          {
            name: 'Note',
            schema: NoteSchema,
          },
        ]),
      ],
      controllers: [NoteController],
      providers: [NoteService],
    }).compile();

    controller = app.get<NoteController>(NoteController);
  });

  beforeEach(async () => {
    // clean up db after testing
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    // clean up db after testing
    await mongoose.connection.db.dropCollection('notes');
    // close connection
    await mongoose.connection.close();
  });

  describe('create note', () => {
    it('[happi case] should create note', async () => {
      const note = {
        name: 'test',
        content: 'test',
        user_id: 'test',
      };

      const result = await controller.noteCreate(note);
      expect(result.message).toBe('note_create_success');
      expect(result.status).toBe(201);
      expect(result.note).toBeDefined();
      expect(result.note.content).toBe('test');
    });

    it('[happi case] should search note by user id', async () => {
      const note = {
        name: 'test',
        content: 'test',
        user_id: 'test',
      };

      await controller.noteCreate(note);
      const result = await controller.noteSearchByUserId('test');
      expect(result.message).toBe('note_search_by_user_id_success');
      expect(result.status).toBe(200);
      expect(result.notes).toBeDefined();
      expect(result.notes.length).toBe(1);
    });

    it('[happi case] should update note by id', async () => {
      const note = {
        name: 'test',
        content: 'test',
        user_id: 'test',
      };

      const created = await controller.noteCreate(note);
      noteId = created.note.id;
      note.content = 'changed';
      const result = await controller.noteUpdateById({
        note,
        id: noteId,
        userId: note.user_id,
      });
      expect(result.message).toBe('note_update_by_id_success');
      expect(result.status).toBe(200);
      expect(result.note).toBeDefined();
      expect(result.note.content).toBe(note.content);
    });
  });
});
