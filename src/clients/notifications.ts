import { httpClient } from '@cauri/commons';
import { serviceToken } from '../serviceToken';

const client = httpClient({
  baseUrl: process.env.NOTIFICATIONS_URL!,
  getToken: () => serviceToken.getToken(),
});

export interface Preferences {
  customer_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  device_token: string | null;
}

export function getPreferences(customerId: string): Promise<Preferences> {
  return client.get<Preferences>(`/v1/preferences/${customerId}`);
}

export function updatePreferences(
  customerId: string,
  body: { email_enabled: boolean; push_enabled: boolean; device_token?: string | null },
): Promise<Preferences> {
  return client.put<Preferences>(`/v1/preferences/${customerId}`, body);
}
