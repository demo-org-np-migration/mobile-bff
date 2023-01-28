import { serviceTokenProvider } from '@cauri/commons';

/**
 * Token de servicio del client `mobile-bff` (rol `service`) para llamar a
 * accounts-api, cards-api, payments-api y notifications (las convenciones internas de API).
 */
export const serviceToken = serviceTokenProvider({
  issuer: process.env.KEYCLOAK_ISSUER!,
  clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'mobile-bff',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
});
