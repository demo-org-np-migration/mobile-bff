import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/auth', () => ({
  auth: { express: () => (_req: unknown, _res: unknown, next: () => void) => next() },
  requireCustomer: (req: any, _res: unknown, next: () => void) => {
    req.user = { sub: 'aaaaaaaa-0000-4000-8000-000000000001', roles: ['customer'] };
    next();
  },
  customerId: (req: any) => req.user.sub,
}));

vi.mock('../src/clients/accounts', () => ({
  getAccountsForCustomer: vi.fn(),
}));
vi.mock('../src/clients/cards', () => ({
  getCardsForAccount: vi.fn(),
}));
vi.mock('../src/clients/payments', () => ({
  getPaymentsForAccount: vi.fn(),
}));

import { requireCustomer } from '../src/auth';
import { getAccountsForCustomer } from '../src/clients/accounts';
import { getCardsForAccount } from '../src/clients/cards';
import { getPaymentsForAccount } from '../src/clients/payments';
import { homeRouter } from '../src/routes/home';

function buildApp() {
  const app = express();
  app.use(requireCustomer as express.RequestHandler);
  app.use(homeRouter);
  return app;
}

describe('GET /mobile/home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('agrega cuentas, tarjetas y pagos de las tres fuentes en paralelo', async () => {
    vi.mocked(getAccountsForCustomer).mockResolvedValue([
      { id: 'acc-1', customer_id: 'cust-1', currency: 'ARS', balance: '50000.00', status: 'active' },
    ]);
    vi.mocked(getCardsForAccount).mockResolvedValue([
      { id: 'card-1', account_id: 'acc-1', pan_last4: '1234', expiry: '12/28', status: 'active' },
    ]);
    vi.mocked(getPaymentsForAccount).mockResolvedValue([
      {
        id: 'pay-1',
        from_account: 'acc-1',
        to_account: 'acc-2',
        merchant_id: null,
        amount: '1250.50',
        currency: 'ARS',
        status: 'completed',
        created_at: '2026-09-09T12:00:00Z',
      },
    ]);

    const res = await request(buildApp()).get('/mobile/home');

    expect(res.status).toBe(200);
    expect(res.body.accounts).toHaveLength(1);
    expect(res.body.cards).toHaveLength(1);
    expect(res.body.payments).toHaveLength(1);
    expect(getAccountsForCustomer).toHaveBeenCalledWith('aaaaaaaa-0000-4000-8000-000000000001');
    expect(getCardsForAccount).toHaveBeenCalledWith('acc-1');
    expect(getPaymentsForAccount).toHaveBeenCalledWith('acc-1');
  });
});
