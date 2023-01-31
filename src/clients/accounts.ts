import { httpClient } from '@cauri/commons';
import { serviceToken } from '../serviceToken';

const client = httpClient({
  baseUrl: process.env.ACCOUNTS_API_URL!,
  getToken: () => serviceToken.getToken(),
});

export interface Account {
  id: string;
  customer_id: string;
  currency: string;
  balance: string;
  status: string;
}

export function getAccountsForCustomer(customerId: string): Promise<Account[]> {
  return client.get<Account[]>(`/v1/customers/${customerId}/accounts`);
}
