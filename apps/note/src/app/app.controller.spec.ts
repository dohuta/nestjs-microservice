import { NoteModule } from './app.module';
import { Test } from '@nestjs/testing';

import { NoteController } from './app.controller';

describe('NoteController', () => {
  jest.setTimeout(30000);

  let controller: NoteController;
  let noteId;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [NoteModule],
    }).compile();

    controller = app.get<NoteController>(NoteController);
  });

  beforeEach(async () => {});

  afterAll(async () => {});

  describe('create note', () => {
    it('[happi case] should create note', async () => {
      const note = {
        name: 'test',
        content: 'test',
        user_id: 2,
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
        user_id: 2,
      };

      await controller.noteCreate(note);
      const result = await controller.noteSearchByUserId(2);
      expect(result.message).toBe('note_search_by_user_id_success');
      expect(result.status).toBe(200);
      expect(result.notes).toBeDefined();
      expect(result.notes.length).toBe(1);
    });

    it('[happi case] should update note by id', async () => {
      const note = {
        name: 'test',
        content: 'test2',
        user_id: 2,
      };

      const created = await controller.noteCreate(note);
      noteId = created.note.id;
      const result = await controller.noteUpdateById({
        note: {
          content: 'changed',
        },
        id: noteId,
        user_id: note.user_id,
      });
      expect(result.message).toBe('note_update_by_id_success');
      expect(result.status).toBe(200);
      expect(result.note).toBeDefined();
      expect(result.note.content).toBe('changed');
    });
  });
});
