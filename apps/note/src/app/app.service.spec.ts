import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

import { MongoConfigService } from './Services/config/mongo-config.service';
import { NoteSchema } from './schemas/note.schema';
import { NoteController } from './app.controller';
import { NoteService } from './app.service';

describe('NOTE SERVICE', () => {
  jest.setTimeout(30000);

  let service: NoteService;

  beforeAll(async () => {
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

    service = app.get<NoteService>(NoteService);
  });

  describe('test', () => {
    it('should init svc', () => {
      expect(service).toBeTruthy();
    });
  });
});
