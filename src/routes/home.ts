import { Router } from 'express';
import { customerId } from '../auth';
import { getAccountsForCustomer } from '../clients/accounts';
import { getCardsForAccount } from '../clients/cards';
import { getPaymentsForAccount } from '../clients/payments';

export const homeRouter = Router();

/**
 * Agrega en paralelo (las convenciones internas de API): cuentas, tarjetas de cada cuenta y
 * últimos pagos de cada cuenta.
 */
homeRouter.get('/mobile/home', async (req, res, next) => {
  try {
    const id = customerId(req);
    const accounts = await getAccountsForCustomer(id);

    const [cardsByAccount, paymentsByAccount] = await Promise.all([
      Promise.all(accounts.map((account) => getCardsForAccount(account.id))),
      Promise.all(accounts.map((account) => getPaymentsForAccount(account.id))),
    ]);

    res.json({
      accounts,
      cards: cardsByAccount.flat(),
      payments: paymentsByAccount.flat(),
    });
  } catch (err) {
    next(err);
  }
});
