import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsNotEmpty } from 'class-validator';

export class EncryptRequestDto {
  @ApiProperty({
    description: 'The payload to encrypt',
    example: 'hello world',
  })
  @IsString()
  @IsNotEmpty()
  @Length(0, 2000)
  payload!: string;
}
