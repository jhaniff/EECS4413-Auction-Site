import { API_BASE_URL } from './config';

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
  const url = new URL('/auction/search', API_BASE_URL);
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
  const response = await fetch(buildSearchUrl(rest), { signal });

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
  const response = await fetch(`${API_BASE_URL}/auction/${auctionId}`, { signal });

  if (!response.ok) {
    throw new Error(`Auction ${auctionId} is unavailable right now.`);
  }

  return response.json() as Promise<AuctionDetail>;
}
