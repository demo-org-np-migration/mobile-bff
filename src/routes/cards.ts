import { Router } from 'express';
import { createCard } from '../clients/cards';

export const cardsRouter = Router();

cardsRouter.post('/mobile/cards', async (req, res, next) => {
  try {
    const card = await createCard(req.body.account_id);
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});
