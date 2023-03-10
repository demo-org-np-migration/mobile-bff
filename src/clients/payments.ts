import { httpClient } from '@cauri/commons';
import { serviceToken } from '../serviceToken';

const client = httpClient({
  baseUrl: process.env.PAYMENTS_API_URL!,
  getToken: () => serviceToken.getToken(),
});

export interface Payment {
  id: string;
  from_account: string;
  to_account: string;
  merchant_id: string | null;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
}

export interface CreatePaymentBody {
  from_account: string;
  to_account: string;
  amount: string;
  currency: string;
  reference: string;
}

export function getPaymentsForAccount(accountId: string): Promise<Payment[]> {
  return client.get<Payment[]>(`/v1/payments?account_id=${accountId}`);
}

export function createPayment(body: CreatePaymentBody): Promise<Payment> {
  return client.post<Payment>('/v1/payments', body);
}

/**
 * payments-api marca este endpoint deprecado (`Deprecation`, `Sunset`,
 * `Link: rel="successor-version"` — ver las convenciones internas de API) a favor de
 * `GET /v1/payments/{id}`. Todavía no migramos: seguimos pegándole acá
 * porque es lo único que usa `GET /mobile/transfers/{id}/status` desde que
 * se escribió, y nunca volvimos a tocarlo.
 *
 * Nota: no usamos el `httpClient` de @cauri/commons para esta llamada
 * porque necesitábamos revisar el body crudo en su momento; quedó así.
 * Como resultado no miramos ninguno de esos headers de deprecación, así
 * que si algún día payments-api saca el endpoint esto se entera recién
 * cuando explote en 404, no antes.
 */
export async function getPaymentStatus(id: string): Promise<{ status: string }> {
  const token = await serviceToken.getToken();
  const res = await fetch(`${process.env.PAYMENTS_API_URL}/v1/payments/${id}/status`, {
    headers: { authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{ status: string }>;
}
