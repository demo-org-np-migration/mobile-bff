import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/clients/payments', () => ({
  createPayment: vi.fn(),
  getPaymentStatus: vi.fn(),
}));

import { createPayment, getPaymentStatus } from '../src/clients/payments';
import { transfersRouter } from '../src/routes/transfers';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(transfersRouter);
  return app;
}

describe('transfers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /mobile/transfers crea el pago vía payments-api', async () => {
    vi.mocked(createPayment).mockResolvedValue({
      id: 'pay-1',
      from_account: 'acc-1',
      to_account: 'acc-2',
      merchant_id: null,
      amount: '1250.50',
      currency: 'ARS',
      status: 'pending',
      created_at: '2026-09-09T12:00:00Z',
    });

    const res = await request(buildApp())
      .post('/mobile/transfers')
      .send({ from_account: 'acc-1', to_account: 'acc-2', amount: '1250.50', currency: 'ARS', reference: 'test' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('pay-1');
  });

  it('GET /mobile/transfers/:id/status devuelve lo que responde payments-api (endpoint deprecado)', async () => {
    vi.mocked(getPaymentStatus).mockResolvedValue({ status: 'completed' });

    const res = await request(buildApp()).get('/mobile/transfers/pay-1/status');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'completed' });
    expect(getPaymentStatus).toHaveBeenCalledWith('pay-1');
  });
});
