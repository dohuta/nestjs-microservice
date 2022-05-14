import { BaseResponse, UpsertNotePayload, UpsertNoteReponse } from '@libs/dtos';
import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { NoteService } from './app.service';

@Controller()
export class NoteController {
  private readonly logger = new Logger(`NOTE::${NoteController.name}`);

  constructor(private readonly noteService: NoteService) {}

  @MessagePattern('note_search_by_user_id')
  public async noteSearchByUserId(
    userId: string
  ): Promise<BaseResponse<UpsertNoteReponse[] | null>> {
    this.logger.log(`${this.noteSearchByUserId.name}::user id ${userId}`);
    let result: BaseResponse<UpsertNoteReponse[] | null>;

    if (userId) {
      const notes = await this.noteService.getNotesByUserId(userId);
      result = {
        status: HttpStatus.OK,
        message: 'note_search_by_user_id_success',
        data: UpsertNoteReponse.fromEntities(notes),
      };
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_search_by_user_id_bad_request',
        data: null,
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
    note: UpsertNotePayload;
    id: string;
    userId: string;
  }): Promise<BaseResponse<UpsertNoteReponse | null>> {
    this.logger.log(
      `${this.noteUpdateById.name}::params ${JSON.stringify(params)}`
    );

    let result: BaseResponse<UpsertNoteReponse | null>;
    if (params.id) {
      try {
        const note = await this.noteService.findNoteById(params.id);
        if (note) {
          if (note.userId === params.userId) {
            try {
              // delete params.note.user_id;
              const updatedNote = Object.assign(note, params.note);
              const r = await this.noteService.updateNote(
                params.note,
                params.id,
                params.userId
              );
              if (r) {
                result = {
                  status: HttpStatus.OK,
                  message: 'note_update_by_id_success',
                  data: UpsertNoteReponse.fromEntity(updatedNote),
                };
              }
            } catch (e) {
              result = {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'note_update_by_id_failed',
                data: null,
              };
            }
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'note_update_by_id_forbidden',
              data: null,
            };
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'note_update_by_id_not_found',
            data: null,
          };
        }
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'note_update_by_id_precondition_failed',
          data: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_update_by_id_bad_request',
        data: null,
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
  public async noteCreate(params: {
    noteBody: UpsertNotePayload;
    userId: string;
  }): Promise<BaseResponse<UpsertNoteReponse | null>> {
    this.logger.log(
      `${this.noteCreate.name}::params ${JSON.stringify(params.noteBody)}`
    );
    let result: BaseResponse<UpsertNoteReponse | null>;

    if (params.noteBody && params.userId) {
      try {
        const note = await this.noteService.createNote(
          params.noteBody,
          params.userId
        );
        result = {
          status: HttpStatus.CREATED,
          message: 'note_create_success',
          data: UpsertNoteReponse.fromEntity(note),
        };
      } catch (e) {
        this.logger.error(
          `${this.noteCreate.name}::params ${JSON.stringify(e)}`
        );
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'note_create_precondition_failed',
          data: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_create_bad_request',
        data: null,
      };
    }

    this.logger.log(
      `${this.noteCreate.name}::params ${JSON.stringify(
        params.noteBody
      )}::result ${JSON.stringify(result)}`
    );
    return result;
  }

  @MessagePattern('note_delete_by_id')
  public async noteDeleteForUser(params: {
    userId: string;
    id: string;
  }): Promise<BaseResponse<Boolean | null>> {
    this.logger.log(
      `${this.noteDeleteForUser.name}::params ${JSON.stringify(params)}`
    );

    let result: BaseResponse<Boolean | null>;

    if (params && params.userId && params.id) {
      try {
        const note = await this.noteService.findNoteById(params.id);

        if (note) {
          if (note.user.id === params.userId) {
            const res = await this.noteService.removeNoteById(params.id);
            result = {
              status: HttpStatus.OK,
              message: 'note_delete_by_id_success',
              data: res,
            };
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'note_delete_by_id_forbidden',
              data: null,
            };
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'note_delete_by_id_not_found',
            data: null,
          };
        }
      } catch (e) {
        result = {
          status: HttpStatus.FORBIDDEN,
          message: 'note_delete_by_id_forbidden',
          data: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'note_delete_by_id_bad_request',
        data: null,
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
