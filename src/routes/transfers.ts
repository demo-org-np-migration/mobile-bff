import { Router } from 'express';
import { createPayment, getPaymentStatus } from '../clients/payments';

export const transfersRouter = Router();

transfersRouter.post('/mobile/transfers', async (req, res, next) => {
  try {
    const { from_account, to_account, amount, currency, reference } = req.body;
    const payment = await createPayment({ from_account, to_account, amount, currency, reference });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});

/** payments-api GET /v1/payments/{id}/status — el deprecado (D5). */
transfersRouter.get('/mobile/transfers/:id/status', async (req, res, next) => {
  try {
    const status = await getPaymentStatus(req.params.id);
    res.json(status);
  } catch (err) {
    next(err);
  }
});
