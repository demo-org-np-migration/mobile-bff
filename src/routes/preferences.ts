import { Router } from 'express';
import { customerId } from '../auth';
import { getPreferences, updatePreferences } from '../clients/notifications';

export const preferencesRouter = Router();

preferencesRouter.get('/mobile/notifications/preferences', async (req, res, next) => {
  try {
    const preferences = await getPreferences(customerId(req));
    res.json(preferences);
  } catch (err) {
    next(err);
  }
});

preferencesRouter.put('/mobile/notifications/preferences', async (req, res, next) => {
  try {
    const preferences = await updatePreferences(customerId(req), req.body);
    res.json(preferences);
  } catch (err) {
    next(err);
  }
});
