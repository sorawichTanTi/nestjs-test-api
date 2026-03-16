import { CryptoService } from '../src/crypto/crypto.service';

process.env.RSA_PRIVATE_KEY_PATH =
  process.env.RSA_PRIVATE_KEY_PATH ?? 'keys/private_key.pem';

process.env.RSA_PUBLIC_KEY_PATH =
  process.env.RSA_PUBLIC_KEY_PATH ?? 'keys/public_key.pem';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  it('should encrypt payload', () => {
    const result = service.encrypt('hello');

    expect(result.successful).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.data1).toBeDefined();
    expect(result.data!.data2).toBeDefined();
  });

  it('should decrypt payload', () => {
    const enc = service.encrypt('hello');

    expect(enc.data).toBeDefined();

    const dec = service.decrypt({
      data1: enc.data!.data1,
      data2: enc.data!.data2,
    });

    expect(dec.successful).toBe(true);
    expect(dec.data!.payload).toBe('hello');
  });

  it('should fail with invalid encrypted data', () => {
    const res = service.decrypt({
      data1: 'invalid',
      data2: 'invalid',
    });

    expect(res.successful).toBe(false);
  });
});
