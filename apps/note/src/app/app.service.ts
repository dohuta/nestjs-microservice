import { Note } from '@libs/db';
import { UpsertNotePayload } from '@libs/dtos';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(`NOTE::${NoteService.name}`);

  constructor(
    @Inject('NOTE_REPOSITORY')
    private readonly repo: typeof Note
  ) {}

  public async getNotesByUserId(userId: string) {
    this.logger.log(`${this.getNotesByUserId.name}::user id ${userId}`);
    return await this.repo.findAll({
      where: { userId },
    });
  }

  public async createNote(noteBody: UpsertNotePayload, userId: string) {
    this.logger.log(
      `${this.getNotesByUserId.name}::note ${JSON.stringify(noteBody)}`
    );
    return this.repo.create({
      name: noteBody.name,
      content: noteBody.content,
      userId: userId,
    });
  }

  public async findNoteById(id: string) {
    this.logger.log(`${this.getNotesByUserId.name}::note id ${id}`);
    return this.repo.findOne({ where: { id } });
  }

  public async removeNoteById(id: string) {
    this.logger.log(`${this.getNotesByUserId.name}::note id ${id}`);
    const result = await this.repo.destroy({ where: { id } });
    return !!result;
  }

  public async updateNote(
    params: UpsertNotePayload,
    id: string,
    userId: string
  ) {
    this.logger.log(
      `${this.getNotesByUserId.name}::note id::params ${JSON.stringify(params)}`
    );
    const note = await this.repo.findOne({
      where: {
        id: id,
        userId: userId,
      },
    });
    if (note) {
      return this.repo.update(params, { where: { id: note.id } });
    } else {
      throw new Error('Note not found');
    }
  }
}
