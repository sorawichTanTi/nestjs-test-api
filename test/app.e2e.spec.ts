import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ApiResponse } from 'src/crypto/interfaces/crypto-response.interface';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('encrypt the payload then return data1 and data2', async () => {
    const res = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload: 'hello world' });

    const body = res.body as ApiResponse<{ data1: string; data2: string }>;

    expect(res.status).toBe(201);

    expect(body.successful).toBe(true);

    expect(body.data).toBeDefined();
    expect(body.data!.data1).toBeDefined();
    expect(body.data!.data2).toBeDefined();

    expect(typeof body.data!.data1).toBe('string');
    expect(typeof body.data!.data2).toBe('string');
  });

  it('should reject non string payload', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload: 123 });
    expect(res.status).toBe(400);
  });

  it('should reject missing payload', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({});
    expect(res.status).toBe(400);
  });

  it('should reject payload longer than 2000 chars', async () => {
    const payload = 'a'.repeat(2026);
    const res = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload });
    expect(res.status).toBe(400);
  });

  it('decrypt the payload', async () => {
    const enc = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload: 'hello world' });
    const encBody = enc.body as ApiResponse<{ data1: string; data2: string }>;

    const res = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send({
        data1: encBody.data!.data1,
        data2: encBody.data!.data2,
      });
    const body = res.body as ApiResponse<{ payload: string }>;

    expect(res.status).toBe(201);
    expect(body.successful).toBe(true);

    expect(body.data).toBeDefined();
    expect(body.data!.payload).toBeDefined();
    expect(body.data!.payload).toBe('hello world');
  });
});
