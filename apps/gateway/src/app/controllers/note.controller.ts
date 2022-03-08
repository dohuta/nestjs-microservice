import {
  Controller,
  Inject,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Authorization } from '../decorators/authorization.decorator';
// import { Permission } from '../decorators/permission.decorator';

import { IAuthorizedRequest } from '../interfaces/common/authorized-request.interface';
import { IServiceNoteCreateResponse } from '../interfaces/note/service-note-create-response.interface';
import { IServiceNoteDeleteResponse } from '../interfaces/note/service-note-delete-response.interface';
import { IServiceNoteSearchByUserIdResponse } from '../interfaces/note/service-note-search-by-user-id-response.interface';
import { IServiceNoteUpdateByIdResponse } from '../interfaces/note/service-note-update-by-id-response.interface';
import { GetNotesResponseDto } from '../interfaces/note/dto/get-notes-response.dto';
import { CreateNoteResponseDto } from '../interfaces/note/dto/create-note-response.dto';
import { DeleteNoteResponseDto } from '../interfaces/note/dto/delete-note-response.dto';
import { UpdateNoteResponseDto } from '../interfaces/note/dto/update-note-response.dto';
import { CreateNoteDto } from '../interfaces/note/dto/create-note.dto';
import { UpdateNoteDto } from '../interfaces/note/dto/update-note.dto';
import { NoteIdDto } from '../interfaces/note/dto/note-id.dto';

@Controller('notes') // endpoint
@ApiBearerAuth() // authentication
@ApiTags('notes') // document tag
export class NotesController {
  // logger declaration
  private readonly logger = new Logger(`GATEWAY::${NotesController.name}`);

  constructor(
    @Inject('NOTE_SERVICE') private readonly noteServiceClient: ClientProxy
  ) {}

  @Get() // the verb/method
  @Authorization(true) // force checking auth
  // @Permission('note_search_by_user_id')
  @ApiOkResponse({
    type: GetNotesResponseDto,
    description: 'List of notes for signed in user',
  }) // this is use for api documentation
  public async getNotes(
    @Req() request: IAuthorizedRequest
  ): Promise<GetNotesResponseDto> {
    this.logger.log(`${this.getNotes.name} called::user id${request.user.id}`);

    const userInfo = request.user;

    const notesResponse: IServiceNoteSearchByUserIdResponse =
      await firstValueFrom(
        this.noteServiceClient.send('note_search_by_user_id', userInfo.id)
      );

    this.logger.log(
      `${this.getNotes.name} responses::user id${request.user.id}::notes ${notesResponse.notes.length}`
    );
    return {
      message: notesResponse.message,
      data: {
        notes: notesResponse.notes,
      },
      errors: null,
    };
  }

  @Post()
  @Authorization(true)
  // @Permission('note_create')
  @ApiCreatedResponse({
    type: CreateNoteResponseDto,
  })
  public async createNote(
    @Req() request: IAuthorizedRequest,
    @Body() noteRequest: CreateNoteDto
  ): Promise<CreateNoteResponseDto> {
    this.logger.log(
      `${this.createNote.name} called::user id${request.user.id}`
    );

    const userInfo = request.user;
    const createNoteResponse: IServiceNoteCreateResponse = await firstValueFrom(
      this.noteServiceClient.send(
        'note_create',
        Object.assign(noteRequest, { user_id: userInfo.id })
      )
    );

    if (createNoteResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createNoteResponse.message,
          data: null,
          errors: createNoteResponse.errors,
        },
        createNoteResponse.status
      );
    }

    this.logger.log(
      `${this.createNote.name} responses::user id${request.user.id}::created ${createNoteResponse.status}`
    );

    return {
      message: createNoteResponse.message,
      data: {
        note: createNoteResponse.note,
      },
      errors: null,
    };
  }

  @Delete(':id')
  @Authorization(true)
  // @Permission('note_delete_by_id')
  @ApiOkResponse({
    type: DeleteNoteResponseDto,
  })
  public async deleteNote(
    @Req() request: IAuthorizedRequest,
    @Param() params: NoteIdDto
  ): Promise<DeleteNoteResponseDto> {
    this.logger.log(
      `${this.deleteNote.name} called::user id${request.user.id}`
    );

    const userInfo = request.user;

    const deleteNoteResponse: IServiceNoteDeleteResponse = await firstValueFrom(
      this.noteServiceClient.send('note_delete_by_id', {
        id: params.id,
        userId: userInfo.id,
      })
    );

    if (deleteNoteResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteNoteResponse.message,
          errors: deleteNoteResponse.errors,
          data: null,
        },
        deleteNoteResponse.status
      );
    }

    this.logger.log(
      `${this.createNote.name} responses::user id${request.user.id}::deleted ${deleteNoteResponse.status}`
    );

    return {
      message: deleteNoteResponse.message,
      data: null,
      errors: null,
    };
  }

  @Put(':id')
  @Authorization(true)
  // @Permission('note_update_by_id')
  @ApiOkResponse({
    type: UpdateNoteResponseDto,
  })
  public async updateNote(
    @Req() request: IAuthorizedRequest,
    @Param() params: NoteIdDto,
    @Body() noteRequest: UpdateNoteDto
  ): Promise<UpdateNoteResponseDto> {
    this.logger.log(
      `${this.updateNote.name} called::user id${request.user.id}`
    );

    const userInfo = request.user;
    const updateNoteResponse: IServiceNoteUpdateByIdResponse =
      await firstValueFrom(
        this.noteServiceClient.send('note_update_by_id', {
          id: params.id,
          userId: userInfo.id,
          note: noteRequest,
        })
      );

    if (updateNoteResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateNoteResponse.message,
          errors: updateNoteResponse.errors,
          data: null,
        },
        updateNoteResponse.status
      );
    }

    this.logger.log(
      `${this.updateNote.name} responses::user id${request.user.id}::updated ${updateNoteResponse.status}`
    );
    return {
      message: updateNoteResponse.message,
      data: {
        note: updateNoteResponse.note,
      },
      errors: null,
    };
  }
}
