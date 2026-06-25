import { handler } from '../src/auth/register/index';

jest.mock('bcryptjs');

describe('Register – minimal smoke tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles OPTIONS', async () => {
    const res = await handler({
      httpMethod: 'OPTIONS',
      headers: { origin: '*' },
      body: '',
      isBase64Encoded: false,
    } as any);

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
  });

  it('returns response on wrong method', async () => {
    const res = await handler({
      httpMethod: 'GET',
      headers: { origin: '*' },
      body: '',
      isBase64Encoded: false,
    } as any);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('returns 400 when body missing', async () => {
    const res = await handler({
      httpMethod: 'POST',
      headers: { origin: '*' },
      body: null,
      isBase64Encoded: false,
    } as any);

    expect(res.statusCode).toBe(400);
  });

});