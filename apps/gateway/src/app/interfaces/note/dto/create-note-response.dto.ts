import { ApiProperty } from '@nestjs/swagger';
import { INote } from '../note.interface';

export class CreateNoteResponseDto {
  @ApiProperty({ example: 'note_create_success' })
  message: string;
  @ApiProperty({
    example: {
      note: {
        notification_id: null,
        name: 'test note',
        description: 'test note description',
        start_time: +new Date(),
        duration: 90000,
        user_id: '5d987c3bfb881ec86b476bca',
        is_solved: false,
        created_at: +new Date(),
        updated_at: +new Date(),
        id: '5d987c3bfb881ec86b476bcc',
      },
    },
    nullable: true,
  })
  data: {
    note: INote;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
}
