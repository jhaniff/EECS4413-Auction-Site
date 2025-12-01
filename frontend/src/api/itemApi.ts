import { API_BASE_URL } from './config';

const NORMALIZED_BASE = API_BASE_URL.replace(/\/+$/, '');

export interface ItemPayload {
  name: string;
  description: string;
  type?: string;
  shippingDays: number;
  baseShipCost: number;
  expeditedCost: number;
  startPrice: number;
  endsAt: string; // ISO-8601 string
  keywords?: string[];
}

export interface ItemDTO {
  itemId: number;
  sellerId: number;
  name: string;
  description: string;
  type: string;
  shippingDays: number;
  baseShipCost: number;
  expeditedCost: number;
  createdAt: string;
  isSold: boolean;
  keywords: string[];
}

const buildAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export async function createItem(payload: ItemPayload): Promise<ItemDTO> {
  const response = await fetch(`${NORMALIZED_BASE}/api/items`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = response.status === 401
      ? 'You need to sign in before creating an item.'
      : 'Unable to submit this item right now. Please try again later.';
    throw new Error(message);
  }

  return response.json() as Promise<ItemDTO>;
}
