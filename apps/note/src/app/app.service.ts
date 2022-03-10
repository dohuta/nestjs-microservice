import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { INoteCreate } from './interfaces/note.interface';
import { Note } from 'libs/database/src/model/entities';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(`NOTE::${NoteService.name}`);

  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>
  ) {}

  public async getNotesByUserId(userId: number) {
    this.logger.log(`${this.getNotesByUserId.name}::user id ${userId}`);
    return await this.noteRepository.find({
      where: { user: { id: userId } },
    });
  }

  public async createNote(noteBody: INoteCreate) {
    this.logger.log(
      `${this.getNotesByUserId.name}::note ${JSON.stringify(noteBody)}`
    );
    return this.noteRepository.save({
      name: noteBody.name,
      content: noteBody.content,
      user: {
        id: noteBody.user_id,
      },
    });
  }

  public async findNoteById(id: number) {
    this.logger.log(`${this.getNotesByUserId.name}::note id ${id}`);
    return await this.noteRepository.findOne(id, { relations: ['user'] });
  }

  public async removeNoteById(id: number) {
    this.logger.log(`${this.getNotesByUserId.name}::note id ${id}`);
    const result = await this.noteRepository.delete({ id });
    return !!result.affected;
  }

  public async updateNote(params: Note) {
    this.logger.log(
      `${this.getNotesByUserId.name}::note id::params ${JSON.stringify(params)}`
    );
    const { id, ...rest } = params;
    const result = await this.noteRepository.update({ id: id }, rest);
    return !!result.affected;
  }
}
