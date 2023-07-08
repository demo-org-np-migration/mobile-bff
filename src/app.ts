import { HttpError, logger } from '@cauri/commons';
import express, { type ErrorRequestHandler } from 'express';
import { auth, requireCustomer } from './auth';
import { metricsHandler } from './metrics';
import { cardsRouter } from './routes/cards';
import { homeRouter } from './routes/home';
import { preferencesRouter } from './routes/preferences';
import { transfersRouter } from './routes/transfers';

const log = logger(process.env.SERVICE_NAME ?? 'mobile-bff', process.env.ENV ?? 'staging');

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(metricsHandler());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Todo lo bajo /mobile es del cliente móvil (client mobile-app, rol
  // customer) — las convenciones internas de API.
  app.use('/mobile', auth.express(), requireCustomer);
  app.use(homeRouter);
  app.use(transfersRouter);
  app.use(cardsRouter);
  app.use(preferencesRouter);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      log.warn({ status: err.status, body: err.body }, 'upstream_error');
      res.status(502).json({ error: { code: 'upstream_error', message: `upstream responded ${err.status}` } });
      return;
    }
    log.error({ err }, 'unhandled_error');
    res.status(500).json({ error: { code: 'internal_error', message: 'unexpected error' } });
  };
  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT ?? 8080);
  app.listen(port, () => {
    log.info({ port }, 'mobile-bff listening');
  });
}
