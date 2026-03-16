import { Injectable } from '@nestjs/common';
import { DecryptRequestDto } from './dto/decrypt-request.dto';
import { ApiResponse } from './interfaces/crypto-response.interface';
import fs from 'fs';
import crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly AES_ALGORITHM = 'aes-256-cbc';
  private readonly AES_KEY_SIZE = 32;
  private readonly IV_SIZE = 16;

  constructor() {
    const privateKeyPath = process.env.RSA_PRIVATE_KEY_PATH;
    const publicKeyPath = process.env.RSA_PUBLIC_KEY_PATH;

    if (!privateKeyPath) {
      throw new Error('RSA_PRIVATE_KEY_PATH environment variable is not set');
    }

    if (!publicKeyPath) {
      throw new Error('RSA_PUBLIC_KEY_PATH environment variable is not set');
    }

    this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }

  private generateAesKey(): Buffer {
    return crypto.randomBytes(this.AES_KEY_SIZE);
  }

  private generateIV(): Buffer {
    return crypto.randomBytes(this.IV_SIZE);
  }

  private encryptAES(payload: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv(this.AES_ALGORITHM, key, iv);

    let encrypted = cipher.update(payload, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  }

  private decryptAES(encrypted: string, key: Buffer, iv: Buffer): string {
    const decipher = crypto.createDecipheriv(this.AES_ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private encryptRSA(aesKey: Buffer): string {
    const encrypted = crypto.publicEncrypt(this.publicKey, aesKey);
    return encrypted.toString('base64');
  }

  private decryptRSA(encryptedKey: string): Buffer {
    const buffer = Buffer.from(encryptedKey, 'base64');
    return crypto.privateDecrypt(this.privateKey, buffer);
  }

  private parseEncryptedData(data2: string): {
    iv: Buffer;
    encrypted: string;
  } {
    const [ivBase64, encrypted] = data2.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    return { iv, encrypted };
  }

  private errorResponse<T>(error_code: string): ApiResponse<T> {
    return {
      successful: false,
      error_code,
      data: null,
    };
  }

  encrypt(payload: string): ApiResponse<{ data1: string; data2: string }> {
    try {
      const aesKey = this.generateAesKey();
      const iv = this.generateIV();
      const encryptedPayload = this.encryptAES(payload, aesKey, iv);

      const data2 = `${iv.toString('base64')}:${encryptedPayload}`;
      const data1 = this.encryptRSA(aesKey);

      return {
        successful: true,
        data: { data1, data2 },
      };
    } catch {
      return {
        successful: false,
        error_code: 'ENCRYPT_FAILED',
        data: null,
      };
    }
  }

  decrypt(request: DecryptRequestDto): ApiResponse<{ payload: string }> {
    try {
      const aesKey = this.decryptRSA(request.data1);
      const { iv, encrypted } = this.parseEncryptedData(request.data2);
      const payload = this.decryptAES(encrypted, aesKey, iv);

      return {
        successful: true,
        data: { payload },
      };
    } catch {
      return this.errorResponse<{ payload: string }>('DECRYPT_ERROR');
    }
  }
}
