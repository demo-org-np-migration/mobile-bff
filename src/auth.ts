import { createJwtAuth } from '@cauri/commons';
import type { Request } from 'express';

/**
 * Valida tokens del client `mobile-app` (rol `customer`), como pide
 * las convenciones internas de API para mobile-bff. El resto de los endpoints (health,
 * metrics) quedan fuera de este middleware.
 */
export const auth = createJwtAuth({
  issuer: process.env.KEYCLOAK_ISSUER!,
});

export const requireCustomer = auth.requireRole('customer');

/** El `customer_id` sale siempre del claim `sub` del token (las convenciones internas de API). */
export function customerId(req: Request): string {
  return req.user!.sub;
}
