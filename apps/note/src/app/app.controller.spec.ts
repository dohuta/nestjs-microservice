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
      };

      const result = await controller.noteCreate({
        noteBody: note,
        userId: 'c3e1f1e1-4b22-47f1-89ce-ff410b9234b2',
      });
      expect(result.message).toBe('note_create_success');
      expect(result.status).toBe(201);
      expect(result.data).toBeDefined();
      expect(result.data.content).toBe('test');
    });

    it('[happi case] should search note by user id', async () => {
      const note = {
        name: 'test 2',
        content: 'test 2',
      };

      const theNote = await controller.noteCreate({
        noteBody: note,
        userId: 'c3e1f1e1-4b22-47f1-89ce-ff410b9234b2',
      });
      const result = await controller.noteSearchByUserId('c3e1f1e1-4b22-47f1-89ce-ff410b9234b2');
      expect(result.message).toBe('note_search_by_user_id_success');
      expect(result.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(2);
    });

    it('[happi case] should update note by id', async () => {
      const note = {
        name: 'test 3',
        content: 'test 3',
      };

      const created = await controller.noteCreate({
        noteBody: note,
        userId: 'c3e1f1e1-4b22-47f1-89ce-ff410b9234b2',
      });
      noteId = created.data.id;
      const result = await controller.noteUpdateById({
        note: {
          content: 'changed',
        },
        id: noteId,
        userId: 'c3e1f1e1-4b22-47f1-89ce-ff410b9234b2',
      });
      expect(result.message).toBe('note_update_by_id_success');
      expect(result.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.content).toBe('changed');
    });
  });
});
