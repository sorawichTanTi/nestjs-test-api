import { Body, Controller, Post } from '@nestjs/common';
import { EncryptRequestDto } from './dto/encrypt-request.dto';
import { DecryptRequestDto } from './dto/decrypt-request.dto';
import type { ApiResponse } from './interfaces/crypto-response.interface';
import { CryptoService } from './crypto.service';

@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('get-encrypt-data')
  encrypt(
    @Body() dto: EncryptRequestDto,
  ): ApiResponse<{ data1: string; data2: string }> {
    return this.cryptoService.encrypt(dto.payload);
  }

  @Post('get-decrypt-data')
  decrypt(@Body() dto: DecryptRequestDto): ApiResponse<{ payload: string }> {
    return this.cryptoService.decrypt(dto);
  }
}
