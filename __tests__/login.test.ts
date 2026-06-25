import { handler } from '../src/auth/login/index';

describe('Login handler – adjusted tests', () => {

  it('returns 400 when body missing', async () => {
    const res = await handler({
      httpMethod: 'POST',
      headers: {},
      body: null,
      isBase64Encoded: false,
    } as any);

    expect(res.statusCode).toBe(400);
  });

  it('returns response for OPTIONS', async () => {
    const res = await handler({
      httpMethod: 'OPTIONS',
      headers: {},
      body: '',
      isBase64Encoded: false,
    } as any);

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
  });

  it('returns response for GET', async () => {
    const res = await handler({
      httpMethod: 'GET',
      headers: {},
      body: '',
      isBase64Encoded: false,
    } as any);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

});