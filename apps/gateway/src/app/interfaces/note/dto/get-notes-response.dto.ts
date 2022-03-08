import { ApiProperty } from '@nestjs/swagger';
import { INote } from '../note.interface';

export class GetNotesResponseDto {
  @ApiProperty({ example: 'note_search_success' })
  message: string;
  @ApiProperty({
    example: {
      notes: [
        {
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
      ],
    },
    nullable: true,
  })
  data: {
    notes: INote[];
  };
  @ApiProperty({ example: 'null' })
  errors: { [key: string]: any };
}
