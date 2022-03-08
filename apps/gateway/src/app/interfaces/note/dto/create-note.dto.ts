import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'test note' })
  name: string;
  @ApiProperty({ example: 'test note description' })
  description: string;
  @ApiProperty({ example: +new Date() })
  start_time: number;
  @ApiProperty({ example: 90000 })
  duration: number;
}
