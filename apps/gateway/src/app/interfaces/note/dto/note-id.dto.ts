import { ApiProperty } from '@nestjs/swagger';

export class NoteIdDto {
  @ApiProperty()
  id: string;
}
