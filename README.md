# mobile-bff

Backend para la app móvil. Junta lo que la pantalla de inicio necesita (cuentas, tarjetas,
últimos pagos) en una sola llamada, y le pasa al cliente móvil el resto de las operaciones
(transferencias, alta de tarjeta, preferencias de notificaciones) hablando con los servicios
de atrás.

No tiene base de datos propia. Todo lo que devuelve sale de pegarle a otros servicios con un
token de servicio del client `mobile-bff`.

## Auth

Entrante: JWT del client `mobile-app`, rol `customer`. El `customer_id` sale del claim `sub`.
Sin token válido, `401`.

Saliente: token de client-credentials del client `mobile-bff` (rol `service`), uno por proceso,
se cachea y se renueva solo (`serviceTokenProvider` de `@cauri/commons`).

## Endpoints

Todos bajo `/mobile`, con `Authorization: Bearer <token de mobile-app>`.

```bash
curl http://localhost:8080/mobile/home \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "accounts": [{ "id": "aaaaaaaa-0000-4000-8000-000000000101", "currency": "ARS", "balance": "50000.00", "status": "active" }],
  "cards": [{ "id": "card-1", "account_id": "aaaaaaaa-0000-4000-8000-000000000101", "pan_last4": "1234", "status": "active" }],
  "payments": [{ "id": "pay-1", "amount": "1250.50", "currency": "ARS", "status": "completed" }]
}
```

```bash
curl -X POST http://localhost:8080/mobile/transfers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"from_account":"aaaaaaaa-0000-4000-8000-000000000101","to_account":"bbbbbbbb-0000-4000-8000-000000000201","amount":"500.00","currency":"ARS","reference":"cafe"}'
```

```bash
curl http://localhost:8080/mobile/transfers/pay-1/status \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST http://localhost:8080/mobile/cards \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"account_id":"aaaaaaaa-0000-4000-8000-000000000101"}'
```

```bash
curl http://localhost:8080/mobile/notifications/preferences -H "Authorization: Bearer $TOKEN"

curl -X PUT http://localhost:8080/mobile/notifications/preferences \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email_enabled":true,"push_enabled":false}'
```

`GET /health` y `GET /metrics` no llevan auth.

## Endpoints upstream

Lo que llamamos del otro lado, por si algo en `/mobile/home` sale raro y hay que seguirle el
rastro:

- accounts-api `GET /v1/customers/{id}/accounts`
- cards-api `GET /v1/accounts/{account_id}/cards`, `POST /v1/cards`
- payments-api `GET /v1/payments?account_id=`, `POST /v1/payments`, `GET /v1/payments/{id}/status`
- notifications `GET /v1/preferences/{id}`, `PUT /v1/preferences/{id}`

## Correr local

```bash
npm install
npm run dev
```

Variables de entorno: `SERVICE_NAME`, `ENV`, `PORT`, `LOG_LEVEL`, `KEYCLOAK_ISSUER`,
`KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `ACCOUNTS_API_URL`, `CARDS_API_URL`,
`PAYMENTS_API_URL`, `NOTIFICATIONS_URL`.

## Tests

```bash
npm test
```

`home.test.ts` mockea los tres clientes y valida que `/mobile/home` los agregue. `transfers.test.ts`
mockea el cliente de payments-api y valida creación y consulta de estado.

## Deploy

Helm vía Actions, como accounts-api: push a `main` sube a staging con el `sha` corto de la
imagen; un tag `v*` sube lo mismo a prod. Chart en `deploy/chart`.

```bash
helm upgrade --install mobile-bff ./deploy/chart -n staging -f deploy/values-staging.yaml
```

— Federico
