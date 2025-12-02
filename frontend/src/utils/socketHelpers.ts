import { API_BASE_URL } from '../api/config';

const NORMALIZED_BASE = API_BASE_URL.replace(/\/+$/, '');

export const WS_ENDPOINT = `${NORMALIZED_BASE}/ws`;

export interface BidUpdateMessage {
  auctionId: number;
  newHighestBid: number;
  highestBidderId: number;
  highestBidderName: string | null;
  message?: string;
}

export interface AuctionResultMessage {
  auctionId: number;
  winnerName: string | null;
  winningBid: number;
  status?: string;
  finalizedAt?: string;
}

export const isBidUpdateMessage = (payload: unknown): payload is BidUpdateMessage => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const value = payload as Record<string, unknown>;
  return (
    typeof value.auctionId === 'number' &&
    typeof value.newHighestBid === 'number' &&
    typeof value.highestBidderId === 'number' &&
    (typeof value.highestBidderName === 'string' || value.highestBidderName === null)
  );
};

export const isAuctionResultMessage = (payload: unknown): payload is AuctionResultMessage => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const value = payload as Record<string, unknown>;
  return (
    typeof value.auctionId === 'number' &&
    typeof value.winningBid === 'number' &&
    (typeof value.winnerName === 'string' || value.winnerName === null)
  );
};
