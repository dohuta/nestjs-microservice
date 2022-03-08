import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { INote, INoteCreate } from './interfaces/note.interface';
import { INoteUpdateParams } from './interfaces/note-update-params.interface';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(`NOTE::${NoteService.name}`);

  constructor(@InjectModel('Note') private readonly noteModel: Model<INote>) {}

  public async getNotesByUserId(userId: string): Promise<INote[]> {
    this.logger.log(`${this.getNotesByUserId.name}::user id ${userId}`);
    return this.noteModel.find({ user_id: userId }).exec();
  }

  public async createNote(noteBody: INoteCreate): Promise<INote> {
    this.logger.log(
      `${this.getNotesByUserId.name}::note ${JSON.stringify(noteBody)}`
    );
    const noteModel = new this.noteModel(noteBody);
    return await noteModel.save();
  }

  public async findNoteById(id: string) {
    this.logger.log(`${this.getNotesByUserId.name}::note id ${id}`);
    return await this.noteModel.findById(id);
  }

  public async removeNoteById(id: string) {
    this.logger.log(`${this.getNotesByUserId.name}::note id ${id}`);
    return await this.noteModel.findOneAndDelete({ _id: id });
  }

  public async updateNoteById(
    id: string,
    params: INoteUpdateParams
  ): Promise<INote> {
    this.logger.log(
      `${this.getNotesByUserId.name}::note id ${id}::params ${JSON.stringify(
        params
      )}`
    );
    await this.noteModel.updateOne({ _id: id }, params).exec();

    return this.noteModel.findById(id);
  }
}
