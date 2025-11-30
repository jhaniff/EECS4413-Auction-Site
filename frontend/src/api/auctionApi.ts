import { API_BASE_URL } from './config';

const NORMALIZED_BASE = API_BASE_URL.replace(/\/+$/, '');

const buildAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type SortDirection = 'asc' | 'desc';

export interface AuctionSummary {
  auctionId: number;
  itemId: number;
  itemName: string;
  currentPrice: number;
  type: string;
  remainingTime: string;
  endsAt: string;
  highestBidder: string | null;
  bidCount?: number;
  shippingCost?: number | null;
  shippingInfo?: string | null;
  shippingMethod?: string | null;
}

export interface AuctionSearchResponse {
  items: AuctionSummary[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface AuctionSearchParams {
  query?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: SortDirection;
  signal?: AbortSignal;
}

export interface UserBidSummary {
  auctionId: number;
  itemId: number;
  itemName: string;
  currentPrice: number;
  userBidAmount: number;
  status: string;
  winning: boolean;
  endsAt: string;
  lastBidAt: string;
}

interface SpringPage<T> {
  content?: T[];
  number?: number;
  size?: number;
  totalPages?: number;
  totalElements?: number;
}

function buildSearchUrl({
  query = '',
  page = 0,
  size = 9,
  sortBy = 'endsAt',
  direction = 'asc',
}: AuctionSearchParams): string {
  const url = new URL('/api/auction/search', NORMALIZED_BASE);
  url.searchParams.set('query', query.trim());
  url.searchParams.set('page', page.toString());
  url.searchParams.set('size', size.toString());
  url.searchParams.set('sortBy', sortBy);
  url.searchParams.set('direction', direction);
  return url.toString();
}

export async function searchAuctions(
  params: AuctionSearchParams = {},
): Promise<AuctionSearchResponse> {
  const { signal, ...rest } = params;

  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildSearchUrl(rest), { 
    headers,
    signal 
  });

  if (!response.ok) {
    throw new Error('Unable to load auctions right now. Please try again.');
  }

  const raw = (await response.json()) as SpringPage<AuctionSummary>;
  const items = raw.content ?? [];

  return {
    items,
    page: raw.number ?? rest.page ?? 0,
    size: raw.size ?? rest.size ?? 9,
    totalPages: raw.totalPages ?? 0,
    totalElements: raw.totalElements ?? items.length,
  };
}

export interface AuctionDetail {
  auctionId: number;
  itemName: string;
  itemDescription: string;
  currentPrice: number;
  startPrice: number;
  auctionType: string;
  endsAt: string;
  remainingTime: string;
  highestBidderId: number | null;
  highestBidderName: string | null;
}

export async function fetchAuctionDetail(
  auctionId: number,
  signal?: AbortSignal,
): Promise<AuctionDetail> {
  const response = await fetch(`${NORMALIZED_BASE}/api/auction/${auctionId}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Auction ${auctionId} is unavailable right now.`);
  }

  return response.json() as Promise<AuctionDetail>;
}

export interface BidRequest {
  auctionId: number;
  amount: number;
}

export interface BidResponse {
  auctionId: number;
  newHighestBid: number;
  highestBidderId: number;
  highestBidderName: string;
  updatedAt: string;
  message: string;
}

export async function placeBid(payload: BidRequest): Promise<BidResponse> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${NORMALIZED_BASE}/api/auction/bid`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Unable to place bid.';
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<BidResponse>;
}

export async function fetchUserBids(signal?: AbortSignal): Promise<UserBidSummary[]> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${NORMALIZED_BASE}/api/auction/my-bids`, {
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Unable to load your bids right now. Please try again.');
  }

  return response.json() as Promise<UserBidSummary[]>;
}
