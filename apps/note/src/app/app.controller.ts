import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { NoteService } from './app.service';
import { INote, INoteCreate } from './interfaces/note.interface';
import { INoteUpdateParams } from './interfaces/note-update-params.interface';
import { INoteSearchByUserResponse } from './interfaces/note-search-by-user-response.interface';
import { INoteDeleteResponse } from './interfaces/note-delete-response.interface';
import { INoteCreateResponse } from './interfaces/note-create-response.interface';
import { INoteUpdateByIdResponse } from './interfaces/note-update-by-id-response.interface';

@Controller()
export class NoteController {
  private readonly logger = new Logger(`NOTE::${NoteController.name}`);

  constructor(private readonly noteService: NoteService) {}

  @MessagePattern('note_search_by_user_id')
  public async noteSearchByUserId(
    userId: string
  ): Promise<INoteSearchByUserResponse> {
    this.logger.log(`${this.noteSearchByUserId.name}::user id ${userId}`);
    let result: INoteSearchByUserResponse;

    if (userId) {
      const notes = await this.noteService.getNotesByUserId(userId);
      result = {
        status: HttpStatus.OK,
        message: 'note_search_by_user_id_success',
        notes,
      };
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_search_by_user_id_bad_request',
        notes: null,
      };
    }

    this.logger.log(
      `${
        this.noteSearchByUserId.name
      }::user id ${userId}::result ${JSON.stringify(result)}`
    );
    return result;
  }

  @MessagePattern('note_update_by_id')
  public async noteUpdateById(params: {
    note: INoteUpdateParams;
    id: string;
    userId: string;
  }): Promise<INoteUpdateByIdResponse> {
    this.logger.log(
      `${this.noteUpdateById.name}::params ${JSON.stringify(params)}`
    );

    let result: INoteUpdateByIdResponse;
    if (params.id) {
      try {
        const note = await this.noteService.findNoteById(params.id);
        if (note) {
          if (note.user_id === params.userId) {
            const updatedNote = Object.assign(note, params.note);
            await updatedNote.save();
            result = {
              status: HttpStatus.OK,
              message: 'note_update_by_id_success',
              note: updatedNote,
              errors: null,
            };
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'note_update_by_id_forbidden',
              note: null,
              errors: null,
            };
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'note_update_by_id_not_found',
            note: null,
            errors: null,
          };
        }
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'note_update_by_id_precondition_failed',
          note: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_update_by_id_bad_request',
        note: null,
        errors: null,
      };
    }
    this.logger.log(
      `${this.noteUpdateById.name}::params ${JSON.stringify(
        params
      )}::result ${JSON.stringify(result)}`
    );
    return result;
  }

  @MessagePattern('note_create')
  public async noteCreate(noteBody: INoteCreate): Promise<INoteCreateResponse> {
    this.logger.log(
      `${this.noteCreate.name}::params ${JSON.stringify(noteBody)}`
    );
    let result: INoteCreateResponse;

    if (noteBody) {
      try {
        const note = await this.noteService.createNote(noteBody);
        result = {
          status: HttpStatus.CREATED,
          message: 'note_create_success',
          note,
          errors: null,
        };
      } catch (e) {
        this.logger.error(
          `${this.noteCreate.name}::params ${JSON.stringify(e)}`
        );
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'note_create_precondition_failed',
          note: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_create_bad_request',
        note: null,
        errors: null,
      };
    }

    this.logger.log(
      `${this.noteCreate.name}::params ${JSON.stringify(
        noteBody
      )}::result ${JSON.stringify(result)}`
    );
    return result;
  }

  @MessagePattern('note_delete_by_id')
  public async noteDeleteForUser(params: {
    userId: string;
    id: string;
  }): Promise<INoteDeleteResponse> {
    this.logger.log(
      `${this.noteDeleteForUser.name}::params ${JSON.stringify(params)}`
    );

    let result: INoteDeleteResponse;

    if (params && params.userId && params.id) {
      try {
        const note = await this.noteService.findNoteById(params.id);

        if (note) {
          if (note.user_id === params.userId) {
            await this.noteService.removeNoteById(params.id);
            result = {
              status: HttpStatus.OK,
              message: 'note_delete_by_id_success',
              errors: null,
            };
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'note_delete_by_id_forbidden',
              errors: null,
            };
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'note_delete_by_id_not_found',
            errors: null,
          };
        }
      } catch (e) {
        result = {
          status: HttpStatus.FORBIDDEN,
          message: 'note_delete_by_id_forbidden',
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_delete_by_id_bad_request',
        errors: null,
      };
    }

    this.logger.log(
      `${this.noteDeleteForUser.name}::params ${JSON.stringify(
        params
      )}::result ${JSON.stringify(result)}`
    );
    return result;
  }
}
