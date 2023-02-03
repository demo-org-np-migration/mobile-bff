import { httpClient } from '@cauri/commons';
import { serviceToken } from '../serviceToken';

const client = httpClient({
  baseUrl: process.env.CARDS_API_URL!,
  getToken: () => serviceToken.getToken(),
});

export interface Card {
  id: string;
  account_id: string;
  pan_last4: string;
  expiry: string;
  status: string;
}

export function getCardsForAccount(accountId: string): Promise<Card[]> {
  return client.get<Card[]>(`/v1/accounts/${accountId}/cards`);
}

export function createCard(accountId: string): Promise<Card> {
  return client.post<Card>('/v1/cards', { account_id: accountId });
}
