import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DecryptRequestDto {
  @ApiProperty()
  @IsString()
  data1!: string;

  @ApiProperty()
  @IsString()
  data2!: string;
}
